import  jwt  from 'jsonwebtoken'
import { SocketError } from '../utils/socketError.js';
import axios from 'axios'

const BACKEND_URL = process.env.BACKEND_URL
export const socketAuth = (opt = {}) => {
    return async (socket, next) => {
        try {
            const cookieHeader = socket.request?.headers?.cookie || '';
            if (!cookieHeader) {
                return next(new SocketError('Authentication required', 'AUTH_REQUIRED'));
            }
            const resp = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
                headers: { Cookie: cookieHeader },
                timeout: 2000
            });
            const user = resp.data?.data;
            if (!user?.id) {
                return next(new SocketError('Authentication failed', 'AUTH_FAILED'));
            }

            socket.user = user;
            return next();



        } catch (error) {
            const err = error instanceof SocketError
                ? error
                : new SocketError('Authentication failed', 'AUTH_FAILED', { reason: 'invalid_or_missing_token' });
            next(err);
        }
    }
}