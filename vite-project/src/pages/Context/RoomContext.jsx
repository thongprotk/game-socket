import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { SOCKET_EVENTS, PLAYER_POSITION, GAME_STATE } from "../../../constants";
const RoomContext = createContext(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};

const initialState = {
  // Room info
  roomID: null,
  isConnected: false,
  isInRoom: false,

  // Player info
  playerId: null,
  playerPosition: PLAYER_POSITION.UNKNOWN,
  playerNumber: null,
  queuePosition: null,
  isReady: false,
  hasReservedSlots: false,
  isWaitingForPlayAgain: false,
  playAgainVotes: [],
  playAgainNeeded: 0,
  // Room status
  activePlayers: 0,
  maxPlayers: 2,
  queueLength: 0,
  totalPlayers: 0,

  // Game state
  gameState: GAME_STATE.WAITING,
  gameInProgress: false,
  currentRound: 0,
  lastResults: null,
  waitingForChoices: 0,

  // Room settings
  settings: {
    maxPlayers: 2,
    rotatePlayersAfterRound: false,
  },

  // Room list and players
  roomList: [],
  roomPlayers: [],
  lastWinner: null,
  playerChoices: {},

  // Error handling
  error: null,
};

export const RoomProvider = ({ socket, children }) => {
  const [state, setState] = useState(initialState);

  // Utility functions
  const updateState = useCallback((updates) => {
    setState((prevState) => ({ ...prevState, ...updates }));
  }, []);

  // Socket event handlers
  const handleRoomCreated = useCallback(
    (roomID) => {
      updateState({
        roomID: String(roomID),
        isInRoom: true,
        error: null,
      });
    },
    [updateState]
  );

  const handlePlayerJoined = useCallback(
    (data) => {
      // console.log("=== PLAYER JOINED EVENT ===");
      // console.log("Event data:", data);
      // console.log("Socket ID:", socket?.id);

      const newPlayerNumber =
        data.position === "active" ? data.playerNumber ?? null : null;

      if (data.position === "active" && newPlayerNumber) {
        console.log(
          `[PLAYER_NUMBER_UPDATE] Player assigned number: ${newPlayerNumber}`
        );
      }

      updateState({
        roomID: String(data.roomID),
        isInRoom: true,
        playerPosition:
          data.position === "active"
            ? PLAYER_POSITION.ACTIVE
            : data.position === "queue"
            ? PLAYER_POSITION.QUEUE
            : PLAYER_POSITION.UNKNOWN,
        playerNumber: newPlayerNumber,
        queuePosition:
          data.position === "queue" ? data.queuePosition ?? null : null,
        isReady: false,
        playerId: socket?.id,
        error: null,
      });
    },
    [updateState, socket?.id]
  );

  const handlePlayerReconnected = useCallback(
    (data) => {
      updateState({
        roomID: data.roomID,
        isInRoom: true,
        playerPosition: data.position,
        playerId: socket?.id,
      });
    },
    [updateState, socket?.id]
  );

  const handleRoomStatus = useCallback(
    (data) => {
      const currentPlayer = data.players.find((p) => p.id === socket?.id);

      // console.log("=== ROOM STATUS UPDATE ===");
      // console.log("Room data:", data);
      // console.log("Current player:", currentPlayer);
      // console.log("Socket ID:", socket?.id);

      const newPosition = currentPlayer?.isActive
        ? PLAYER_POSITION.ACTIVE
        : currentPlayer?.inQueue
        ? PLAYER_POSITION.QUEUE
        : PLAYER_POSITION.UNKNOWN;

      console.log("Calculated position:", newPosition);
      console.log(
        "Player number:",
        currentPlayer?.isActive ? currentPlayer.playerNumber : null
      );

      updateState({
        activePlayers: data.activePlayers,
        maxPlayers: data.maxPlayers,
        queueLength: data.queueLength,
        totalPlayers: data.players.length,
        gameInProgress: data.gameInProgress,
        hasReserved: data.reserved || false,
        roomPlayers: data.players,
        isReady: currentPlayer?.ready || false,
        playerPosition: newPosition,
        playerNumber: currentPlayer?.isActive
          ? currentPlayer.playerNumber
          : null,
        queuePosition: currentPlayer?.inQueue
          ? data.players
              .filter((p) => p.inQueue)
              .findIndex((p) => p.id === socket?.id) + 1
          : null,
      });
    },
    [updateState, socket?.id]
  );

  const handleGameReady = useCallback(
    (data) => {
      updateState({
        gameState: GAME_STATE.READY,
        gameInProgress: false,
      });
    },
    [updateState]
  );

  const handleGameStarted = useCallback(
    (data) => {
      updateState({
        gameState: GAME_STATE.IN_PROGRESS,
        gameInProgress: true,
        currentRound: data.round,
        waitingForChoices: 0,
      });
    },
    [updateState]
  );

  const handleGameInterrupted = useCallback(
    (data) => {
      updateState({
        gameState: GAME_STATE.INTERRUPTED,
        gameInProgress: false,
        error: `Game bị gián đoạn: ${data.reason}`,
      });
    },
    [updateState]
  );

  const handleRoundFinished = useCallback(
    (data) => {
      updateState({
        gameState: GAME_STATE.FINISHED,
        gameInProgress: false,
        lastResults: data.results,
        currentRound: data.round,
      });
    },
    [updateState]
  );

  const handleWaitingForChoices = useCallback(
    (data) => {
      updateState({
        waitingForChoices: data.madeChoices,
      });
    },
    [updateState]
  );

  const handlePromotedToActive = useCallback(
    (data) => {
      updateState({
        playerPosition: PLAYER_POSITION.ACTIVE,
        playerNumber: data.playerNumber,
        queuePosition: null,
      });
    },
    [updateState]
  );

  const handleMovedToQueue = useCallback(
    (data) => {
      updateState({
        playerPosition: PLAYER_POSITION.QUEUE,
        playerNumber: null,
        queuePosition: data.queuePosition,
        isReady: false,
      });
    },
    [updateState]
  );
  const handlePlayAgain = useCallback(
    (data) => {
      updateState({
        gameState: GAME_STATE.WAITING,
        isWaitingForPlayAgain: true,
        playAgainNeeded: data.players?.length || 2,
        playAgainVotes: [],
        currentRound: data.round,
      });
    },
    [updateState]
  );
  const handlePlayerVote = useCallback(
    (data) => {
      updateState({
        playAgainVotes: data.votes || [],
        playAgainNeeded: data.needed || 2,
      });
    },
    [updateState]
  );

  const handleRemovedForNoPlay = useCallback(
    (data) => {
      updateState({
        playerPosition: PLAYER_POSITION.QUEUE,
        playerNumber: null,
        isReady: false,
        error: "Bạn đã bị chuyển vào hàng đợi vì không chọn chơi tiếp",
      });
    },
    [updateState]
  );

  const handleSettingsUpdated = useCallback(
    (data) => {
      updateState({
        settings: data.settings,
      });
    },
    [updateState]
  );

  const handlePlayerLeft = useCallback((data) => {
    console.log("Player left:", data.socketId);
  }, []);

  const handlePlayerDisconnected = useCallback((data) => {
    console.log("Player disconnected:", data.socketId);
  }, []);

  const handleRoomList = useCallback(
    (roomList) => {
      updateState({ roomList });
    },
    [updateState]
  );

  const handleError = useCallback(
    (error) => {
      updateState({
        error: error.message || "Có lỗi xảy ra",
        gameInProgress: false,
      });
    },
    [updateState]
  );

  // Socket event listeners setup
  useEffect(() => {
    if (!socket) return;

    // console.log("=== SETTING UP SOCKET LISTENERS ===");
    // console.log("Socket connected:", socket.connected);
    // console.log("Socket ID:", socket.id);

    // Update connection status
    const handleConnect = () => {
      // console.log("=== SOCKET CONNECTED ===");
      // console.log("Socket ID:", socket.id);
      updateState({ isConnected: true });
    };
    const handleDisconnect = () => {
      // console.log("=== SOCKET DISCONNECTED ===");
      updateState({
        isConnected: false,
        gameInProgress: false,
      });
    };

    const eventHandlers = {
      connect: handleConnect,
      disconnect: handleDisconnect,
      [SOCKET_EVENTS.ROOM_CREATED]: handleRoomCreated,
      [SOCKET_EVENTS.PLAYER_JOINED]: handlePlayerJoined,
      [SOCKET_EVENTS.PLAYER_RECONNECTED]: handlePlayerReconnected,
      [SOCKET_EVENTS.ROOM_STATUS]: handleRoomStatus,
      [SOCKET_EVENTS.GAME_READY]: handleGameReady,
      [SOCKET_EVENTS.GAME_STARTED]: handleGameStarted,
      [SOCKET_EVENTS.GAME_INTERRUPTED]: handleGameInterrupted,
      [SOCKET_EVENTS.ROUND_FINISHED]: handleRoundFinished,
      [SOCKET_EVENTS.WAITING_FOR_CHOICES]: handleWaitingForChoices,
      [SOCKET_EVENTS.PROMOTED_TO_ACTIVE]: handlePromotedToActive,
      [SOCKET_EVENTS.MOVED_TO_QUEUE]: handleMovedToQueue,
      [SOCKET_EVENTS.SETTINGS_UPDATED]: handleSettingsUpdated,
      [SOCKET_EVENTS.PLAYER_LEFT]: handlePlayerLeft,
      [SOCKET_EVENTS.PLAYER_DISCONNECTED]: handlePlayerDisconnected,
      [SOCKET_EVENTS.ROOM_LIST]: handleRoomList,
      [SOCKET_EVENTS.ERROR]: handleError,
      [SOCKET_EVENTS.PLAY_AGAIN]: handlePlayAgain,
      [SOCKET_EVENTS.PLAY_AGAIN_VOTE]: handlePlayerVote,
      [SOCKET_EVENTS.REMOVED_FOR_NO_PLAY]: handleRemovedForNoPlay,
    };

    // Register all event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Set initial connection status
    updateState({ isConnected: socket.connected });

    // Cleanup function
    return () => {
      Object.keys(eventHandlers).forEach((event) => {
        socket.off(event);
      });
    };
  }, [
    socket,
    updateState,
    handleRoomCreated,
    handlePlayerJoined,
    handlePlayerReconnected,
    handleRoomStatus,
    handleGameReady,
    handleGameStarted,
    handleGameInterrupted,
    handleRoundFinished,
    handleWaitingForChoices,
    handlePromotedToActive,
    handleMovedToQueue,
    handleSettingsUpdated,
    handlePlayerLeft,
    handlePlayerDisconnected,
    handleRoomList,
    handleError,
    handlePlayAgain,
    handlePlayerVote,
    handleRemovedForNoPlay,
  ]);

  // Action functions
  const createRoom = useCallback(
    (roomID) => {
      if (!socket || !socket.connected) {
        console.log("Cannot create room - no socket connection");
        updateState({ error: "Không có kết nối socket" });
        return;
      }

      // console.log("=== CREATING ROOM ===");
      // console.log("Room ID:", roomID);
      // console.log("Socket connected:", socket.connected);
      // console.log("Socket ID:", socket.id);

      const normalizedRoomID = String(roomID);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, normalizedRoomID);
      updateState({ error: null });
    },
    [socket, updateState]
  );

  const joinRoom = useCallback(
    (roomID) => {
      if (!socket || !socket.connected) {
        console.log("Cannot join room - no socket connection");
        updateState({ error: "Không có kết nối socket" });
        return;
      }

      // console.log("=== JOINING ROOM ===");
      // console.log("Room ID:", roomID);
      // console.log("Socket connected:", socket.connected);
      // console.log("Socket ID:", socket.id);

      const normalizedRoomID = String(roomID);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, normalizedRoomID);
      updateState({ error: null });
    },
    [socket, updateState]
  );

  const leaveRoom = useCallback(() => {
    if (!socket || !state.roomID) return;

    // console.log("=== LEAVING ROOM ===");
    // console.log("Room ID:", state.roomID);
    // console.log("Socket connected:", socket.connected);

    // Emit exit room event to server
    socket.emit("exitRoom", state.roomID);

    // Reset state but preserve connection status
    const resetState = {
      ...initialState,
      isConnected: socket.connected, // Preserve actual connection status
    };
    setState(resetState);

    // Clear any error state
    updateState({ error: null });
  }, [socket, state.roomID, updateState]);

  const toggleReady = useCallback(() => {
    if (!socket || !state.roomID) return;

    // console.log(
    //   `[FRONTEND] Toggle ready called - Current ready state: ${state.isReady}`
    // );
    // console.log(
    //   `[FRONTEND] Room ID: ${state.roomID}, Socket connected: ${socket.connected}`
    // );

    socket.emit(SOCKET_EVENTS.PLAYER_READY_TOGGLE, state.roomID);
  }, [socket, state.roomID, state.isReady]);

  const sendChoice = useCallback(
    (choice) => {
      if (!socket || !state.roomID || !state.gameInProgress) return;

      socket.emit(SOCKET_EVENTS.SEND_CHOICE, {
        roomID: state.roomID,
        choice: choice,
      });
    },
    [socket, state.roomID, state.gameInProgress]
  );

  const updateRoomSettings = useCallback(
    (settings) => {
      if (!socket || !state.roomID) return;

      socket.emit(SOCKET_EVENTS.UPDATE_SETTINGS, {
        roomID: state.roomID,
        settings: settings,
      });
    },
    [socket, state.roomID]
  );

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // const getRoomList = useCallback(() => {
  //   if (!socket) return;
  // }, [socket]);

  // Computed properties
  const computedValues = useMemo(
    () => ({
      isActivePlayer: state.playerPosition === PLAYER_POSITION.ACTIVE,
      isInQueue: state.playerPosition === PLAYER_POSITION.QUEUE,
      canInteract:
        state.playerPosition === PLAYER_POSITION.ACTIVE &&
        !state.gameInProgress,
      canMakeChoice:
        state.playerPosition === PLAYER_POSITION.ACTIVE && state.gameInProgress,
      isRoomFull: state.activePlayers >= state.maxPlayers,
      allPlayersReady: state.roomPlayers
        .filter((p) => p.isActive)
        .every((p) => p.ready),
      gameCanStart:
        state.activePlayers >= 2 &&
        state.roomPlayers.filter((p) => p.isActive).every((p) => p.ready),
      hasVotedPlayAgain: state.playAgainVotes.includes(state.playerId),
      allVotedPlayAgain: state.playAgainVotes.length === state.playAgainNeeded,
      canPlayAgain:
        state.gameState === GAME_STATE.FINISHED &&
        state.playerPosition === PLAYER_POSITION.ACTIVE,
    }),
    [state]
  );

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      ...state,
      ...computedValues,
      // Actions
      createRoom,
      joinRoom,
      leaveRoom,
      toggleReady,
      sendChoice,
      updateRoomSettings,
      clearError,
      // getRoomList,
      socket,
      PLAYER_POSITION,
      GAME_STATE,
    }),
    [
      state,
      computedValues,
      createRoom,
      joinRoom,
      leaveRoom,
      toggleReady,
      sendChoice,
      updateRoomSettings,
      clearError,
      // getRoomList,
      socket,
    ]
  );

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
