import { useEffect, useState } from "react";
import RoomLayout from "../../assets/room-layout.png";
import io from "socket.io-client";

const socket = io("http://localhost:3000");
socket.on("message", message=> {
  console.log(message);
});
export default function RoomContent() {
  const [room, setRoom] = useState();
  const [roomJoined, setRoomJoined] = useState();

  const joinRoom = ()=>{
    if(room !== ''){
      socket.emit('joinRoom',room)
    }
  }
  useEffect(()=>{
    socket.on('joined',)
  })
  return (
    <div className="room-content">
      <form action="">
        <input
          type="text"
          placeholder="nhap ID phong muon choi"
          className="input-id-room"
          onChange={(e)=> setRoom(e.target.value)}
          value={room}
        />
      </form>
      <div className="container">
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">
            Choi Ngay
          </div>
          <div className="button-status">
            Dang Choi
          </div>
        </div>
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">
            Choi Ngay
          </div>
          <div className="button-status">
            Dang Choi
          </div>
        </div>
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">
            Choi Ngay
          </div>
          <div className="button-status">
            Dang Choi
          </div>
        </div>
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">
            Choi Ngay
          </div>
          <div className="button-status">
            Dang Choi
          </div>
        </div>
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">
            Choi Ngay
          </div>
          <div className="button-status">
            Dang Choi
          </div>
        </div>
        <div className="room">
          <img src={RoomLayout} alt="" />
          <div className="button-run">
            Choi Ngay
          </div>
          <div className="button-status">
            Dang Choi
          </div>
        </div>
      </div>
    </div>
  );
}
