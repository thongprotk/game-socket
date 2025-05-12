import ButtonMenu from "../../assets/Frame-menu.png";
import ButtonSetting from "../../assets/Frame-setting.png";
import ButtonCup from "../../assets/Frame-cup.png";
import Sound from "../../assets/sound.png";
import MakeGold from "../../assets/set-icon.svg";
import LogReview from "../../assets/log-out.svg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { RouterName } from "../../../constants";

export default function Footer(props) {
  const navigate = useNavigate();
  const { username } = props;
  const [open, setOpen] = useState(false);
  const toggleDropdown = () => {
    setOpen(!open);
  };
  const handleClick = () => {
    navigate(RouterName.RESULT);
  };
  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate(RouterName.LOGIN);
  };
  return (
    <div className="footer">
      <div className="button-click">
        <div>
          <img
            src={ButtonCup}
            alt=""
            style={{ border: "none", cursor: "pointer" }}
            onClick={handleClick}
          />
        </div>
        <div>
          <img src={ButtonMenu} alt="" style={{ cursor: "pointer" }} />
        </div>
        <div className="dropdown">
          <img src={ButtonSetting} alt="" onClick={toggleDropdown} />
          {open && (
            <div className="dropdown-content">
              <a>
                <img
                  src={Sound}
                  alt=""
                  style={{ padding: "5px 10px 0 20px", cursor: "pointer" }}
                />
                DFX
              </a>
              <a>
                <img
                  src={MakeGold}
                  alt=""
                  style={{ padding: "0px 10px 0 20px", cursor: "pointer" }}
                />
                KIẾM GOLD
              </a>
              {username ? (
                <a onClick={() => handleLogOut()}>
                  <img
                    src={LogReview}
                    alt=""
                    style={{ padding: "0px 10px 0 20px", cursor: "pointer" }}
                  />
                  ĐĂNG XUẤT
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
