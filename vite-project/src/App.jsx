import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { RouterName } from "../constants/index.js";
import { Layout } from "./component/layout/index.jsx";
import Fight from "./pages/Fight/index.jsx";
import Home from "./pages/Home/index.jsx";
import FightBot from "./pages/FightComputer/index.jsx";
import Room from "./pages/Room/index.jsx";
function App() {
  return (
    <Layout>
      <BrowserRouter>
        <Routes>
          <Route path={RouterName.HOME} element={<Home />} />
          <Route path={RouterName.FIGHT} element={<Fight />} />
          <Route path={RouterName.FIGHTBOT} element={<FightBot />} />
          <Route path={RouterName.ROOM} element={<Room />} />
        </Routes>
      </BrowserRouter>
    </Layout>
  );
}
export default App;
