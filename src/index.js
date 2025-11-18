import express from 'express'
// import {Auth, isAuthenticated} from './controllers/auth.controller.js'
import dotenv from 'dotenv'
import cors from "cors"
import cookieParser from 'cookie-parser'
// import {User} from './MySQL/user_sql.js'
// import {Reserv} from './MySQL/reserv_sql.js'
import { sqlPool } from './MySQL/connectionSQL.js'
// import { validation } from './Middlewares/joiValidation.js'
// import { schemas } from './Middlewares/joiSchemas.js'
// import { Qr } from './MySQL/qr_sql.js'
import emailRoutes from './routes/emailRoutes.js'
import usuarioRoutes from './routes/userUsuarioRoutes.js';
import adminRoutes from './routes/userAdminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { PORT, corsOptions } from './config/config.js'

try {
    const [result] = await sqlPool.execute('SELECT 1');
    console.log('✅ Conexión exitosa a BD: ', result.length);
} catch (error) {
    console.error('❌ Error de conexión a BD: ', error.message);
}

dotenv.config({ path: './env/.env' });


const app = express();
app.set('trust proxy', 1);

// Middleware para evitar redirecciones que cambian POST a GET
app.use((req, res, next) => {
    // Si es HTTP y estamos en producción, haz la redirección manteniendo el método
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            // Para métodos que no deben cambiar, no redirecciones automáticamente
            return next();
        }
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
});

// Middleware de logging para DEBUG
app.use((req, res, next) => {
    console.log('🔍 Petición recibida:', {
        method: req.method,
        originalMethod: req.headers['x-original-method'], // Método original
        url: req.url,
        originalUrl: req.originalUrl,
        protocol: req.protocol,
        'x-forwarded-proto': req.headers['x-forwarded-proto'],
        'x-forwarded-method': req.headers['x-forwarded-method'],
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        timestamp: new Date().toISOString()
    });
    next();
});

app.use(express.json());

app.use(cors(corsOptions));

app.use(cookieParser());

app.get('/', (req, res) => {
    console.log('Hello');
    res.send('Hello World!');
});

app.post('/prueba', (req, res) => {
    console.log('✅ Petición POST recibida correctamente');
    res.json({ message: 'Funciona!' });
});

app.use('/email', emailRoutes);

app.use('/usuario', usuarioRoutes);

app.use('/admin', adminRoutes);

app.use('/auth', authRoutes);

// ✅ MIDDLEWARE PARA RUTAS NO ENCONTRADAS (SOLUCIÓN)
app.use((req, res, next) => {
    console.log('❌ Ruta no encontrada:', req.method, req.originalUrl);
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        message: `No se encontró la ruta ${req.method} ${req.originalUrl}`
    });
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error global:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`)
});
