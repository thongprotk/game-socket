import Header from "../../component/header";
import HeaderRoom from "../../component/header/headerRoom";
import RoomContent from "./RoomContent";
export default function Room() {
  return (
    <div className="content">
      <HeaderRoom />
      <RoomContent />
    </div>
  );
}
