import { sqlPool } from './connectionSQL.js'
import crypto from 'crypto';

const Userlog = {

    findById: async (id) => {
        try {
            const query = `SELECT userslog.id_userlog, userslog.username, userslog.password, userrole.role
                            FROM userslog
                            LEFT JOIN userrole ON userslog.id_role = userrole.id_role
                            WHERE userslog.id_userlog = ?`
            const [result] = await sqlPool.execute(query, [id]);
            if (result.length >= 2) {
                throw new Error('Se encontró más de un usuario con ese ID');
            } else if (result.length === 0 || result.length === 1) {
                console.log(result.length === 0 ? 'No se encontraron chanchitos con ese ID :(' : `Chanchito encontrado con ID: ${id}`);
                return result
            } else {
                throw new Error('Error al consultar chanchito :(');
            }
        } catch (error) {
            console.log('Error :( ', error)
            const result = error.message
            return result
        }
    },

    findByUsername: async (username) => {
        try {
            const query = `SELECT userslog.id_userlog, userslog.username, userslog.password, userrole.role
                            FROM userslog
                            LEFT JOIN userrole ON userslog.id_role = userrole.id_role
                            WHERE userslog.username = ?`
            const [result] = await sqlPool.execute(query, [username]);
            if (result.length >= 2) {
                throw new Error('Se encontró más de un usuario con ese username');
            } else if (result.length === 0 || result.length === 1) {
                console.log(result.length === 0 ? 'No se encontraron chanchitos con ese username :)' : `Chanchito encontrado con username: ${username}`);
                return result;
            } else {
                throw new Error('Error al consultar chanchito :(');
            }
        } catch (error) {
            console.error('Error en findByUsername :( ', error)
            const result = error.message
            return result
        }
    },

    listById: async (req, res) => {
        const IDs = req.body
        const query = `SELECT * FROM userslog WHERE id_user = ?`

        try {
            const result = [];
            for (const id of IDs) {
                try {
                    const [rows] = await sqlPool.execute(query, [id]);
                    result.push(rows[0]);
                } catch (error) {
                    console.error(`Error con ID ${id}:`, error);
                }
            }
            if (result.length !== 0) {
                console.log('Chanchitos encontrados :)')
                res.status(200).json({ mensaje: 'Asistentes encontrados', result })
            } else {
                throw new Error(`No se lograron encontrar resultados para su consulta`);
            }
        } catch (error) {
            console.error('Error al listar chanchitos: ', error.message)
            res.status(500).json({ error: `Error al consultar usuarios: ${error.message}` });
        }

    },

    create: async (username, password) => {

        const queryCreate = `INSERT INTO userslog 
                        SET id_userlog = ?, username = ?, password = ? `
        const queryUser = `SELECT * FROM userslog WHERE username = ?`

        try {
            const [resultUser] = await sqlPool.execute(queryUser, [username]);
            if (resultUser.length >= 1) {
                const { id_userlog } = resultUser[0];
                console.log('ID del usuario existente con ese correo: ', id_userlog);
                console.log('Chanchito ya existía :( ');
                throw new Error('Ya existe un usuario con ese username');
            } else {
                const id = crypto.randomUUID();
                const [result] = await sqlPool.execute(queryCreate, [id, username, password]);
                if (result.insertId !== undefined) {
                    console.log('ID del usuario creado: ', result.insertId);
                    console.log('Chanchito creado :) ');
                    return id
                } else {
                    throw new Error('Error al tratar de crear el usuario');
                }

            }
        } catch (error) {
            console.error('Error :( ', error)
            const result = error.message
            return result
        }
    },


    update: async (req, res) => {
        const { name, lastname, email } = req.body
        const id = req.params.id_user
        const query = `UPDATE asistentes 
                        SET name = ?, lastname = ?, email = ?
                        WHERE id_user = ?`;
        const queryEmail = `SELECT * FROM asistentes WHERE email = ? AND id_user != ? `;
        const queryUser = `SELECT name, lastname, email FROM asistentes WHERE id_user = ? `;
        try {
            const [resultUser] = await sqlPool.execute(queryUser, [id]);
            const [resultEmail] = await sqlPool.execute(queryEmail, [email, id]);
            if (JSON.stringify(resultUser[0]) === JSON.stringify(req.body)) {
                console.log('No se realizaron cambios en el canchito con ID: ', id);
                res.status(200).json({ mensaje: `No hubo cambios en el usuario` });
            }

            else if (resultEmail.length >= 1) {
                console.log('Se negó la actualización del usuario porque ya existe uno con ese correo: ', email);
                res.status(409).json({ error: `Ya existe un usuario con el correo: ${email}` });
            } else {
                const [result] = await sqlPool.execute(query, [name, lastname, email, id]);
                console.log('Filas afectadas: ', result.affectedRows);
                console.log('Chanchito actualizado');
                res.status(201).json({ mensaje: 'Usuario actualizado correctamente', result });
            }

        } catch (error) {
            console.error('Error al actualizar chanchito: ', error)
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    destroy: async (req, res) => {
        const id = req.params.id_user
        const query = `DELETE FROM asistentes
                        WHERE id_user = ?`
        try {
            const [result] = await sqlPool.execute(query, [id]);
            console.log('Filas afectadas: ', result.affectedRows);
            console.log('ID de Usuario eliminado: ', id);
            console.log('Chanchito eliminado :(');
            res.status(201).json({ mensaje: 'Usuario eliminado de la BD', result });
        } catch (error) {
            console.error('Error al eliminar chanchito: ', error)
            res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    }
}

export { Userlog }