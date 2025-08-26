class OnlineService {
    constructor() {
        this.onlineUsers = new Map();
        this.userToSockets = new Map();
    }

    addUser(socket) {
        const { id: socketId, user } = socket;
        this.onlineUsers.set(socketId, user);
        if (!this.userToSockets.has(user.id)) this.userToSockets.set(user.id, new Set());
        this.userToSockets.get(user.id).add(socketId);

        return this.getOnlineCount();
    }
    removeUser(socket) {
        const { id: socketId, user } = socket;
        this.onlineUsers.delete(socketId);
        if (this.userToSockets.has(user?.id)) {
            this.userToSockets.get(user.id).delete(socketId);
            if (this.userToSockets.get(user.id).size === 0) {
                this.userToSockets.delete(user.id);
            }
        }
        return this.getOnlineCount()
    }
    getOnlineCount() {
        return this.onlineUsers.size;
    }
    getUserSockets(userId) {
        return this.userToSockets.get(userId) || new Set()
    }
}
export default new OnlineService()