import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRoom } from "./RoomContext";
import { RouterName } from "../../../constants";

// Component toàn cục để sync player number với URL khi có thay đổi
export default function PlayerNumberSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isInRoom, playerPosition, playerNumber, roomID } = useRoom();

  useEffect(() => {
    // Debug current state
    console.log(`[PlayerNumberSync] Current state:`, {
      isInRoom,
      playerPosition,
      playerNumber,
      roomID,
      pathname: location.pathname,
    });

    // Chỉ xử lý khi đang ở Fight page và có đầy đủ thông tin
    if (isInRoom && playerPosition === "active" && playerNumber && roomID) {
      // Kiểm tra xem có đang ở Fight page không
      const fightMatch = location.pathname.match(/\/fight\/([^/]+)\/(\d+)/);

      if (fightMatch) {
        const currentRoomID = fightMatch[1];
        const currentPlayerNumber = parseInt(fightMatch[2]);

        console.log(
          `[PlayerNumberSync] Fight page detected - Room: ${currentRoomID}, Player: ${currentPlayerNumber}`
        );
        console.log(
          `[PlayerNumberSync] Expected - Room: ${roomID}, Player: ${playerNumber}`
        );

        // Nếu cùng room nhưng player number khác, redirect
        if (
          String(currentRoomID) === String(roomID) &&
          currentPlayerNumber !== playerNumber
        ) {
          console.log(
            `[PlayerNumberSync] ⚠️ Player number mismatch! Redirecting...`
          );
          console.log(
            `[PlayerNumberSync] From ${currentPlayerNumber} to ${playerNumber}`
          );

          const newFightUrl = RouterName.FIGHT.replace(
            ":roomID",
            roomID
          ).replace(":player", playerNumber.toString());

          console.log(`[PlayerNumberSync] New URL: ${newFightUrl}`);
          navigate(newFightUrl, { replace: true });
        } else {
          console.log(`[PlayerNumberSync] ✅ Player number is correct`);
        }
      }
    }
  }, [
    isInRoom,
    playerPosition,
    playerNumber,
    roomID,
    location.pathname,
    navigate,
  ]);

  return null;
}
