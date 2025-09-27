import Header from "../../component/header";
import HeaderFight from "../../component/header/headerFight";
import RoomContent from "./RoomContent";
import { getSocket } from "../Service/socket";
const socket = getSocket();
export default function Room() {
  return (
    <div className="content">
      <HeaderFight socket={socket} />
      <RoomContent />
    </div>
  );
}
