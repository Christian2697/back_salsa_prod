import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config({ path: './src/env/.env' })

const sqlPool = mysql.createPool({
    host: process.env.NODE_ENV === 'development-laptop' ? '127.0.0.1' : process.env.DB_HOST, 
    user: process.env.NODE_ENV === 'development-laptop' ? 'root' : process.env.DB_USER,
    password: process.env.NODE_ENV === 'development-laptop' ? 'Alanwunlife97' : process.env.DB_PASSWORD,
    database: process.env.NODE_ENV === 'development-laptop' ? 'salsa_demo' : process.env.DB_DATABASE,
    port: process.env.NODE_ENV === 'development-laptop' ? '3306' : process.env.DB_PORT
})

export { sqlPool }