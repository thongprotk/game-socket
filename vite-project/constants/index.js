export const RouterName = {
  HOME: "/",
  FIGHT: "/fight/:roomID/:player",
  FIGHTBOT: "/fightbot",
  ROOM: "/room",
  RESULT: "/historyResult",
  AUTH: "/auth",
  GOOGLE: "/auth/google",
};

export const SOCKET_EVENTS = {
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

  //play again
  PLAY_AGAIN: "playAgain",
  PLAY_AGAIN_VOTE: "playAgainVote",
  PLAYER_CLICKED: "playerClicked",
  REMOVED_FOR_NO_PLAY: "removedForNoPlay",
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

export const PLAYER_POSITION = {
  ACTIVE: "active",
  QUEUE: "queue",
  UNKNOWN: "unknown",
};
export const GAME_STATE = {
  WAITING: "waiting",
  READY: "ready",
  IN_PROGRESS: "in_progress",
  FINISHED: "finished",
  INTERRUPTED: "interrupted",
};


