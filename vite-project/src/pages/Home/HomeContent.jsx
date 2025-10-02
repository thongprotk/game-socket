import ButtonUserVsUser from "../../assets/user-vs-user.png";
import ButtonUserVsBot from "../../assets/User-vs-Bot.png";
// import Vs from "../../assets/vs.png";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RouterName } from "../../../constants";
import { useRoom } from "../Context/RoomContext";
export default function HomeContent() {
  const navigate = useNavigate();
  const {
    joinRoom,
    leaveRoom,
    isInRoom,
    socket,
    roomID,
    playerNumber,
    playerPosition,
    gameState,
    gameInProgress,
    error,
    isConnected,
    isReady,
    maxPlayers,
    activePlayers,
    clearError,
    toggleReady,
  } = useRoom();
  const [time, setTime] = useState(0);
  const [isSearching, setIsSearching] = useState(false); // Trạng thái tìm trận
  const [isRoomID] = useState("112");
  const handleStartBot = () => {
    navigate(RouterName.FIGHTBOT);
  };
  // const token = new URLSearchParams(window.location.search).get("token");
  // if (token) {
  //   const user = JSON.parse(token);
  //   console.log("user", user);
  // }
  const handleRoom = () => {
    navigate(RouterName.ROOM);
  };
  useEffect(() => {
    if (isSearching && time > 0) {
      const timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      // Xóa timer khi component bị unmount hoặc thời gian kết thúc
      return () => clearInterval(timer);
    }
    // Khi hết thời gian
    if (time === 0 && isSearching) {
      setIsSearching(false);
      if (isInRoom) {
        console.log("Leaving room due to timeout");
        leaveRoom();
      }
    }
  }, [isSearching, time]);
  const startSearch = () => {
    if (!isConnected) {
      return;
    }
    setIsSearching(false);
    setTime(0);

    if (isInRoom) {
      leaveRoom();
    }

    setTimeout(() => {
      setIsSearching(true);
      setTime(60); // Đặt thời gian tìm trận là 60 giây
      joinRoom(isRoomID);
    }, 100);
  };

  useEffect(() => {
    if (
      isInRoom &&
      roomID &&
      isSearching &&
      playerPosition === "active" &&
      gameState === "in_progress"
    ) {
      setIsSearching(false);
      navigate(
        `${RouterName.FIGHT.replace(":roomID", roomID).replace(
          ":player",
          playerNumber.toString()
        )}`
      );
    }
  }, [
    navigate,
    isInRoom,
    roomID,
    isSearching,
    playerNumber,
    playerPosition,
    gameState,
  ]);
  useEffect(() => {
    if (isSearching && error) {
      console.log("=== SEARCH ERROR ===");
      console.log("Error:", error);
      setIsSearching(false);
      clearError();
    }
  }, [error, isSearching, clearError]);

  // Hàm kết thúc tìm trận
  const matchEnd = () => {
    setIsSearching(false);
    setTime(0);

    if (isInRoom) {
      leaveRoom();
    }

    // Clear any errors
    if (error) {
      clearError();
    }

    navigate(RouterName.HOME);
  };
  useEffect(() => {
    if (activePlayers >= maxPlayers && !isReady && !gameInProgress) {
      console.log("Auto-toggling ready:", {
        activePlayers,
        maxPlayers,
        isReady,
        gameInProgress,
      });
      toggleReady();
    }
  }, [activePlayers, maxPlayers, isReady, gameInProgress, toggleReady]);

  // Reset search state when component mounts
  useEffect(() => {
    console.log("Initial state:", { isInRoom, isSearching, error });

    setIsSearching(false);
    setTime(0);

    if (error) {
      clearError();
    }
  }, []);

  return (
    <div className="contain-click">
      <div className="click">
        {isSearching ? (
          <div className="time">
            <div className="timeLoading"></div>
            <div className="click-end">
              <div style={{ fontWeight: "bolder" }}> {time} </div>
              <div
                style={{
                  color: "white",
                  fontSize: "16px",
                  width: "150px",
                  textAlign: "center",
                }}
              >
                {activePlayers >= maxPlayers
                  ? "Đang chờ đối thủ..."
                  : "Đang tìm trận...."}
              </div>
              {error && (
                <div style={{ color: "red", fontSize: "12px" }}>{error}</div>
              )}
              <div onClick={matchEnd} className="buttonCancel">
                Huỷ tìm trận
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="buttonFindOpponent">
              <img
                src={ButtonUserVsUser}
                alt="ButtonUserVsUser"
                style={{
                  width: "103px",
                  height: "42px",
                  position: "absolute",
                }}
                onClick={startSearch}
              />
            </div>
            <div className="buttonFindRoom" onClick={handleRoom}>
              PHÒNG ĐẤU
            </div>
            <div className="buttonUserVsBot" onClick={handleStartBot}>
              <img
                src={ButtonUserVsBot}
                alt="ButtonUserVsBot"
                style={{ width: "99px", height: "41px" }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
