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
    socket.on("winList", (data) => {
      console.log("Danh sách người chiến thắng:", data);
      setWinnerList(data); // Cập nhật state với dữ liệu từ server
    });

    return () => {
      socket.off("winList");
    };
  }, []);

  return (
    <div className="content">
      <HeaderRoom />
      <div style={{ color: "white", fontSize:"18px" }}>Lịch sử đấu</div>
      <div className="list">{winnerList}</div>
    </div>
  );
}
