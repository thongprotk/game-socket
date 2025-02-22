import { io } from "socket.io-client";
import Plus from "../../assets/PlusForm.png";
import ButtonEnd from "../../assets/button-out.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

export default function HeaderRoom(props) {
  const navigate = useNavigate();
  const [count, setCount] = useState(100);
  function handleClick() {
    setCount(count + 10);
  }
  const { roomID } = props;
  const endGame = () => {
    socket.emit("exitGame", { roomID });
    navigate("/");
  };
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
          src={ButtonEnd}
          alt="ReturnChoose"
          style={{ padding: "12px", cursor: "pointer" }}
          onClick={endGame}
        />
      </div>
    </div>
  );
}
