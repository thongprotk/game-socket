import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomLayout from "../../assets/room-layout.png";
import { RouterName } from "../../../constants";
import { useRoom } from "../Context/RoomContext";

export default function RoomContent() {
  const navigate = useNavigate();
  const [time, setTime] = useState(0);
  // Destructure từ RoomContext
  const {
    roomID,
    roomList,
    isInRoom,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    clearError,
    gameState,
    gameInProgress,
    activePlayers,
    maxPlayers,
    playerPosition,
    playerNumber,
    queuePosition,
    isReady,
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
    setTime(60);
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

  // Timer effect
  useEffect(() => {
    if (isWaiting && time > 0) {
      const timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      // Xóa timer khi component bị unmount hoặc thời gian kết thúc
      return () => clearInterval(timer);
    }
    // Khi hết thời gian
    if (time === 0 && !isInRoom && !gameInProgress) {
      setIsWaiting(false);
      if (isInRoom) {
        leaveRoom();
      }
    }
  }, [isWaiting, time, isInRoom, gameInProgress, leaveRoom]);

  // Reset timer when entering waiting state
  useEffect(() => {
    if (isWaiting) {
      setTime(60); // Reset về 60 giây khi bắt đầu chờ
    } else {
      setTime(0); // Reset về 0 khi không chờ nữa
    }
  }, [isWaiting]);
  // Handle game ready navigation
  useEffect(() => {
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
      setTime(0);
    }
  }, [isInRoom]);

  // Render waiting state
  if (isWaiting && isInRoom) {
    return (
      <div className="room-content">
        {playerPosition === "active" ? (
          <div className="time-active">
            <div className="timeLoading"></div>
            <div className="click-end-active">
              <div style={{ fontWeight: "bolder" }}> {time} </div>
              <div className="info-room">
                {activePlayers >= maxPlayers
                  ? "Bắt đầu trận đấu"
                  : "Chờ người chơi..."}
                <div style={{ marginTop: "10px", fontSize: "14px" }}>
                  Room ID: {roomID}
                </div>
                <div style={{ marginTop: "5px", fontSize: "14px" }}>
                  Người chơi hiện tại: {activePlayers}/{maxPlayers}
                </div>
              </div>
              {activePlayers >= 2 && !gameInProgress && (
                <button
                  onClick={toggleReady}
                  style={{
                    textAlign: "center",
                    padding: "8px 16px",
                    background: isReady ? "#28a745" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {isReady ? "Sẵn sàng" : "Chấp nhận"}
                </button>
              )}
              <button
                onClick={() => {
                  setIsWaiting(false);
                  leaveRoom();
                }}
                style={{
                  textAlign: "center",
                  padding: "8px 16px",
                  background: "#ff4444",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Hủy tham gia
              </button>
            </div>
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
                  Người chơi: {room.activePlayers}/{room.maxPlayers}{" "}
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
