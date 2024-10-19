import { useEffect, useState } from "react";
import RoomLayout from "../../assets/room-layout.png";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { RouterName } from "../../../constants";

const socket = io("http://localhost:3000");
export default function RoomContent() {
  const navigate = useNavigate();
  const [roomID, setRoomID] = useState("");
  const [startGame, setStartGame] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomCreated, setRoomCreated] = useState(false);

  const createRoom = () => {
    const newRoomID = Math.floor(1 + Math.random() * 9).toString();
    setRoomID(newRoomID);
    socket.emit("createRoom", newRoomID);
    localStorage.setItem("roomID", newRoomID);
    setStartGame(true);
  };
  //phân biệt đâu là player 1 và player 2
  // để biết được khi tạo sẽ là:
  ///mặc định player 1 là người creat ed room
  /// nếu không phải player 1 thì
  // có room: thì sẽ là player 2 (cả 2 trong 1 room => room đầy)

  const joinedRoom = (roomID) => {
    if (roomID) {
      socket.emit("joinRoom", roomID);
    } else {
      alert("vui long nhap so phong");
    }
  };
  useEffect(() => {
    socket.on("waiting_for_player", (data) => {
      console.log("dddd", data);
      if (data.player1) {
        setStartGame(true);
      }
    });
    socket.on("room-created", () => {
      setRoomCreated(true);
    });
    socket.on("gameReady", (data) => {
      if (data.roomID && data.playe1 && data.player2) {
        setStartGame(false);
      }
    });
    socket.on("room-list", (data) => {
      setRooms(data);
    });
    socket.on("playersConnected", (data) => {
      navigate(
        `${RouterName.FIGHT.replace(":roomID", data.roomID).replace(
          ":player",
          `${data.player1 ? 1 : 2}`
        )}`
      );
    });
    return () => {
      socket.off("room-list");
      socket.off("game-ready");
      socket.off("room-created");
      socket.off("playersConnected");
      socket.off("waiting_for_player");
    };
  }, [navigate, startGame, rooms]);
  console.log(rooms);
  return (
    <div className="room-content">
      <div>
        {startGame ? (
          <div className="text-content">Waiting For Player.........</div>
        ) : (
          <div className="input-room">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                joinedRoom(roomID);
              }}
            >
              <input
                type="text"
                placeholder="nhap ID phong muon choi"
                className="input-id-room"
                onChange={(e) => setRoomID(e.target.value)}
              />
            </form>
            <button className="create-room" onClick={createRoom}>
              Tạo Phòng
            </button>

            <div className="container">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <div className="room" key={room}>
                    <div className="number-room">room: {room}</div>
                    <img src={RoomLayout} alt="" />
                    <div
                      className="button-run"
                      onClick={() => joinedRoom(room)}
                    >
                      Chơi Ngay
                    </div>
                  </div>
                ))
              ) : (
                <p>no rooms</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
