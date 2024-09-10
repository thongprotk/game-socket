import Punch from "../../assets/punk.png";
import Drag from "../../assets/drag.png";
import Leaves from "../../assets/leaves.png";
import { useEffect, useState } from "react";

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
    result,
    setResult,
    manSelected,
    setManSelected,
    botSelected,
    setBotSelected,
    optionChoice,
  } = props;
  
  const botChoice = () => {
    let randoomBot = Math.floor(Math.random() * FIGHT_LIST.length);
    setBotSelected(FIGHT_LIST[randoomBot].value);
  };

  const determineWinnerChoice = (botChoice, playerChoice) => {
    if (playerChoice === botChoice) {
      return "draw";
    } else if (
      (playerChoice === FIGHT_OPTION.KEO && botChoice === FIGHT_OPTION.BAO) ||
      (playerChoice === FIGHT_OPTION.BUA && botChoice === FIGHT_OPTION.KEO) ||
      (playerChoice === FIGHT_OPTION.BAO && botChoice === FIGHT_OPTION.BUA)
    ) {
      return "win";
    } else {
      return "lose";
    }
  };

  useEffect(() => {
    if (props.manSelected && botSelected) {
      setResult(determineWinnerChoice(botSelected, manSelected));
      optionChoice(determineWinnerChoice(botSelected, manSelected));
    }
  }, [manSelected, botSelected]);

  const playerChoice = (choice) => {
    setManSelected(choice);
    botChoice();
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
        <div>{renderChoiceImage(manSelected)}</div>
        <div className="rotate-choose">{renderChoiceImage(botSelected)}</div>
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
        <div className="punk" onClick={() => playerChoice(FIGHT_OPTION.BUA)}>
          <img src={Punch} alt="bua" />
        </div>
        <div className="drag" onClick={() => playerChoice(FIGHT_OPTION.KEO)}>
          <img src={Drag} alt="keo" />
        </div>
        <div className="leaves" onClick={() => playerChoice(FIGHT_OPTION.BAO)}>
          <img src={Leaves} alt="bao" />
        </div>
      </div>
    </div>
  );
}
