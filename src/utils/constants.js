export const CH = {
    notifications: 'eb:chan:notifications',
    admin: 'eb:chan:admin_notifications'
};

export const EVENTS = {
    ADMIN: {
        REQUEST_STATS: 'request_admin_stats',
        STATS_UPDATE: 'dashboard_stats_update',
        ONLINE_UPDATE: 'dashboard_online_update'
    },
    ORGANIZER: {
        REQUEST_STATS: 'request_organizer_stats',
        STATS_UPDATE: 'organizer_stats_update'
    },
    ERROR : 'error'
};

export const ROOMS = {
    ADMIN: 'role_ADMIN',
    USER: (userId) => `user_${userId}`,
    EVENT: (eventId) => `event_${eventId}`,
    ROLE : (role)=> `role_${role}`
};