import { useState, useEffect } from "react";
import FightContent from "./FightContent";
import Header from "../../component/header/headerFight";
// import ManVsMan from "../../component/footer/manVsMan";
import ModalInformationWin from "./modaIWin";
import ModalInformationLose from "./modalLose";
import { useParams } from "react-router-dom";
import { getSocket } from "../Socket/socket";

export default function Fight() {
  const { roomID, player } = useParams();
  const socket = getSocket();
  const [result, setResult] = useState("");
  const [manSelected, setManSelected] = useState();
  const [manOption, setManOption] = useState([]);
  const [opponentOption, setOpponentOption] = useState([]);
  const [opponentSelected, setOpponentSelected] = useState();
  const [saveResult, setSaveResult] = useState();
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    if (roomID) {
      console.log("Joined room:", roomID);
    }
  }, [roomID]);
  const optionChoice = (result) => {
    if (String(player) ? "1" : "2") {
      if (result === "lose") {
        setManOption([...manOption, 0]);
        setOpponentOption([...opponentOption, 1]);
      } else if (result === "draw") {
        // No action needed for draw
      } else {
        setManOption([...manOption, 1]);
        setOpponentOption([...opponentOption, 0]);
      }
    }
  };
  const handleRestart = () => {
    socket.emit("playerClicked", {
      roomID: String(roomID),
    });
  };
  useEffect(() => {
    socket.on("playAgain", (data) => {
      setManOption([]);
      setOpponentOption([]);
      setResult("");
      setOpponentSelected(data.secondPlayerChoice);
      setManSelected(data.firstPlayerChoice);
      setSaveResult(null);
      setShowModal(false);
    });
    return () => {
      socket.off("playAgain");
    };
  }, [
    socket,
    setManOption,
    setOpponentOption,
    setResult,
    setOpponentSelected,
    setManSelected,
    setSaveResult,
    setShowModal,
  ]);
  // const exitGame = () => {
  //   socket.emit("exitGame", { roomID: roomID });
  //   const handlePlayerLeft = (data) => {
  //     const roomID = data.roomID;
  //     console.log("player-left", data);
  //     alert(data.message);
  //   };
  //   socket.on("player-left", handlePlayerLeft);
  // };
  useEffect(() => {
    let countManOption = manOption.filter((num) => num === 1).length;
    let countOpponentOption = opponentOption.filter((num) => num === 1).length;
    if (countManOption === 1) {
      setSaveResult("man win");
    } else if (countOpponentOption === 1) {
      setSaveResult("Opponent win");
    } else {
      setSaveResult(null);
    }
  }, [manOption, opponentOption]);
  useEffect(() => {
    if (!saveResult) return;
    socket.emit("resultGame", {
      roomID,
      result,
      player,
    });
    if (saveResult) {
      const timeOut = setTimeout(() => {
        setShowModal(true);
      }, 1100);
      return () => clearTimeout(timeOut);
    }
    return () => {
      socket.off("resultGame");
    };
  }, [socket, roomID, result, player, saveResult]);

  return (
    <div className="fight-display">
      <Header roomID={roomID} socket={socket} />
      {showModal && (
        <>
          {saveResult === "man win" ? (
            <ModalInformationWin handleRestart={handleRestart} />
          ) : saveResult === "Opponent win" ? (
            <ModalInformationLose handleRestart={handleRestart} />
          ) : null}
        </>
      )}

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
      />

      {/* <ManVsMan manOption={manOption} opponentOption={opponentOption} /> */}
    </div>
  );
}
