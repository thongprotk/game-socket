import ResultPage from "../../pages/ResultPages";
import HistoryImage from "../../assets/history.png";
import React, { useState } from "react";
export default function ResultPopup(props) {
  const { onClose } = props;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={() => onClose()}
    >
      <img
        src={HistoryImage}
        alt="history"
        style={{
          width: "328px",
          height: "726px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: -1,
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <div onClick={(e) => e.stopPropagation()} className="popup-content">
        <div className="list-title">History Game</div>
        <ResultPage onClose={() => setShowResult(false)} />
      </div>
    </div>
  );
}
