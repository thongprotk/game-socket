import Punch from "../../assets/punk.png";
import Drag from "../../assets/drag.png";
import Leaves from "../../assets/leaves.png";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import ModalDraw from "./modalDraw";
const socket = io("http://localhost:3000");

const FIGHT_OPTION = {
  KEO: 1,
  BUA: 2,
  BAO: 3,
};
export default function FightContent(props) {
  const {
    manSelected,
    setManSelected,
    opponentSelected,
    setOpponentSelected,
    result,
    setResult,
    roomID,
    socket,
    optionChoice,
  } = props;
  const [isActive, setActive] = useState(false);
  const { player } = useParams();
  const clickChoice = (rpsChoice) => {
    setActive(!isActive);
    setResult("");
    if (String(player) === "1") {
      setManSelected(rpsChoice);
    } else {
      setOpponentSelected(rpsChoice);
    }
    const selectedChoice = String(player) === "1" ? "p1Choice" : "p2Choice";
    socket.emit(selectedChoice, {
      rpsChoice: rpsChoice,
      roomID: roomID,
    });
  };
  const handleRestart = () => {
    socket.emit("playerClicked", {
      roomID,
    });
  };
  useEffect(() => {
    socket.on("bothChoicesMade", (data) => {
      const { p1Choice, p2Choice } = data;
      if (String(player) === "1") {
        setManSelected(p1Choice);
        setOpponentSelected(p2Choice);
      } else {
        setManSelected(p2Choice);
        setOpponentSelected(p1Choice);
      }
    });
    socket.on("winner", (data) => {
      if (data?.roomID === roomID) {
        if (data.winner === "draw") {
          setResult("draw");
          optionChoice("draw");
        } else {
          setResult(String(player) === data?.winner ? "win" : "lose");
          optionChoice(String(player) === data?.winner ? "win" : "lose");
        }
      }
    });
    return () => {
      socket.off("bothChoicesMade");
      socket.off("winner");
    };
  }, [socket, roomID, player]);

  const renderChoiceImage = (rpsChoice) => {
    switch (rpsChoice) {
      case FIGHT_OPTION.BUA:
        return (
          <img
            src={Punch}
            alt="Punch"
            style={{ rotate: "88deg", width: "150px", height: "150px" }}
          />
        );
      case FIGHT_OPTION.BAO:
        return (
          <img
            src={Leaves}
            alt="Leaves"
            style={{
              transform: "scaleX(-1)",
              rotate: "88deg",
              width: "150px",
              height: "150px",
            }}
          />
        );
      case FIGHT_OPTION.KEO:
        return (
          <img
            src={Drag}
            alt="Drag"
            style={{ rotate: "88deg", width: "150px", height: "150px" }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="display-select">
      <div className="display-item">
        <div>{manSelected && renderChoiceImage(manSelected)}</div>
        <div className="rotate-choose">
          {opponentSelected && renderChoiceImage(opponentSelected)}
        </div>
      </div>
      {result && (
        <div className="result">
          {result === "draw" ? (
            <ModalDraw handleRestart={handleRestart} />
          ) : (
            <div className="win-result">{result}</div>
          )}
        </div>
      )}
      <div
        style={{
          color: "white",
          width: "123",
          height: "20px",
          fontSize: "13px",
          margin: "0 auto ",
        }}
      >
        LỰA CHỌN CỦA BẠN
      </div>

      <div className="select-choose">
        <div
          className="punk"
          onClick={() => {
            clickChoice(FIGHT_OPTION.BUA);
          }}
        >
          <img src={Punch} alt="punch" />
        </div>
        <div
          className="drag"
          onClick={() => {
            clickChoice(FIGHT_OPTION.KEO);
          }}
        >
          <img src={Drag} alt="drag" />
        </div>
        <div
          className="leaves"
          onClick={() => {
            clickChoice(FIGHT_OPTION.BAO);
          }}
        >
          <img src={Leaves} alt="leaves" />
        </div>
      </div>
    </div>
  );
}
