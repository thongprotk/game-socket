import Plus from "../../assets/PlusForm.png";
import ButtonSetting from "../../assets/Frame-setting.png";
import { useEffect, useState } from "react";
import { useRoom } from "../../pages/Context/RoomContext";
export default function Header() {
  const { isReady, gameInProgress, maxPlayers, activePlayers } = useRoom();
  const [count, setCount] = useState(100);
  function handleClick() {
    setCount(count + 10);
  }
  useEffect(() => {
    if (activePlayers >= maxPlayers && !gameInProgress && isReady) {
      setCount(count - 10);
    }
  }, [activePlayers, maxPlayers, gameInProgress, isReady]);
  return (
    <div className="header">
      <div className="energy">
        <div style={{ color: "white", padding: "10px 40px 0 0" }}>{count}</div>
        <div>
          <img
            src={Plus}
            alt=""
            onClick={handleClick}
            style={{ padding: "14px 8px 0 0" }}
          />
        </div>
      </div>
      <div>
        <img
          src={ButtonSetting}
          alt="ReturnChoose"
          style={{ padding: "5px", cursor: "pointer" }}
        />
      </div>
    </div>
  );
}
