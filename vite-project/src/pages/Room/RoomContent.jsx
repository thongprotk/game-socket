import { useEffect, useState } from "react";
import RoomLayout from "../../assets/room-layout.png";
// import io from "socket.io-client";

// const socket = io("http://localhost:3000");

export default function RoomContent() {
  const [room, setRoom] = useState();
  const [roomJoined, setRoomJoined] = useState();

  return (
    <div className="room-content">
      <form action="">
        <input
          type="text"
          placeholder="nhap ID phong muon choi"
          className="input-id-room"
          onChange={(e) => setRoom(e.target.value)}
          value={room}
        />
      </form>
      <div className="container">
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">Choi Ngay</div>
          <div className="button-status">Dang Choi</div>
        </div>
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">Choi Ngay</div>
          <div className="button-status">Dang Choi</div>
        </div>
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">Choi Ngay</div>
          <div className="button-status">Dang Choi</div>
        </div>
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">Choi Ngay</div>
          <div className="button-status">Dang Choi</div>
        </div>
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">Choi Ngay</div>
          <div className="button-status">Dang Choi</div>
        </div>
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">Choi Ngay</div>
          <div className="button-status">Dang Choi</div>
        </div>
      </div>
    </div>
  );
}
