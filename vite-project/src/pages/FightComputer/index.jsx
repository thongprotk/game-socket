import React, { useEffect } from "react";
import FightContent from "../FightComputer/FightContent";
import Header from "../../component/header/headerFight";
import PeopleChoose from "../../component/footer/peopleChoose";
import ModalInformationWin from "../FightComputer/modeInfomation";
import { useState } from "react";
import ModalInformationLose from "./modalinfomationLose";
import { getSocket } from "../Service/socket";
export default function FightBot() {
  const socket = getSocket();
  const [result, setResult] = useState("");
  const [manSelected, setManSelected] = useState();
  const [botSelected, setBotSelected] = useState();
  const [manOption, setManOption] = useState([]);
  const [botOption, setBotOption] = useState([]);
  const [saveResult, setSaveResult] = useState();
  const [modal, setModal] = useState();

  const optionChoice = (result) => {
    if (result === "lose") {
      setManOption([...manOption, 0]);
      setBotOption([...botOption, 1]);
    } else if (result === "draw") {
    } else {
      setManOption([...manOption, 1]);
      setBotOption([...botOption, 0]);
    }
  };
  const handleRestart = () => {
    setManOption([]);
    setBotOption([]);
    setResult("");
    setBotSelected();
    setManSelected();
    setSaveResult(undefined);
  };
  const checkGame = (manOption, botOption) => {
    let countManOption = manOption.filter((num) => num === 1).length;
    let countBotOption = botOption.filter((num) => num === 1).length;
    if (countManOption === 2) {
      return "man win";
    } else if (countBotOption === 2) {
      return "bot win";
    }
    return null;
  };
  useEffect(() => {
    if (manOption && botOption) {
      setSaveResult(checkGame(manOption, botOption));
    }
  }, [botOption, manOption]);
  useEffect(() => {
    if (saveResult) {
      const timeOut = setTimeout(() => {
        setModal(true);
      }, 1550);
      return () => clearTimeout(timeOut);
    }
  }, [saveResult]);

  return (
    <div className="fight-display">
      <Header socket={socket} />
      {modal && (
        <>
          {saveResult === "man win" ? (
            <ModalInformationWin handleRestart={handleRestart} />
          ) : saveResult === "bot win" ? (
            <ModalInformationLose handleRestart={handleRestart} />
          ) : null}
        </>
      )}

      <FightContent
        result={result}
        setResult={setResult}
        manSelected={manSelected}
        botSelected={botSelected}
        setBotSelected={setBotSelected}
        setManSelected={setManSelected}
        optionChoice={optionChoice}
      />

      <PeopleChoose manOption={manOption} botOption={botOption} />
    </div>
  );
}
