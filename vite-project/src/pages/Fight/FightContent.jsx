import Punch from "../../assets/punk.png";
import Drag from "../../assets/drag.png";
import Leaves from "../../assets/leaves.png";
import { useEffect, useState } from "react";
import io from "socket.io-client";

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
    player1,
    socket,
  } = props;

  const clickChoice = (rpsChoice) => {
    setManSelected(rpsChoice);
    socket.emit("p1Choice", {
      rpsChoice: rpsChoice,
      roomID: roomID,
    });
  };
  console.log(manSelected);
  console.log(`players go to ${roomID}`);
  useEffect(() => {
    if (!roomID) return;
    socket.on("p1Choice", (data) => {
      roomID = data.roomID;
      setManSelected(data.rpsValue);
      console.log("Player 1 picked:", data.rpsValue);
    });
    socket.on("p2Choie", (data) => {
      roomID = data.roomID;
      setOpponentSelected(data.rpsValue);
      console.log("Player 2 picked:", data.rpsValue);
    });
    socket.on(
      "winner",
      (data) => {
        if (data == "draw") {
          setResult("draw");
        } else if ((data = "p1")) {
          if (player1) {
            setResult("you win");
          } else {
            setResult("you lose");
          }
        } else if ((data = "p2")) {
          if (!player1) {
            setResult("you win ");
          } else {
            setResult("you lose");
          }
        }
      },
      [player1, opponentSelected]
    );
    return () => {
      socket.off("p1Choice");
      socket.off("p2Choice");
      socket.off("winner");
    };
  }, [opponentSelected, socket, roomID]);

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
            style={{ rotate: "88deg", width: "150px", height: "150px" }}
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
      {result && <div className="result">{result}</div>}
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
