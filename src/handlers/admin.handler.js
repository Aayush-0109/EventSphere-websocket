import { computeAdminStats } from "../services/stats.service.js"
import { EVENTS } from "../utils/constants.js";
import onlineService from "../services/online.service.js";
export const handleAdminEvents = (io, socket) => {
 console.log("inside handleAdmin events");
 
    socket.on(EVENTS.ADMIN.REQUEST_STATS, async () => {
        console.log("req event triggered");
        
        try {
            let stats = await computeAdminStats()
            socket.emit(EVENTS.ADMIN.STATS_UPDATE, stats)
            socket.emit(EVENTS.ADMIN.ONLINE_UPDATE,{
                onlineUsers : onlineService.getOnlineCount()
            })

        } catch (error) {
            console.error('Error computing admin stats:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to fetch stats' });
        }
    });

}

