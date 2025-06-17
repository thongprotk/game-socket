import React from "react";
import InfomationDraw from "../../assets/Frame-draw.png";
const ModalDraw = ({ handleRestart }) => {
  return (
    <div className="display-infomation-draw">
      <div className="infomation-win">
        <img src={InfomationDraw} alt="" className="model-win" />
        <div className="buttonRestart" onClick={handleRestart}>
          CHƠI LẠI
        </div>
      </div>
    </div>
  );
};

export default ModalDraw;
