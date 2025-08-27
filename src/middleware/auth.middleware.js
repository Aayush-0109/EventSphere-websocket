import jwt from "jsonwebtoken";
import { SocketError } from "../utils/socketError.js";

export const socketAuth = () => {
    return async (socket, next) => {
        try {
            const token = socket.handshake?.auth?.token;
            if (!token) {
                return next(new SocketError("Authentication required", "AUTH_REQUIRED"));
            }
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (!user?.id) {
                return next(new SocketError("Authentication failed", "AUTH_FAILED"));
            }
            socket.user = user;
            return next();
        } catch (error) {
            return next(new SocketError("Authentication failed", "AUTH_FAILED"));
        }
    };
};