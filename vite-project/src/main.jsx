import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoomProvider } from "./pages/Context/RoomContext.jsx";
import { getSocket } from "./pages/Socket/socket";
const socket = getSocket();

const router = createBrowserRouter(
  [
    {
      path: "*",
      element: <App />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RoomProvider socket={socket}>
      <RouterProvider router={router} />
    </RoomProvider>
  </React.StrictMode>
);
