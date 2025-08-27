import { SocketError } from '../utils/socketError.js';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL;

export const socketAuth = (opt = {}) => {
    return async (socket, next) => {
        try {
            console.log("started websocket auth");
            
            const cookieHeader = socket.request?.headers?.cookie || '';
            
            if (!cookieHeader) {
                console.log("cookies not recieved")
                return next(new SocketError('Authentication required', 'AUTH_REQUIRED'));
            }
            console.log(cookieHeader);
            
            // Send cookies to backend for verification
            const resp = await axios.get(`${BACKEND_URL}/auth/me`, {
                headers: { 
                    Cookie: cookieHeader,
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                timeout: 10000
            });
            console.log(resp);
            
            const user = resp.data?.data;
            if (!user?.id) {
                return next(new SocketError('Authentication failed', 'AUTH_FAILED'));
            }

            socket.user = user;
            return next();

        } catch (error) {
            console.error('WebSocket auth error:', {
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
                hasCookies: !!socket.request?.headers?.cookie
            });
            
            const err = error instanceof SocketError
                ? error
                : new SocketError('Authentication failed', 'AUTH_FAILED', { 
                    reason: error.response?.status === 401 ? 'invalid_cookies' : 'server_error' 
                });
            next(err);
        }
    }
}