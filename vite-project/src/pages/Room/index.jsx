import Header from "../../component/header";
import HeaderFight from "../../component/header/headerFight";
import RoomContent from "./RoomContent";
import io from "socket.io-client";
const socket = io("http://localhost:3000");
export default function Room() {
  return (
    <div className="content">
      <HeaderFight socket={socket} />
      <RoomContent />
    </div>
  );
}
