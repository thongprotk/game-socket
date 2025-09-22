import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

const RoomContext = createContext(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};

const SOCKET_EVENTS = {
  // Room management
  ROOM_CREATED: "room-created",
  PLAYER_JOINED: "playerJoined",
  PLAYER_RECONNECTED: "playerReconnected",
  PLAYER_LEFT: "playerLeft",
  PLAYER_DISCONNECTED: "playerDisconnected",
  ROOM_STATUS: "roomStatus",
  ROOM_LIST: "room-list",

  // Game flow
  GAME_READY: "gameReady",
  GAME_STARTED: "gameStarted",
  GAME_INTERRUPTED: "gameInterrupted",
  ROUND_FINISHED: "roundFinished",
  WAITING_FOR_CHOICES: "waitingForChoices",

  // Player actions
  PLAYER_READY: "playerReady",
  PLAYER_CHOICE: "playerChoice",

  // Queue management
  PROMOTED_TO_ACTIVE: "promotedToActive",
  MOVED_TO_QUEUE: "movedToQueue",

  // Settings
  SETTINGS_UPDATED: "settingsUpdated",

  // Error handling
  ERROR: "err",

  // Outgoing events
  JOIN_ROOM: "joinRoom",
  EXIT_ROOM: "exitRoom",
  PLAYER_READY_TOGGLE: "playerReady",
  SEND_CHOICE: "playerChoice",
  UPDATE_SETTINGS: "updateRoomSettings",
};

const PLAYER_POSITION = {
  ACTIVE: "active",
  QUEUE: "queue",
  UNKNOWN: "unknown",
};

const GAME_STATE = {
  WAITING: "waiting",
  READY: "ready",
  IN_PROGRESS: "in_progress",
  FINISHED: "finished",
  INTERRUPTED: "interrupted",
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

  // Error handling
  error: null,
};

export const RoomProvider = ({ socket, children }) => {
  const [state, setState] = useState(initialState);

  // Utility functions
  const updateState = useCallback((updates) => {
    setState((prevState) => ({ ...prevState, ...updates }));
  }, []);

  const updateNestedState = useCallback((key, updates) => {
    setState((prevState) => ({
      ...prevState,
      [key]: { ...prevState[key], ...updates },
    }));
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
      updateState({
        roomID: data.roomID,
        isInRoom: true,
        playerPosition: data.position,
        playerNumber: data.playerNumber || null,
        queuePosition: data.queuePosition || null,
        playerId: socket?.id,
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

      updateState({
        activePlayers: data.activePlayers,
        maxPlayers: data.maxPlayers,
        queueLength: data.queueLength,
        totalPlayers: data.players.length,
        gameInProgress: data.gameInProgress,
        roomPlayers: data.players,
        isReady: currentPlayer?.ready || false,
        playerPosition: currentPlayer?.isActive
          ? PLAYER_POSITION.ACTIVE
          : currentPlayer?.inQueue
          ? PLAYER_POSITION.QUEUE
          : PLAYER_POSITION.UNKNOWN,
        playerNumber: currentPlayer?.isActive
          ? data.players
              .filter((p) => p.isActive)
              .findIndex((p) => p.id === socket?.id) + 1
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

  const handleSettingsUpdated = useCallback(
    (data) => {
      updateState({
        settings: data.settings,
      });
    },
    [updateState]
  );

  const handlePlayerLeft = useCallback((data) => {
    // Room status will be updated via handleRoomStatus
    console.log("Player left:", data.socketId);
  }, []);

  const handlePlayerDisconnected = useCallback((data) => {
    // Room status will be updated via handleRoomStatus
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

    // Update connection status
    const handleConnect = () => updateState({ isConnected: true });
    const handleDisconnect = () =>
      updateState({
        isConnected: false,
        gameInProgress: false,
      });

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
  ]);

  // Action functions
  const createRoom = useCallback(
    (roomID) => {
      if (!socket || !socket.connected) {
        updateState({ error: "Không có kết nối socket" });
        return;
      }

      const normalizedRoomID = String(roomID);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, normalizedRoomID);
      updateState({ error: null });
    },
    [socket, updateState]
  );

  const joinRoom = useCallback(
    (roomID) => {
      if (!socket || !socket.connected) {
        updateState({ error: "Không có kết nối socket" });
        return;
      }

      const normalizedRoomID = String(roomID);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, normalizedRoomID);
      updateState({ error: null });
    },
    [socket, updateState]
  );

  const leaveRoom = useCallback(() => {
    if (!socket || !state.roomID) return;

    socket.emit("exitRoom", state.roomID);
    setState(initialState);
  }, [socket, state.roomID]);

  const toggleReady = useCallback(() => {
    if (!socket || !state.roomID) return;

    socket.emit(SOCKET_EVENTS.PLAYER_READY_TOGGLE, state.roomID);
  }, [socket, state.roomID]);

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

  const getRoomList = useCallback(() => {
    if (!socket) return;
  }, [socket]);

  // Computed properties
  const computedValues = useMemo(
    () => ({
      isActivePlayer: state.playerPosition === PLAYER_POSITION.ACTIVE,
      isInQueue: state.playerPosition === PLAYER_POSITION.QUEUE,
      canPlay:
        state.playerPosition === PLAYER_POSITION.ACTIVE &&
        !state.gameInProgress,
      canReady:
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
      getRoomList,
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
      getRoomList,
      socket,
    ]
  );

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
