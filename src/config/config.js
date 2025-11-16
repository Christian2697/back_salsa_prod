import dotenv from 'dotenv'

dotenv.config({ path: './env/.env' });

export const { PORT = 3000 } = process.env;

export const corsOptions ={
    origin: ["http://192.168.100.13:5173", process.env.CLIENT_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "sessionId", "Authorization"],
    credentials: true,
    preflightContinue: false,
};