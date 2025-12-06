import dotenv from 'dotenv'

dotenv.config({ path: './env/.env' });

export const { PORT = 3000 } = process.env;

const originClient = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : process.env.CLIENT_URL;
console.log(originClient);

export const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            "http://192.168.100.203",
            "http://192.168.100.203:5173",
            "http://192.168.100.202",
            'http://localhost:5173',
            'https://salsaprod-production.up.railway.app' // Reemplaza con tu URL real
        ];

        // Permitir requests sin origin (como Postman, curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "sessionId", "Authorization", 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
};