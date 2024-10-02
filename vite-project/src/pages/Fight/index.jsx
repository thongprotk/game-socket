import React, { useState, useEffect } from "react";
import FightContent from "./FightContent";
import Header from "../../component/header";
import ManVsMan from "../../component/footer/manVsMan";
import ModalInformationWin from "./modaIWin";
import ModalInformationLose from "./modalLose";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:3000");

export default function Fight() {
  const {roomID} = useParams();
  const [result, setResult] = useState("");
  const [manSelected, setManSelected] = useState();
  const [manOption, setManOption] = useState([]);
  const [opponentOption, setOpponentOption] = useState([]);
  const [opponentSelected, setOpponentSelected] = useState();
  const [saveResult, setSaveResult] = useState();
  const [player1, setPlayer1] = useState(false);

  useEffect(() => {
    socket.on("playersConnected", () => {
      roomID
    });
    if (roomID) {
      console.log("Joined room:", roomID);
    }
  }, [roomID]);
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
    socket.on("playAgain", { roomID: roomID });
  };
  const exitGame = () => {
    socket.emit("exitGame", { roomID: roomID });
    socket.on("play1Left");
    socket.on("player2Left");
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
        roomID={roomID}
        player1={player1}
      />

      <ManVsMan manOption={manOption} opponentOption={opponentOption} />
    </div>
  );
}
