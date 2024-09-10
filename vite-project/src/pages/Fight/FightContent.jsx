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

const FIGHT_LIST = [
  {
    value: FIGHT_OPTION.KEO,
    label: "keo",
  },
  {
    value: FIGHT_OPTION.BUA,
    label: "bua",
  },
  {
    value: FIGHT_OPTION.BAO,
    label: "bao",
  },
];

export default function FightContent(props) {
  const {
    manSelected,
    setManSelected,
    opponentSelected,
    setOpponentSelected,
    result,
    setResult,
    optionChoice,
    opponentId,
    setOpponentId,
    selfId,
    setSelfId,
  } = props;

  // const determineWinnerChoice = (opponentSelected, playerChoice) => {
  //   if (playerChoice === opponentSelected) {
  //     return "draw";
  //   } else if (
  //     (playerChoice === FIGHT_OPTION.KEO &&
  //       opponentSelected === FIGHT_OPTION.BAO) ||
  //     (playerChoice === FIGHT_OPTION.BUA &&
  //       opponentSelected === FIGHT_OPTION.KEO) ||
  //     (playerChoice === FIGHT_OPTION.BAO &&
  //       opponentSelected === FIGHT_OPTION.BUA)
  //   ) {
  //     return "win";
  //   } else {
  //     return "lose";
  //   }
  // };

  useEffect(() => {
    socket.on('firstPlayerId',(data)=>{
      setSelfId(data.id)
      console.log('1:',data.id)
    })
    socket.on('secondPlayerId',(data)=>{
      setOpponentId(data.idVs)
      console.log('2:',data.idVs);
    })
    socket.on("startGame", (data) => {
      setOpponentId(data.idVs);
      setSelfId(data.id);
      console.log(`Opponent ID set to: ${data.idVs} , ${data.id}`);
    });

    socket.on("result", (data) => {
      setManSelected(data.manSelected);
      setOpponentSelected(data.opponentChoice);
      setResult(data.result);
      optionChoice(data.optionChoice);
    });
    return () => {
      socket.off("startGame");
      socket.off("opponentChoice");
      socket.off("result");
    };
  }, [selfId, opponentId]);
  // useEffect(() => {
  //   console.log("manSelected has changed:", manSelected);
  //   console.log("opponentSelected has changed:", opponentSelected);
  // }, [manSelected, opponentSelected]);
  const playerChoice = (choice) => {
    console.log("selfid", selfId, "opponentid", opponentId);
    if (opponentId && selfId) {
      console.log(choice);
      socket.emit("choices", { choice });
      setManSelected(choice);
      console.log(choice);
    }
  };
  const renderChoiceImage = (choice) => {
    switch (choice) {
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
            playerChoice(FIGHT_OPTION.BUA);
          }}
        >
          <img src={Punch} alt="punch" />
        </div>
        <div
          className="drag"
          onClick={() => {
            playerChoice(FIGHT_OPTION.KEO);
          }}
        >
          <img src={Drag} alt="drag" />
        </div>
        <div
          className="leaves"
          onClick={() => {
            playerChoice(FIGHT_OPTION.BAO);
          }}
        >
          <img src={Leaves} alt="leaves" />
        </div>
      </div>
    </div>
  );
}
