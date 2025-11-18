import dotenv from 'dotenv'

dotenv.config({ path: './env/.env' });

export const { PORT = 3000 } = process.env;

const originClient = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : process.env.CLIENT_URL ;
console.log(originClient);

export const corsOptions ={
    origin: ["http://192.168.100.13:5173", originClient],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "sessionId", "Authorization"],
    credentials: true,
    preflightContinue: false,
};