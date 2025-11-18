import express from 'express'
// import {Auth, isAuthenticated} from './controllers/auth.controller.js'
import dotenv from 'dotenv'
import cors from "cors"
import cookieParser from 'cookie-parser'
// import {User} from './MySQL/user_sql.js'
// import {Reserv} from './MySQL/reserv_sql.js'
import {sqlPool} from './MySQL/connectionSQL.js'
// import { validation } from './Middlewares/joiValidation.js'
// import { schemas } from './Middlewares/joiSchemas.js'
// import { Qr } from './MySQL/qr_sql.js'
import emailRoutes from './routes/emailRoutes.js'
import usuarioRoutes from './routes/userUsuarioRoutes.js';
import adminRoutes from './routes/userAdminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { PORT, corsOptions } from './config/config.js'

try{
    const [result] = await sqlPool.execute('SELECT 1');
    console.log('✅ Conexión exitosa a BD: ', result.length);
} catch (error) {
    console.error('❌ Error de conexión a BD: ', error.message);
}

dotenv.config({ path: './env/.env' });

const app = express();
app.use(express.json());

app.use(cors(corsOptions));

app.use(cookieParser());

app.get('/', (req, res) => {
    console.log('Hello');
    res.send('Hello World!');
});

app.use('/email', emailRoutes);

app.use('/usuario', usuarioRoutes);

app.use('/admin', adminRoutes);

app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`)
});
