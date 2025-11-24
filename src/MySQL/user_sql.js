import { sqlPool } from './connectionSQL.js'

const User = {

    search: async (req, res) => {
        const { search, page, limit, sortBy, sortOrder } = req.body;

        if (!search || search.trim() === '') {
            return res.status(400).json({
                success: false,
                mensaje: 'El parámetro de búsqueda es requerido'
            });
        }

        const sorterOrder = sortOrder ? sortOrder : 'ASC';

        const validSortColumns = ['id_user', 'name', 'lastname', 'email'];
        const validSortOrders = ['ASC', 'DESC'];

        const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'id_user';
        const sanitizedSortOrder = validSortOrders.includes(sorterOrder.toUpperCase()) ? sorterOrder.toUpperCase() : 'ASC';

        const searchTerm = `%${search.trim()}%`;
        const offset = (page - 1) * limit;

        try {
            // Consulta principal con paginación
            const query = `
            SELECT *
            FROM asistentes 
            WHERE name LIKE ? 
               OR lastname LIKE ? 
               OR email LIKE ?
            ORDER BY ${sanitizedSortBy} ${sanitizedSortOrder}
            LIMIT ? OFFSET ?
        `;

            // Consulta para el total de resultados
            const countQuery = `
            SELECT COUNT(*) as total 
            FROM asistentes 
            WHERE name LIKE ? 
               OR lastname LIKE ? 
               OR email LIKE ?
        `;

            const [results] = await sqlPool.execute(query, [searchTerm, searchTerm, searchTerm, String(limit), String(offset)]);
            const [countResult] = await sqlPool.execute(countQuery, [searchTerm, searchTerm, searchTerm]);

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: results,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: totalPages,
                    total: total,
                }
            });

        } catch (error) {
            console.error('Error en la búsqueda paginada:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error interno del servidor'
            });
        }
    },

    list: async (req, res) => {
        const { page, limit, sortBy, sortOrder } = req.body;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                mensaje: 'Los parámetros page y limit deben ser números válidos mayores a 0'
            });
        }

        const sorterOrder = sortOrder ? sortOrder : 'ASC';

        const validSortColumns = ['id_user', 'name', 'lastname', 'email'];
        const validSortOrders = ['ASC', 'DESC'];

        const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'id_user';
        const sanitizedSortOrder = validSortOrders.includes(sorterOrder.toUpperCase()) ? sorterOrder.toUpperCase() : 'ASC';

        const offset = (page - 1) * limit;

        const query = `SELECT * FROM asistentes ORDER BY ${sanitizedSortBy} ${sanitizedSortOrder} LIMIT ? OFFSET ? ;`; // LIMIT ?, ? → primero OFFSET, luego LIMIT

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM asistentes 
        `;

        try {
            const [result] = await sqlPool.execute(query, [String(limit), String(offset)]);
            console.log('Consultando Chanchitos :)');
            const [countResult] = await sqlPool.execute(countQuery);
            console.log('Consultando total de Chanchitos :)');

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            res.status(200).json({
                success: true,
                data: result,
                pagination: {
                    current: parseInt(page),
                    totalPages: totalPages,
                    total: total,
                },
                sorter: {
                    sortBy: sanitizedSortBy,
                    sortOrder: sanitizedSortOrder
                }
            });
        } catch (error) {
            console.error('Error al solicitar chanchitos: ', error)
            res.status(500).json({
                success: false,
                mensaje: 'Error interno del servidor',
                error: error
            });
        }
    },

    oneById: async (req, res) => {
        const id = req.params
        sqlPool.query(`SELECT * FROM asistentes WHERE id_user = ${id.id_user}`, (err, rows) => {
            if (err) throw err;
            const results = Object.values(rows);
            console.log('Consultando Chanchito indicado :)')
            res.send(results)
        })
        res.status(200)
    },

    listById: async (req, res) => {
        const IDs = req.body
        const query = `SELECT * FROM asistentes WHERE id_user = ?`

        try {
            const result = [];
            for (const id of IDs) {
                try {
                    const [rows] = await sqlPool.query(query, [id]);
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

    createAdmin: async (req, res) => {
        let { name, lastname, email } = req.body
        const queryCreate = `INSERT INTO asistentes 
                        SET name = ?, lastname = ?, email = ?`
        const queryUser = `SELECT * FROM asistentes WHERE email = ?`

        try {
            const [resultUser] = await sqlPool.query(queryUser, [email]);
            if (resultUser.length >= 1) {
                ({ name, lastname } = resultUser[0]);
                const { id_user } = resultUser[0];
                console.log('ID del usuario existente con ese correo: ', id_user);
                console.log('Chanchito ya existía :) ');
                res.status(409).json({ error: 'Ya existe un usuario con ese correo', result: { insertId: id_user, }, resultUser });
            } else {
                const [result] = await sqlPool.query(queryCreate, [name, lastname, email])
                console.log('ID del usuario creado: ', result.insertId);
                console.log('Chanchito creado :) ');
                res.status(201).json({ mensaje: 'Usuario creado', result });
            }
        } catch (error) {
            console.error('Error al crear chanchito: ', error)
            res.status(500).json({ error: 'Error al crear usuario' });
        }
    },

    createUser: async (req, res) => {
        let { name, lastname, email, id_event, idsUsers } = req.body
        console.log(idsUsers);
        const queryCreate = `INSERT INTO asistentes 
                        SET name = ?, lastname = ?, email = ?`
        const queryUser = `SELECT * FROM asistentes WHERE email = ?`
        const queryReserv = `SELECT reservaciones.id_reservation, asistentes.email, reservaciones.nameReservation
                            FROM qr
                            LEFT JOIN reservaciones ON reservaciones.id_reservation = qr.id_reservation
                            LEFT JOIN asistentes ON qr.id_user = asistentes.id_user
                            WHERE asistentes.email = ? AND reservaciones.id_event = ?`

        try {
            const [resultReserv] = await sqlPool.query(queryReserv, [email, id_event]);
            if (resultReserv.length >= 1) {
                const { id_reservation, email, nameReservation } = resultReserv[0];
                console.log('Ya existe una reservación al evento: ', id_reservation, ' A nombre de: ', nameReservation);
                console.log('Chanchito ya existe en otra reservación :) ');
                res.status(409).json({ error: `El usuario ingresado con el correo: ${email} ya está resgistrado en una reservación a nombre de: ${nameReservation}`, resultReserv });
            } else {
                const [resultUser] = await sqlPool.query(queryUser, [email]);
                if (resultUser.length >= 1) {
                    if (idsUsers.length !== 0) {
                        for (const id of idsUsers) {
                            if (resultUser[0].id_user === id) {
                                console.log('Chanchito ya está registrado en la reservación en curso :( ');
                                res.status(409).json({ error: `El usuario ingresado con el correo: ${email} ya está resgistrado para esta reservación`, resultReserv });
                            }
                            return
                        }
                    }
                    ({ name, lastname } = resultUser[0]);
                    const { id_user } = resultUser[0];
                    console.log('ID del usuario existente con ese correo: ', id_user);
                    console.log('Chanchito ya existía :) ');
                    res.status(200).json({ mensaje: 'Ya existía en BD', result: { insertId: id_user, }, resultUser });
                } else {

                    const [result] = await sqlPool.query(queryCreate, [name, lastname, email])
                    console.log('ID del usuario creado: ', result.insertId);
                    console.log('Chanchito creado :) ');
                    res.status(201).json({ mensaje: 'Creado en BD', result });

                }
            }
        } catch (error) {
            console.error('Error al crear chanchito: ', error)
            res.status(500).json({ error: 'Error al crear usuario' });
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
            const [resultUser] = await sqlPool.query(queryUser, [id]);
            const [resultEmail] = await sqlPool.query(queryEmail, [email, id]);
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
        const queryUser = `SELECT * FROM asistentes WHERE id_user = ?`
        try {
            const [resultUser] = await sqlPool.query(queryUser, [id]);
            if (resultUser.length >= 1) {
                const [result] = await sqlPool.execute(query, [id]);
                console.log('Filas afectadas: ', result.affectedRows);
                console.log('ID de Usuario eliminado: ', id);
                console.log('Chanchito eliminado :(');
                res.status(201).json({ mensaje: 'Usuario eliminado de la BD', result });
            } else {
                console.log('No existen chanchitos con ID: ', id);
                res.status(409).json({ error: 'Usuario no existe en la BD', resultUser });
            }
        } catch (error) {
            console.error('Error al eliminar chanchito: ', error)
            res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    }
}

export { User }

