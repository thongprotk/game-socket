import React, { useState, useEffect } from "react";
import FightContent from "./FightContent";
import Header from "../../component/header";
import ManVsMan from "../../component/footer/manVsMan";
import ModalInformationWin from "./modaIWin";
import ModalInformationLose from "./modalLose";
import io from "socket.io-client";

const socket = io("http://localhost:3000");
socket.on("connection", (message) => {
  console.log(message);
});
export default function Fight() {
  const [result, setResult] = useState("");
  const [manSelected, setManSelected] = useState();
  const [manOption, setManOption] = useState([]);
  const [opponentOption, setOpponentOption] = useState([]);
  const [opponentSelected, setOpponentSelected] = useState();
  const [saveResult, setSaveResult] = useState();
  const [model, setModel] = useState();
  const [selfId, setSelfId] = useState(null)
  const [opponentId, setOpponentId] = useState(null);
  const optionChoice = (result) => {
    if (result === "lose") {
      setManOption([...manOption, 0]);
      setOpponentOption([...opponentOption, 1]);
    } else if (result === "draw") {
    } else {
      setManOption([...manOption, 1]);
      setOpponentOption([...opponentOption, 0]);
    }
  };
  const handleRestart = () => {
    setManOption([]);
    setOpponentOption([]);
    setResult("");
    setOpponentSelected();
    setManSelected();
    setSaveResult(undefined);
  };
  const checkGame = () => {
    let countManOption = manOption.filter((num) => num === 1).length;
    let countOpponentOption = opponentOption.filter((num) => num === 1).length;
    if (countManOption === 2) {
      return "man win";
    } else if (countOpponentOption === 2) {
      return "Opponent win";
    }
    return null;
  };
  useEffect(() => {
    setSaveResult(checkGame(manOption));
    setSaveResult(checkGame(opponentOption));
  }, [manOption, opponentOption]);
  return (
    <div className="fight-display">
      <Header />
      {saveResult === "man win" ? (
        <ModalInformationWin handleRestart={handleRestart} />
      ) : saveResult === "Opponent win" ? (
        <ModalInformationLose handleRestart={handleRestart} />
      ) : null}
      <FightContent
        manSelected={manSelected}
        setManSelected={setManSelected}
        opponentSelected={opponentSelected}
        setOpponentSelected={setOpponentSelected}
        result={result}
        setResult={setResult}
        optionChoice={optionChoice}
        socket={socket}
        opponentId={opponentId}
        setOpponentId={setOpponentId}
        selfId = {selfId}
        setSelfId = {setSelfId}
      />

      <ManVsMan manOption={manOption} opponentOption={opponentOption} />
    </div>
  );
}
