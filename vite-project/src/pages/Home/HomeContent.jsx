import ButtonUserVsUser from "../../assets/user-vs-user.png";
import ButtonUserVsBot from "../../assets/User-vs-Bot.png";
// import Vs from "../../assets/vs.png";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { RouterName } from "../../../constants";

const socket = io("http://localhost:3000");

export default function HomeContent() {
  const navigate = useNavigate();
  const [time, setTime] = useState(0);
  const [isSearching, setIsSearching] = useState(false); // Trạng thái tìm trận
  const [roomID, setRoomID] = useState("112");
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
  const joinRoom = () => {
    socket.emit("joinRoom", roomID);
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
    if (time === 0) {
      setIsSearching(false);
    }
  }, [isSearching, time]);
  const startSearch = () => {
    setIsSearching(true);
    setTime(60); // Đặt thời gian tìm trận là 60 giây
    joinRoom(roomID);
  };

  useEffect(() => {
    socket.on("playersConnected", (data) => {
      if (data.roomID && data.player1 && data.player2) {
        setIsSearching(false);
      }
    });

    // Khi đủ 2 người, vào trận
    socket.on("gameReady", (data) => {
      if (data.roomID && data.player1 && data.player2) {
        setIsSearching(false);
        navigate(
          `${RouterName.FIGHT.replace(":roomID", roomID).replace(
            ":player",
            `${data.player1 === socket.id ? 1 : 2}`
          )}`
        );
      }
    });
    return () => {
      socket.off("playersConnected");
      socket.off("gameReady");
    };
  }, [navigate]);

  const matchEnd = () => {
    setIsSearching(false);
    socket.emit("exitGame", { roomID });
    navigate(RouterName.HOME);
  };
  return (
    <div className="contain-click">
      <div className="click">
        {isSearching ? (
          <div className="time">
            <div className="timeLoading"></div>
            <div className="click-end">
              <div style={{ fontWeight: "bolder" }}> {time} </div>
              <div style={{ color: "white", fontSize: "16px", width: "116px" }}>
                Đang tìm trận....
              </div>
              <div
                onClick={matchEnd}
                style={{ color: "#FFFFFF", fontSize: "14px" }}
              >
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
