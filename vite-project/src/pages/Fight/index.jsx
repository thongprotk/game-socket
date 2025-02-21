import React, { useState, useEffect } from "react";
import FightContent from "./FightContent";
import Header from "../../component/header/headerRoom";
// import ManVsMan from "../../component/footer/manVsMan";
import ModalInformationWin from "./modaIWin";
import ModalInformationLose from "./modalLose";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:3000");

export default function Fight() {
  const { roomID, player } = useParams();
  const [result, setResult] = useState("");
  const [manSelected, setManSelected] = useState();
  const [manOption, setManOption] = useState([]);
  const [opponentOption, setOpponentOption] = useState([]);
  const [opponentSelected, setOpponentSelected] = useState();
  const [saveResult, setSaveResult] = useState();
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    // socket.on("playersConnected", () => {
    //   roomID;
    // });
    if (roomID) {
      console.log("Joined room:", roomID);
    }
  }, [roomID]);
  console.log("22331", player);
  const optionChoice = (result) => {
    if (String(player) ? "1" : "2") {
      if (result === "lose") {
        setManOption([...manOption, 0]);
        setOpponentOption([...opponentOption, 1]);
      } else if (result === "draw") {
      } else {
        setManOption([...manOption, 1]);
        setOpponentOption([...opponentOption, 0]);
      }
    }
  };
  const handleRestart = () => {
    socket.emit("playerClicked", {
      roomID: roomID,
    });
    socket.on("playAgain", (data) => {
      setManOption([]);
      setOpponentOption([]);
      setResult("");
      setOpponentSelected(data.secondPlayerChoice);
      setManSelected(data.fistPlayerChoice);
      setSaveResult(undefined);
    });
  };
  const exitGame = () => {
    socket.emit("exitGame", { roomID: roomID });
  };
  const checkGame = () => {
    let countManOption = manOption.filter((num) => num === 1).length;
    let countOpponentOption = opponentOption.filter((num) => num === 1).length;
    if (countManOption === 1) {
      return "man win";
    } else if (countOpponentOption === 1) {
      return "Opponent win";
    }
    return null;
  };
  useEffect(() => {
    setSaveResult(checkGame(manOption));
    setSaveResult(checkGame(opponentOption));
  }, [manOption, opponentOption]);
  useEffect(() => {
    socket.emit("resultGame", {
      roomID,
      result,
      player,
    });
    if (saveResult) {
      const timeOut = setTimeout(() => {
        setShowModal(true);
      }, 1500);
      return () => clearTimeout(timeOut);
    }
    return () => {
      socket.off("resuktGame");
    };
  }, [saveResult]);

  return (
    <div className="fight-display">
      <Header roomID={roomID} />
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
