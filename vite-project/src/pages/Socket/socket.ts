import io, { Socket } from "socket.io-client";
let _socket: Socket | null = null;


export function getSocket(): Socket {
    if (!_socket) {
        _socket = io("http://localhost:3000", { transports: ["websocket"], reconnectionAttempts: 5, reconnectionDelay: 1000 });
    }
    return _socket;
}
