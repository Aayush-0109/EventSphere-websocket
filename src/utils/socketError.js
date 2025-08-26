
export class SocketError extends Error {
    constructor(message, code = 'SOCKET_ERROR', data) {
        super(message);
        this.name = 'SocketError';
        this.code = code;   
        this.data = data;   
    }
}
