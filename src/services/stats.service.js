import { prisma } from "../config/prisma.js"
export const computeAdminStats = async () => {
    const [totalUsers, totalEvents, upcomingEvents, totalRegistrations, pendingRequests] = await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.event.count({
            where: {
                date: { gte: new Date().toISOString() }
            }
        }),
        prisma.registration.count(),
        prisma.organizerRequest.count({
            where: {
                status: "PENDING"
            }
        })
    ])
    return { totalUsers, totalEvents, activeEvents: upcomingEvents, totalRegistrations, pendingRequests, updatedAt: new Date().toISOString() }
}

export const computeOrganizerStats = async (userId) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [totalEvents, upcomingEvents, totalRegistrations, thisMonth] = await Promise.all([
        prisma.event.count({
            where: {
                createdBy: userId
            }
        }),
        prisma.event.count({
            where: {
                createdBy: userId,
                date: { gte: new Date().toISOString() }
            }
        }),
        prisma.registration.count({
            where: {
              event :   {createdBy: userId}
            }
        }),
        prisma.registration.count({
            where: {
                event: { createdBy: userId },
                createdAt: { gte: thirtyDaysAgo.toISOString() }
            }
        })
    ])
    return { totalEvents, activeEvents: upcomingEvents, totalRegistrations, thisMonth, updatedAt: new Date().toISOString() };
}