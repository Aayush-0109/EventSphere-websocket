import { EVENTS } from '../utils/constants.js'
import { computeOrganizerStats } from '../services/stats.service.js'

export const handleOrganizerEvents = (socket) => {
    let statsInterval
     
    socket.on(EVENTS.ORGANIZER.REQUEST_STATS, async () => {
        console.log("inside listenr");
        
        try {
            let stats = await computeOrganizerStats(socket.user?.id);
            socket.emit(EVENTS.ORGANIZER.STATS_UPDATE, stats)
        } catch (error) {
            console.log('Failed to fetch stats', error);

            socket.emit(EVENTS.ERROR, { message: 'Failed to fetch stats' })
        } 
        statsInterval = setInterval(async () => {
            try {
                let stats = await computeOrganizerStats(socket.user?.id);
                socket.emit(EVENTS.ORGANIZER.STATS_UPDATE, stats)
            } catch (error) {
                console.log('Failed to fetch stats: ', error);

                socket.emit(EVENTS.ERROR, { message: 'Failed to fetch stats' })
            }
        }, 15000)
    })

    socket.on('disconnect', () => {
        if (statsInterval) clearInterval(statsInterval);
    })



}