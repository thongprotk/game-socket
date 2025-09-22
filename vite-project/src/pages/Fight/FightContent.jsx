import Punch from "../../assets/punk.png";
import Drag from "../../assets/drag.png";
import Leaves from "../../assets/leaves.png";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ModalDraw from "./modalDraw";
import PropTypes from "prop-types";
const FIGHT_OPTION = {
  KEO: 1,
  BUA: 2,
  BAO: 3,
};
FightContent.propTypes = {
  manSelected: PropTypes.number,
  setManSelected: PropTypes.func,
  opponentSelected: PropTypes.number,
  setOpponentSelected: PropTypes.func,
  result: PropTypes.string,
  setResult: PropTypes.func,
  roomID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  socket: PropTypes.shape({
    emit: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
  }).isRequired,
  optionChoice: PropTypes.func,
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
  const [playAgainVotes, setPlayAgainVotes] = useState([]);
  const [playAgainNeeded, setPlayAgainNeeded] = useState(2);
  const [playAgainWaiting, setPlayAgainWaiting] = useState(false);
  const { player } = useParams();
  const clickChoice = (rpsChoice) => {
    // Lock UI until round finishes
    setActive(true);
    setResult("");
    if (String(player) === "1") {
      setManSelected(rpsChoice);
    } else {
      setOpponentSelected(rpsChoice);
    }

    // Emit unified choice event expected by server
    socket.emit("playerChoice", {
      roomID: String(roomID),
      choice: rpsChoice,
    });

    // Backwards-compat: also emit legacy p1Choice/p2Choice for older server versions
    const legacyEvent = String(player) === "1" ? "p1Choice" : "p2Choice";
    socket.emit(legacyEvent, {
      rpsChoice: rpsChoice,
      roomID: String(roomID),
    });
  };
  const handleRestart = () => {
    // emit vote to play again; UI will show waiting state if other player hasn't voted
    socket.emit("playerClicked", {
      roomID: String(roomID),
    });
    setPlayAgainWaiting(true);
  };
  useEffect(() => {
    const handleWaiting = (data) => {
      if (String(data?.roomID) !== String(roomID)) return;
      // show waiting status (keep buttons disabled)
      setActive(true);
    };

    const handleRoundFinished = (data) => {
      if (String(data?.roomID) !== String(roomID)) return;
      const { results } = data;
      const choices = results && results.choices ? results.choices : null;

      // If choices is an object keyed by socketId, map by socket.id
      if (choices && typeof choices === "object") {
        const ownId = socket.id;
        const entries = Object.entries(choices);
        let ownChoice = null;
        let oppChoice = null;

        if (entries.length === 1) {
          // single-player edge case
          ownChoice = entries[0][1];
        } else if (entries.length >= 2) {
          // find matching key
          for (const [key, val] of entries) {
            if (String(key) === String(ownId)) ownChoice = val;
            else oppChoice = val;
          }
        }

        if (ownChoice !== null) setManSelected(ownChoice);
        if (oppChoice !== null) setOpponentSelected(oppChoice);
      } else if (results && results.type === "duel" && results.choices) {
        // Fallback: choices may be already in p1/p2 order (legacy)
        const c = results.choices;
        const vals = Object.values(c);
        if (vals.length >= 2) {
          // assume order corresponds to p1 then p2
          if (String(player) === "1") {
            setManSelected(vals[0]);
            setOpponentSelected(vals[1]);
          } else {
            setManSelected(vals[1]);
            setOpponentSelected(vals[0]);
          }
        }
      }

      // Determine result/winner
      if (results && results.winner) {
        const w = results.winner;
        console.log("Determining result from winner:", w);
        if (w === "tie" || w === "draw") {
          setResult("draw");
          optionChoice("draw");
        } else {
          let winnerSocketId = null;
          if (typeof w === "string" && /^player\d+$/.test(w)) {
            const choicesObj = results.choices;
            console.log(typeof choicesObj === "object", choicesObj);
            if (choicesObj && typeof choicesObj === "object") {
              const entries = Object.entries(choicesObj);
              if (entries.length >= 2) {
                const player1Id = entries[0][0];
                const player2Id = entries[1][0];
                winnerSocketId = w === "player1" ? player1Id : player2Id;
              }
            }
            // Fallback: if we couldn't map via choices object, fall back to comparing to player number
            if (!winnerSocketId) {
              const isWin = w === "player" + String(player);
              console.log("Fallback winner by player number, isWin:", isWin);
              setResult(isWin ? "win" : "lose");
              optionChoice(isWin ? "win" : "lose");
            }
          } else {
            winnerSocketId = w;
          }

          if (winnerSocketId) {
            const isWin = String(winnerSocketId) === String(socket.id);
            console.log("Winner socketId:", winnerSocketId, "isWin:", isWin);
            setResult(isWin ? "win" : "lose");
            optionChoice(isWin ? "win" : "lose");
          }
        }
      }

      setActive(false);
    };

    const handleBothChoices = (data) => {
      if (String(data?.roomID) !== String(roomID)) return;
      const { p1Choice, p2Choice } = data;
      if (String(player) === "1") {
        setManSelected(p1Choice);
        setOpponentSelected(p2Choice);
      } else {
        setManSelected(p2Choice);
        setOpponentSelected(p1Choice);
      }
    };

    const handleWinner = (data) => {
      if (String(data?.roomID) !== String(roomID)) return;
      // Legacy winner may be socketId or 'draw'
      if (data.winner === "draw" || data.winner === "tie") {
        setResult("draw");
        optionChoice("draw");
      } else {
        const isWin =
          String(player) === String(data?.winner) ||
          String(data?.winner) === String(socket.id);
        setResult(isWin ? "win" : "lose");
        optionChoice(isWin ? "win" : "lose");
      }
      setActive(false);
    };

    const handleGameStarted = (data) => {
      if (String(data?.roomID) !== String(roomID)) return;
      // reset UI for new round
      setManSelected(null);
      setOpponentSelected(null);
      setResult("");
      setActive(false);
      // clear any play-again state
      setPlayAgainWaiting(false);
      setPlayAgainVotes([]);
      setPlayAgainNeeded(2);
    };

    const handlePlayAgain = (data) => {
      if (String(data?.roomID) !== String(roomID)) return;
      setManSelected(null);
      setOpponentSelected(null);
      setResult("");
      setActive(false);
    };

    const handlePlayAgainVote = (data) => {
      if (String(data?.roomID) !== String(roomID)) return;
      const votes = data.votes || [];
      const needed = data.needed || 2;
      setPlayAgainVotes(votes);
      setPlayAgainNeeded(needed);
      // if the current player has voted and not all voted yet, show waiting overlay
      const hasVoted = votes.includes(socket.id);
      setPlayAgainWaiting(hasVoted && votes.length < needed);
    };

    const handleRemovedForNoPlay = (data) => {
      if (String(data?.roomID) !== String(roomID)) return;
      // If this client was removed, notify and exit room
      alert("Bạn đã bị đưa ra khỏi ván do không nhấn chơi lại.");
      socket.emit("exitRoom", String(roomID));
    };

    socket.on("waitingForChoices", handleWaiting);
    socket.on("roundFinished", handleRoundFinished);
    socket.on("bothChoicesMade", handleBothChoices); // legacy support
    socket.on("winner", handleWinner); // legacy support
    socket.on("gameStarted", handleGameStarted);
    socket.on("playAgain", handlePlayAgain);
    socket.on("playAgainVote", handlePlayAgainVote);
    socket.on("removedForNoPlay", handleRemovedForNoPlay);

    return () => {
      socket.off("waitingForChoices", handleWaiting);
      socket.off("roundFinished", handleRoundFinished);
      socket.off("bothChoicesMade", handleBothChoices);
      socket.off("winner", handleWinner);
      socket.off("gameStarted", handleGameStarted);
      socket.off("playAgain", handlePlayAgain);
      socket.off("playAgainVote", handlePlayAgainVote);
      socket.off("removedForNoPlay", handleRemovedForNoPlay);
    };
  }, [
    socket,
    roomID,
    player,
    setManSelected,
    setOpponentSelected,
    setResult,
    optionChoice,
  ]);

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
      {/* Play-again waiting overlay */}
      {playAgainWaiting && (
        <div
          className="play-again-overlay"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              background: "#222",
              color: "white",
              padding: "16px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div>Đang chờ người chơi khác...</div>
            <div style={{ marginTop: "8px" }}>
              {playAgainVotes.length}/{playAgainNeeded} đã đồng ý
            </div>
            <button
              style={{ marginTop: "12px" }}
              onClick={() => {
                setPlayAgainWaiting(false);
                socket.emit("exitRoom", String(roomID));
              }}
            >
              Hủy và rời
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
