import HomeContent from "./HomeContent";
import background from "../../assets/PictureOanTuXi.png";
import Footer from "../../component/footer";
import Header from "../../component/header";

export default function Home() {
  return (
    <div className="content">
      <Header />
      <div className="logo">
        <img src={background} alt="background" />
      </div>
      <HomeContent />
      <Footer />
    </div>
  );
}
