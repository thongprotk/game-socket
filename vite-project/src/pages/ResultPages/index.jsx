import React, { useEffect, useState } from "react";
import { getSocket } from "../Socket/socket";
const socket = getSocket();

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
      <div className="list-container">
        <div className="list">
          {winnerList.map((winner, index) => (
            <div key={index} className="list-item">
              <div className="player-result">
                <div style={{ fontSize: "16px" }}>
                  Room ID: {winner.roomID} Player: {winner.player}
                </div>
                <div>{winner.result}</div>
              </div>
              <div>{new Date(winner.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
