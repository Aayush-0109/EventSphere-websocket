import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import redisService from '../src/config/redis.js'
import { CH, EVENTS, ROOMS } from './utils/constants.js'
import cookieParser from 'cookie-parser'
import { socketAuth } from './middleware/auth.middleware.js'
import { makeNotificationHandlers } from './handlers/notificationHandler.js'
import { connectDB } from './config/prisma.js'
import { computeAdminStats } from './services/stats.service.js'
import onlineService from './services/online.service.js'
import { handleAdminEvents } from './handlers/admin.handler.js'
import { log } from 'console'
import { handleOrganizerEvents } from './handlers/organizer.handler.js'
dotenv.config()

const app = express()
const server = createServer(app);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))



const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ['GET', "POST"]
    },
    transports: ['websocket', "polling"],
    pingInterval: 25000,
    pingTimeout: 6000
})


io.engine.use(cookieParser())
io.use(socketAuth())


const { handleAdminNotification, handleNotification } = makeNotificationHandlers()


io.on('connection', (socket) => {

    
    if (socket?.user?.role === "ADMIN") {
        handleAdminEvents(io, socket)
        handleOrganizerEvents(socket)
    }
    if (socket?.user?.role === "ORGANIZER") handleOrganizerEvents(socket)
    console.log('connected:', socket.id, 'user:', socket.user)
    const onlineCount = onlineService.addUser(socket)

    if (socket.user.id) socket.join(ROOMS.USER(socket.user.id))
    if (socket.user.role) socket.join(ROOMS.ROLE(socket.user.role))
    io.to(ROOMS.ADMIN).emit(EVENTS.ADMIN.ONLINE_UPDATE, {
        onlineUsers: onlineCount
    })

    socket.on('join_event_room', (eventId) => {
        socket.join(ROOMS.EVENT(eventId));
    });
    socket.on(`leave_event_room`, (eventId) => {
        socket.leave(ROOMS.EVENT(eventId))
    })


    
    socket.on('disconnect', (reason) => {

        const onlineCount = onlineService.removeUser(socket);

        io.to(ROOMS.ADMIN).emit(EVENTS.ADMIN.ONLINE_UPDATE, {
            onlineUsers: onlineCount
        })
        console.log('User disconnected:', socket.id, 'Reason:', reason);
    });
    socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date() })
    })

});

let statsInterval
const startStatsInterval = () => {
    statsInterval = setInterval(async () => {

        try {
            const stats = await computeAdminStats();
            io.to(ROOMS.ADMIN).emit(EVENTS.ADMIN.STATS_UPDATE, stats)
        } catch (error) {
            console.error('Error in stats interval:', error);
        }
    }, 15000)
}
startStatsInterval()






async function startServer() {
    try {
        await redisService.connect();
        await redisService.subscribe(CH.notifications, handleNotification);
        await redisService.subscribe(CH.admin, handleAdminNotification);
        const PORT = process.env.PORT || 8001
        await connectDB().catch((reason) => { throw new Error(reason) })
        server.listen(PORT, () => {
            console.log(`🚀 WebSocket server running on port ${PORT}`);
        })
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', () => {
    if (statsInterval) {
        clearInterval(statsInterval);
        console.log('Stats interval cleared');
    }
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    if (statsInterval) {
        clearInterval(statsInterval);
        console.log('Stats interval cleared');
    }
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
    });
})

await startServer()
