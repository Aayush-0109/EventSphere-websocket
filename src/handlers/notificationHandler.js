
export const makeNotificationHandlers = (io) => {
    const handleNotification = (msg) => {
        const { event, data, target } = msg || {};
        if (!event || !target) return
        switch (target.type) {
            case 'all':
                io.emit(event, data);
                break;
            case 'user':
                io.to(`user_${target.userId}`).emit(event, data)
                break;
            case 'role':
                io.to(`role_${target.role}`).emit(event, data)
                break;

            case 'event':
                io.to(`event_${target.eventId}`).emit(event, data)
                break;

            default:
                break;

        }
    }
    const handleAdminNotification = (msg) => {
        const { event, data } = msg || {};
        if (!event) return;
        io.to(`role_ADMIN`).emit(event, data)
    }
    return { handleAdminNotification,handleNotification}
}
