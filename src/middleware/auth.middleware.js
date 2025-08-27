import jwt from "jsonwebtoken";
import { SocketError } from "../utils/socketError.js";

export const socketAuth = () => {
    return async (socket, next) => {
        try {
            const token = socket.handshake?.auth?.token;
            console.log("token->",token);
            
            if (!token) {
                console.log("token still not recieved ");
                
                return next(new SocketError("Authentication required", "AUTH_REQUIRED"));
            }
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log("User");
            
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