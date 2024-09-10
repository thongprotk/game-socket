import DisplayListChoose from "../../../assets/list-choose.png";
export default function ManVsMan(props) {
  const { manOption, opponentOption } = props;
  return (
    <div className="display-player-choose">
      <div className="display-user-choose">
        <div className="user-choose-list"></div>
        <div>
          <img src={DisplayListChoose} alt="DisplayListChoose" />
          <div className="box-choose-user">
            {manOption[0] === undefined ? (
              <div className="box-choose"></div>
            ) : manOption[0] === 1 ? (
              <div className="box-choose-green"></div>
            ) : (
              <div className="box-choose-red"></div>
            )}
            {manOption[1] === undefined ? (
              <div className="box-choose"></div>
            ) : manOption[1] === 1 ? (
              <div className="box-choose-green"></div>
            ) : (
              <div className="box-choose-red"></div>
            )}
            {manOption[2] === undefined ? (
              <div className="box-choose"></div>
            ) : manOption[2] === 1 ? (
              <div className="box-choose-green"></div>
            ) : (
              <div className="box-choose-red"></div>
            )}
          </div>
        </div>
      </div>
      <div className="display-opponent-choose">
        <div>
          <img
            src={DisplayListChoose}
            alt=""
            style={{ rotate: "180deg", position: "relative" }}
          />
          <div className="box-choose-opponent">
            <>
              {opponentOption[0] === undefined ? (
                <div className="box-choose"></div>
              ) : opponentOption[0] === 1 ? (
                <div className="box-choose-green"></div>
              ) : (
                <div className="box-choose-red"></div>
              )}
              {opponentOption[1] === undefined ? (
                <div className="box-choose"></div>
              ) : opponentOption[1] === 1 ? (
                <div className="box-choose-green"></div>
              ) : (
                <div className="box-choose-red"></div>
              )}
              {opponentOption[2] === undefined ? (
                <div className="box-choose"></div>
              ) : opponentOption[2] === 1 ? (
                <div className="box-choose-green"></div>
              ) : (
                <div className="box-choose-red"></div>
              )}
            </>
          </div>
        </div>
        <div className="opponent-choose-list"></div>
      </div>
    </div>
  );
}
