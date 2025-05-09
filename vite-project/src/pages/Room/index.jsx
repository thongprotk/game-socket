import Header from "../../component/header";
import HeaderFight from "../../component/header/headerFight";
import RoomContent from "./RoomContent";
export default function Room() {
  return (
    <div className="content">
      <HeaderFight />
      <RoomContent />
    </div>
  );
}
