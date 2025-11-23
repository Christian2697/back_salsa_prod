import express from 'express'
import bcrypt from 'bcrypt'
import { expressjwt } from 'express-jwt'
import jsonwebtoken from 'jsonwebtoken'
import dotenv from 'dotenv'
import { Userlog } from '../MySQL/userLog_sql.js'
import cookieParser from 'cookie-parser'

dotenv.config({ path: './src/env/.env' });

const secreto = process.env.SECRET;

const signToken = usuario => jsonwebtoken.sign({ usuario }, secreto, { expiresIn: '2h' });

const isAuthenticated = (req, res, next) => {
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado', authenticated: false });
    }

    try {
        const data = jsonwebtoken.verify(token, process.env.SECRET);
        req.user = data; // Aquí se guarda el payload del token en la sesión
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ error: 'Token inválido o expirado', authenticated: false });
    }
};

const Auth = {
    login: async (req, res) => {
        const { username, password } = req.body
        try {
            const [user] = await Userlog.findByUsername(username);
            if (!user) {
                console.error('Chanchito inválido. :(');
                res.status(401).json({ error: 'Usuario inválido' });
            } else {
                const isMatch = await bcrypt.compare(password, user.password)
                if (isMatch) {
                    console.log('Chanchito inició sesión. :)');
                    const { password: _, ...userPublic } = user;
                    const signed = signToken(userPublic);
                    res.status(200)
                        .cookie('access_token', signed, {
                            httpOnly: true, //la cookie sólo se puede acceder en el servidor
                            secure: process.env.NODE_ENV === 'production' ? true : false, // la cookie sólo se puede acceder en https
                            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // la cookie sólo se puede acceder desde el mismo dominio 'strict'
                            maxAge: 2 * 60 * 60 * 1000 // la cookie tiene un tiempo de validez de 2 horas
                        })
                        .json({
                            mensaje: 'Inicio de sesión exitoso',
                            result: { token: signed },
                            user: {
                                id: user.id_userlog,
                                username: user.username,
                                role: user.role
                            },
                            authenticated: true
                        })
                } else {
                    console.error('Password de Chanchito inválida. :(');
                    res.status(401).json({ error: 'Contraseña inválida' });
                }
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    register: async (req, res) => {
        const { username, password } = req.body
        try {
            const isUser = await Userlog.findByUsername(username)
            if (isUser.length !== 0) {
                console.log('Se negó el registro del userlog, porque ya existe el username: ', username);
                res.status(409).json({ error: `Ya existe un usuario con el nombre de usuario: ${username}` });
            } else {
                const salt = await bcrypt.genSalt();
                const hashed = await bcrypt.hash(password, salt);
                try {
                    const id = await Userlog.create(username, hashed);
                    if (id === 'Error al tratar de crear el usuario') {
                        console.log(id);
                        throw new Error('Error al tratar de crear el usuario');
                    } else {
                        const signed = signToken(id)
                        res.status(201).json({ mensaje: `Usuario ${username} registrado exitosamente`, result: { insertId: id, token: signed } });
                    }
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Error interno del servidor' });
                }



            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    verify: async (req, res) => {
        const { usuario } = req.user;
        try {
            const [user] = await Userlog.findByUsername(usuario.username);
            if (!user) {
                console.error('Chanchito del token inválido :(');
                res.status(401).json({ error: 'Usuario que venía en el token es inválido', authenticated: false });
            } else {
                console.log('Verificación del token exitosa :)')
                res.json({
                    mensaje: 'verificación exitosa',
                    user: {
                        id: user.id_userlog,
                        username: user.username,
                        role: user.role
                    },
                    authenticated: true
                });
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error interno del servidor', authenticated: false });
        }
    },

    logout: (req, res) => {
        res.status(200)
            .clearCookie('access_token')
            .json({
                mensaje: 'Cierre de sesión exitoso',
                authenticated: false
            });
    },
}

export { Auth, isAuthenticated }