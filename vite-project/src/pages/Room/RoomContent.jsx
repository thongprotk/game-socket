import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomLayout from "../../assets/room-layout.png";
import { RouterName, PLAYER_POSITION, GAME_STATE } from "../../../constants";
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
    roomPlayers,
    socket,
  } = useRoom();

  // Local state
  const [inputRoomID, setInputRoomID] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  // Helper function để xác định trạng thái room
  const getRoomStatus = (room) => {
    if (room.gameInProgress)
      return { canJoin: false, status: "playing", text: "Đang Chơi" };
    if (room.reserved && room.activePlayers >= room.maxPlayers)
      return { canJoin: false, status: "reserved", text: "Đang Giữ Slot" };
    if (room.activePlayers >= room.maxPlayers && room.queueLength >= 10)
      return { canJoin: false, status: "full", text: "Đầy" };
    if (room.activePlayers >= room.maxPlayers)
      return { canJoin: true, status: "queue", text: "Vào Hàng Chờ" };
    return { canJoin: true, status: "available", text: "Chơi Ngay" };
  };

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

    if (!roomId?.trim()) {
      alert("Vui lòng nhập số phòng");
      return;
    }

    // Client-side check: Chỉ kiểm tra các trường hợp thực sự cần chặn
    const room = roomList?.find((r) => String(r.roomID) === String(roomId));
    if (room) {
      const roomStatus = getRoomStatus(room);

      if (!roomStatus.canJoin) {
        if (roomStatus.status === "playing") {
          alert("Phòng đang chơi, không thể tham gia");
        } else if (roomStatus.status === "reserved") {
          alert("Slot đang được giữ, vui lòng chờ 10 giây và thử lại");
        } else if (roomStatus.status === "full") {
          alert("Phòng đã đầy hoàn toàn, thử phòng khác");
        }
        return;
      }
    }

    console.log("Attempting to join room:", roomId);
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
      setTime(0);
    }
  }, [isWaiting]);
  // Clear waiting state when successfully positioned in room
  useEffect(() => {
    console.log("=== ROOM CONTENT STATE ===");
    console.log("isInRoom:", isInRoom);
    console.log("playerPosition:", playerPosition);
    console.log("playerNumber:", playerNumber);
    console.log("isWaiting:", isWaiting);
    console.log("activePlayers:", activePlayers);
    console.log("maxPlayers:", maxPlayers);

    if (
      isInRoom &&
      (playerPosition === PLAYER_POSITION.ACTIVE ||
        playerPosition === PLAYER_POSITION.QUEUE)
    ) {
      console.log(`Successfully positioned in room as: ${playerPosition}`);
      setIsWaiting(false);
    }
  }, [
    isInRoom,
    playerPosition,
    playerNumber,
    isWaiting,
    activePlayers,
    maxPlayers,
  ]);

  // Player number sync is now handled globally by PlayerNumberSync component

  // Handle game ready navigation
  useEffect(() => {
    if (
      isInRoom &&
      playerPosition === PLAYER_POSITION.ACTIVE &&
      gameState === GAME_STATE.IN_PROGRESS &&
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
      console.log("Room error:", error);
      // Xử lý các loại lỗi khác nhau
      if (error.includes("SLOT_RESERVED")) {
        alert(
          "Slot đang được giữ cho người chơi trước, vui lòng chờ 10 giây và thử lại"
        );
      } else if (error.includes("ROOM_NOT_FOUND")) {
        alert("Phòng không tồn tại, có thể đã bị xóa");
      } else if (error.includes("JOIN_ERROR")) {
        alert("Lỗi tham gia phòng, vui lòng thử lại");
      } else if (error.includes("CREATE_ERROR")) {
        alert("Lỗi tạo phòng, vui lòng thử lại");
      } else {
        alert(error);
      }
      clearError();
      setIsWaiting(false);
    }
  }, [error, clearError]);
  // Remove auto-ready logic - let users control their ready status
  // Reset waiting state when leaving room
  useEffect(() => {
    if (!isInRoom) {
      setIsWaiting(false);
      setTime(0);
      setInputRoomID("");
    }
  }, [isInRoom]);

  // Render room interface when successfully in room
  if (isInRoom && playerPosition === PLAYER_POSITION.ACTIVE) {
    return (
      <div className="room-content">
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
              {playerNumber && (
                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "14px",
                    color: "#28a745",
                  }}
                >
                  Bạn là Player {playerNumber}
                </div>
              )}

              {/* Hiển thị trạng thái ready của tất cả người chơi */}
              {roomPlayers && roomPlayers.length > 0 && (
                <div style={{ marginTop: "10px", fontSize: "13px" }}>
                  <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                    Trạng thái người chơi:
                  </div>
                  {roomPlayers
                    .filter((player) => player.isActive)
                    .map((player) => (
                      <div
                        key={player.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "2px 0",
                        }}
                      >
                        <span>
                          Player {player.playerNumber}
                          {player.id === socket?.id ? " (Bạn)" : ""}:
                        </span>
                        <span
                          style={{
                            color: player.ready ? "#28a745" : "#ffc107",
                            fontWeight: "bold",
                          }}
                        >
                          {player.ready ? "✓ Sẵn sàng" : "⏳ Chờ"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {activePlayers >= 2 && !gameInProgress && (
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <button
                  onClick={toggleReady}
                  style={{
                    padding: "8px 16px",
                    background: isReady ? "#28a745" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginBottom: "5px",
                  }}
                >
                  {isReady ? "Sẵn sàng" : "Chấp nhận"}
                </button>
                {/* Thông báo khi người khác đã ready */}
                {!isReady &&
                  roomPlayers &&
                  roomPlayers.some(
                    (p) => p.isActive && p.id !== socket?.id && p.ready
                  ) && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#ffc107",
                        fontStyle: "italic",
                        marginTop: "5px",
                      }}
                    >
                      ⚡ Người chơi khác đã sẵn sàng!
                    </div>
                  )}
              </div>
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
              Rời phòng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render queue interface when in queue
  if (isInRoom && playerPosition === PLAYER_POSITION.QUEUE) {
    return (
      <div className="room-content">
        <div
          className="queue-waiting"
          style={{ textAlign: "center", color: "white" }}
        >
          <div style={{ fontSize: "18px", marginBottom: "10px" }}>
            🕐 Đang chờ trong hàng đợi
          </div>
          <div style={{ fontSize: "16px", color: "#ffa500" }}>
            Vị trí: {queuePosition}
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px" }}>
            Room ID: {roomID}
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", opacity: 0.8 }}>
            Bạn sẽ được thăng cấp khi có slot trống
          </div>
          <button
            onClick={() => {
              setIsWaiting(false);
              leaveRoom();
            }}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              background: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Rời hàng đợi
          </button>
        </div>
      </div>
    );
  }

  // Render loading state when joining room
  if (isWaiting && isInRoom) {
    return (
      <div className="room-content">
        <div style={{ color: "white", textAlign: "center" }}>
          <div>Đang vào phòng...</div>
          <div style={{ marginTop: "10px", fontSize: "12px" }}>
            Vui lòng đợi trong giây lát
          </div>
          <button
            onClick={() => {
              setIsWaiting(false);
              leaveRoom();
            }}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
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

        <button
          className="refresh-rooms"
          onClick={() => window.location.reload()}
          disabled={isWaiting}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Làm Mới Danh Sách
        </button>

        <button
          onClick={() => {
            console.log("=== MANUAL STATE CHECK ===");
            console.log("Current state:", {
              isInRoom,
              playerPosition,
              playerNumber,
              isWaiting,
              activePlayers,
              maxPlayers,
              roomID,
              gameState,
            });
            console.log("Constants:", {
              PLAYER_POSITION_ACTIVE: PLAYER_POSITION.ACTIVE,
              PLAYER_POSITION_QUEUE: PLAYER_POSITION.QUEUE,
              GAME_STATE_IN_PROGRESS: GAME_STATE.IN_PROGRESS,
            });
          }}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            background: "#ff9500",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Debug State
        </button>

        {/* Debug info */}
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            color: "white",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            fontSize: "12px",
          }}
        >
          <div>
            <strong>Debug Info:</strong>
          </div>
          <div>isInRoom: {isInRoom ? "true" : "false"}</div>
          <div>playerPosition: {playerPosition}</div>
          <div>playerNumber: {playerNumber}</div>
          <div>isWaiting: {isWaiting ? "true" : "false"}</div>
          <div>
            activePlayers: {activePlayers}/{maxPlayers}
          </div>
          <div>roomID: {roomID || "none"}</div>
          <div>roomPlayers count: {roomPlayers?.length || 0}</div>
          {roomPlayers && roomPlayers.length > 0 && (
            <div style={{ marginTop: "5px" }}>
              <strong>Room Players:</strong>
              {roomPlayers.map((p) => (
                <div
                  key={p.id}
                  style={{ fontSize: "10px", marginLeft: "10px" }}
                >
                  {p.id.substr(-4)}: {p.isActive ? "active" : "queue"}
                  {p.playerNumber ? ` #${p.playerNumber}` : ""}
                  {p.ready ? " ✓" : " ⏳"}
                </div>
              ))}
            </div>
          )}
        </div>

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
            roomList.map((room) => {
              const roomStatus = getRoomStatus(room);
              const buttonColor = {
                playing: "#B91A3F",
                reserved: "#FFA500",
                full: "#B91A3F",
                queue: "#4CAF50",
                available: "#4CAF50",
              };

              return (
                <div className="room" key={room.roomID}>
                  <div className="number-room">Room: {room.roomID}</div>
                  <img src={RoomLayout} alt="Room Layout" />
                  <div style={{ color: "white", fontSize: "14px" }}>
                    Người chơi: {room.activePlayers}/{room.maxPlayers}{" "}
                    {room.queueLength > 0 && ` | Đợi: ${room.queueLength}`}
                    {room.reserved &&
                      room.activePlayers >= room.maxPlayers &&
                      " | Slot đang giữ"}
                  </div>
                  <button
                    className="button-run"
                    style={{ backgroundColor: buttonColor[roomStatus.status] }}
                    onClick={() => handleJoinRoom(room.roomID)}
                    disabled={isWaiting || !roomStatus.canJoin}
                  >
                    {roomStatus.text}
                  </button>
                </div>
              );
            })
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
