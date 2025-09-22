import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomLayout from "../../assets/room-layout.png";
import { RouterName } from "../../../constants";
import { useRoom } from "../Context/RoomContext";

export default function RoomContent() {
  const navigate = useNavigate();

  // Destructure từ RoomContext
  const {
    roomID,
    roomList,
    roomPlayers,
    isInRoom,
    isActivePlayer,
    isInQueue,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    sendChoice,
    updateRoomSettings,
    clearError,
    getRoomList,
    gameState,
    gameInProgress,
    activePlayers,
    maxPlayers,
    queueLength,
    totalPlayers,
    settings,
    playerPosition,
    playerNumber,
    queuePosition,
    isReady,
    lastResults,
    waitingForChoices,
    socket,
  } = useRoom();

  // Local state
  const [inputRoomID, setInputRoomID] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  // Tạo phòng mới
  const handleCreateRoom = () => {
    const newRoomID = Math.floor(1 + Math.random() * 9).toString();
    setInputRoomID(newRoomID);
    createRoom(newRoomID);
    setIsWaiting(true);
  };

  // Tham gia phòng
  const handleJoinRoom = (roomIdToJoin) => {
    const roomId = roomIdToJoin || inputRoomID;

    if (!roomId.trim()) {
      alert("Vui lòng nhập số phòng");
      return;
    }

    joinRoom(roomId);
    setIsWaiting(true);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    handleJoinRoom();
  };

  // Socket event listeners cho room list
  useEffect(() => {
    if (!socket) return;

    // Request initial room list on component mount
    const getInitialRoomList = () => {
      // Backend sẽ tự động emit room-list khi connect, không cần gọi thêm
    };

    getInitialRoomList();
  }, [socket]);

  // Handle game ready navigation
  useEffect(() => {
    // Navigate when game actually starts (not just ready)
    if (
      isInRoom &&
      playerPosition === "active" &&
      gameState === "in_progress" &&
      roomID &&
      playerNumber
    ) {
      setIsWaiting(false);

      const fightUrl = RouterName.FIGHT.replace(":roomID", roomID).replace(
        ":player",
        playerNumber.toString()
      );

      navigate(fightUrl);
    }
  }, [isInRoom, playerPosition, gameState, roomID, playerNumber, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      alert(error);
      clearError();
      setIsWaiting(false);
    }
  }, [error, clearError]);

  // Reset waiting state when leaving room
  useEffect(() => {
    if (!isInRoom) {
      setIsWaiting(false);
    }
  }, [isInRoom]);

  // Render waiting state
  if (isWaiting && isInRoom) {
    return (
      <div className="room-content">
        <div className="text-content">
          {playerPosition === "active" ? (
            <div>
              <div>Waiting For Player...</div>
              <div style={{ marginTop: "10px", fontSize: "14px" }}>
                Room ID: {roomID}
              </div>
              <div style={{ marginTop: "5px", fontSize: "12px" }}>
                Người chơi hiện tại: {activePlayers}/{maxPlayers}
              </div>
              {activePlayers >= 2 && !gameInProgress && (
                <button
                  onClick={toggleReady}
                  style={{
                    marginTop: "10px",
                    padding: "8px 16px",
                    background: isReady ? "#28a745" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  {isReady ? "✓ Ready" : "Ready?"}
                </button>
              )}
            </div>
          ) : playerPosition === "queue" ? (
            <div>
              <div>Bạn đang ở hàng đợi (vị trí {queuePosition})</div>
              <div style={{ marginTop: "10px", fontSize: "14px" }}>
                Room ID: {roomID}
              </div>
            </div>
          ) : (
            "Đang vào phòng..."
          )}

          <button
            onClick={() => {
              setIsWaiting(false);
              leaveRoom();
            }}
            style={{
              marginTop: "10px",
              padding: "5px 10px",
              background: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  // Render main content
  return (
    <div className="room-content">
      <div className="input-room">
        <form className="form-join-room" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nhập ID phòng muốn chơi"
            className="input-id-room"
            value={inputRoomID}
            onChange={(e) => setInputRoomID(e.target.value)}
            disabled={isWaiting}
          />
          <button
            className="join-room"
            type="submit"
            disabled={isWaiting || !inputRoomID.trim()}
          >
            Tham Gia
          </button>
        </form>

        <button
          className="create-room"
          onClick={handleCreateRoom}
          disabled={isWaiting}
        >
          Tạo Phòng
        </button>

        {/* Error display */}
        {error && (
          <div
            style={{
              color: "red",
              marginTop: "10px",
              padding: "10px",
              background: "rgba(255,0,0,0.1)",
              borderRadius: "5px",
            }}
          >
            {error}
          </div>
        )}

        {/* Available rooms */}
        <div className="container">
          {roomList && roomList.length > 0 ? (
            roomList.map((room) => (
              <div className="room" key={room.roomID}>
                <div className="number-room">Room: {room.roomID}</div>
                <img src={RoomLayout} alt="Room Layout" />
                <div style={{ color: "white", fontSize: "14px" }}>
                  Người chơi: {room.activePlayers}/{room.maxPlayers}
                  {room.queueLength > 0 && ` | Đợi: ${room.queueLength}`}
                </div>
                <button
                  className="button-run"
                  style={
                    room.gameInProgress
                      ? { backgroundColor: "#B91A3F" }
                      : { backgroundColor: "#4CAF50" }
                  }
                  onClick={() => handleJoinRoom(room.roomID)}
                  disabled={isWaiting || room.gameInProgress}
                >
                  {room.gameInProgress ? "Đang Chơi" : "Chơi Ngay"}
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: "white", fontSize: "20px" }}>
              Không có phòng nào
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
