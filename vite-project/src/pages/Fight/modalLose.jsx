import React from "react";
import InfomationWin from "../../assets/infomation-lose.png";
import StarWin from "../../assets/star-lose.png";
export default function ModalInformationLose(props) {
  
  return (
    <div className="display-infomation">
      <div className="infomation-win">
        <img src={InfomationWin} alt="" className="model-win" />
        <img src={StarWin} alt="" className="model-star-lose" />
        <div className="buttonRestart" onClick={props.handleRestart}>
          CHƠI TIẾP
        </div>
      </div>
    </div>
  );
}
