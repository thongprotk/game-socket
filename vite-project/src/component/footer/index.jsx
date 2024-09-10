import ButtonMenu from "../../assets/Frame-menu.png";
import ButtonSetting from "../../assets/Frame-setting.png";
import ButtonCup from "../../assets/Frame-cup.png";
import Sound from "../../assets/sound.png";
import MakeGold from "../../assets/set-icon.svg";
import LogReview from "../../assets/log-out.svg";
import { useState } from "react";
export default function Footer() {
  const [open, setOpen] = useState(false);
  const toggleDropdown = () => {
    setOpen(!open);
  };
  return (
    <div className="footer">
      <div className="button-click">
        <div>
          <img src={ButtonCup} alt="" style={{ border: "none" }} />
        </div>
        <div>
          <img src={ButtonMenu} alt="" />
        </div>
        <div className="dropdown">
          <img src={ButtonSetting} alt="" onClick={toggleDropdown} />
          {open && (
            <div className="dropdown-content">
              <a>
                <img
                  src={Sound}
                  alt=""
                  style={{ padding: "5px 10px 0 20px" }}
                />
                DFX
              </a>
              <a>
                <img
                  src={MakeGold}
                  alt=""
                  style={{ padding: "0px 10px 0 20px" }}
                />
                KIẾM GOLD
              </a>
              <a>
                <img
                  src={LogReview}
                  alt=""
                  style={{ padding: "0px 10px 0 20px" }}
                />
                ĐĂNG XUẤT
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
