import HomeContent from "./HomeContent";
import background from "../../assets/PictureOanTuXi.png";
import Footer from "../../component/footer";
import Header from "../../component/header";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { RouterName } from "../../../constants";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate(RouterName.AUTH);
      return;
    }
    try {
      const data = jwtDecode(token);
      setUsername(data.username);
    } catch (error) {
      localStorage.removeItem("access_token");
      navigate(RouterName.AUTH);
    }
  }, [navigate]);

  return (
    <div className="content">
      <Header />
      <div className="logo">
        <img src={background} alt="background" />
      </div>
      <HomeContent />
      <Footer username={username} />
    </div>
  );
}
