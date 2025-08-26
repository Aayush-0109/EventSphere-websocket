import Redis from 'ioredis'
import dotenv from 'dotenv'
import { json } from 'express';
dotenv.config()


class RedisService {
    constructor() {
        this.client = null;
        this.subscriber = null;
        this.isConnected = false;
    }
    async connect() {
        try {
            this.client = new Redis({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                username: process.env.REDIS_USERNAME,
                password: process.env.REDIS_PASSWORD,
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                showFriendlyErrorStack: true,
               

            });

            this.subscriber = new Redis({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                username: process.env.REDIS_USERNAME,
                password: process.env.REDIS_PASSWORD,
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                showFriendlyErrorStack: true
            })
            await this.client.connect();
            await this.subscriber.connect()

            this.isConnected = true;
            console.log("Redis Cloud connected Successfully!");

            await this.client.ping()
            console.log("Redis ping successfully")

            this.setUpClientEvents(this.client, 'Main Client')
            this.setUpClientEvents(this.subscriber, 'Subscriber');


        } catch (error) {
            console.error('❌ Redis connection failed:', error);
            this.isConnected = false;
            throw error;
        }
    }
    setUpClientEvents(client, clientName) {
        client.on('connect', () => {
            console.log(` ${clientName} connected to redis`)
        })
        client.on('ready', () => {
            console.log(`${clientName} ready to use`);

        })
        client.on('error', (err) => {
            console.error(`❌ ${clientName} error:`, err);
            this.isConnected = false;
        });

        client.on('close', () => {
            console.log(`🔌 ${clientName} connection closed`);
            this.isConnected = false;
        });

        client.on('reconnecting', () => {
            console.log(`🔄 ${clientName} reconnecting...`);
        });

        client.on('end', () => {
            console.log(`🏁 ${clientName} connection ended`);
            this.isConnected = false;
        });
    }

    async publish(channel,data) {
        if(!this.isConnected) throw new Error("Redis not connected")
            const payload = typeof data=== 'string' ? data : JSON.stringify(data)
        return this.client.publish(channel,payload)
    }
    async subscribe(channel,handler){
        if(!this.isConnected) throw new Error("Redis not connected");
        await this.subscriber.subscribe(channel);

        this.subscriber.on('message',(ch,message)=>{
              if(ch!== channel) return;
              try {
                const parsed = JSON.parse(message);
                handler(parsed)
              } catch (error) {
                handler(message)
              }
        })
    }
}

export default new RedisService()