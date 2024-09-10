import Plus from "../../assets/PlusForm.png";
import ButtonSetting from "../../assets/Frame-setting.png";
import { useState } from "react";

export default function Header() {
  const [count, setCount] = useState(100);
  function handleClick() {
    setCount(count + 10);
  }
  return (
    <div className="header">
      <div className="energy">
        <div style={{ color: "white", padding: "10px 40px 0 0" }}>{count}</div>
        <div>
          <img
            src={Plus}
            alt=""
            onClick={handleClick}
            style={{ padding: "14px 8px 0 0" }}
          />
        </div>
      </div>
      <div>
        <img
          src={ButtonSetting}
          alt="ReturnChoose"
          style={{ padding: "5px" }}
        />
      </div>
    </div>
  );
}
