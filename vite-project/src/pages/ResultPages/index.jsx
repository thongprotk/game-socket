import React, { useEffect, useState } from "react";
import { getSocket } from "../Service/socket";
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
                <div style={{ fontSize: "16px", fontWeight: "500" }}>
                  Room ID: {winner.roomID} - Player: {winner.player}
                </div>
                <div
                  className="result-text"
                  style={{
                    color:
                      winner.result === "win"
                        ? "#3FC864"
                        : winner.result === "lose"
                        ? "#E96200"
                        : "gray",
                  }}
                >
                  {winner.result === "win"
                    ? "WIN"
                    : winner.result === "lose"
                    ? "LOSE"
                    : "DRAW"}
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#74A0DB" }}>
                {new Date(winner.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
