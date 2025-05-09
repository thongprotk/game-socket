import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import HeaderRoom from "../../component/header/headerRoom";
const socket = io("http://localhost:3000");
socket.on("connect", () => {
  console.log("Connected to server");
});

export default function Result() {
  const [winnerList, setWinnerList] = useState([]);

  useEffect(() => {
    socket.emit("getWinList");

    socket.on("winList", (data) => {
      setWinnerList(data);
    });

    return () => {
      socket.off("winList");
    };
  }, []);

  return (
    <div className="content">
      <HeaderRoom />
      <div style={{ color: "white", fontSize: "18px" }}>Lịch sử đấu</div>
      <div className="list">
        {winnerList.map((winner, index) => (
          <div key={index} className="list-item">
            Room {winner.roomID} - Player {winner.player} {winner.result}{" "}
            {new Date(winner.createdAt).toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}
