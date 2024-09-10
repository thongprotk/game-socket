import React from "react";
import InfomationWin from "../../assets/infomation-win.png";
import StarWin from "../../assets/star-win.png";
export default function ModalInformationWin(props) {
  return (
    <div className="display-infomation">
      <div className="infomation-win">
        <img src={InfomationWin} alt="" className="model-win" />
        <img src={StarWin} alt="" className="model-star-win" />
        <div className="buttonRestart" onClick={props.handleRestart}>
          CHƠI TIẾP
        </div>
      </div>
    </div>
  );
}
