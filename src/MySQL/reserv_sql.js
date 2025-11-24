import { sqlPool } from './connectionSQL.js'

const Reserv = {

    // list: async (req, res) => {
    //     const query = 'SELECT * FROM asistentes '
    //     try {
    //         const [result] = await sqlPool.execute(query);
    //         console.log('Consultando Chanchitos :)');
    //         res.status(200).send(result);
    //     } catch (error){
    //         console.error('Error al solicitar chanchitos: ', error)
    //         res.status(500).send(error).json({ error: 'Error al solicitar usuarios' });
    //     }
    // },

    list: async (req, res) => {
        const { page, limit, sortBy, sortOrder, event_name, typeReservation } = req.body;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                mensaje: 'Los parámetros page y limit deben ser números válidos mayores a 0'
            });
        }

        const sorterOrder = sortOrder ? sortOrder : 'ASC';

        const validSortColumns = ['id_reservation', 'nameReservation', 'event_name', 'typeReservation'];
        const validSortOrders = ['ASC', 'DESC'];

        const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'id_reservation';
        const sanitizedSortOrder = validSortOrders.includes(sorterOrder.toUpperCase()) ? sorterOrder.toUpperCase() : 'ASC';

        const offset = (page - 1) * limit;

        // Construir consultas dinámicas
        let whereConditions = [];
        let queryParams = [];

        // Filtro por nombre de evento
        if (event_name && event_name.length > 0) {
            // event_name puede ser un array si se seleccionan múltiples filtros
            const placeholders = event_name.map(() => '?').join(',');
            whereConditions.push(`eventos.event_name IN (${placeholders})`);
            queryParams.push(...event_name);
        }

        if (typeReservation && typeReservation.length > 0) {
            const placeholders = typeReservation.map(() => '?').join(',');
            whereConditions.push(`tipo_reservacion.typeReservation IN (${placeholders})`);
            queryParams.push(...typeReservation);
        }

        // Construir la cláusula WHERE
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `SELECT reservaciones.id_reservation, reservaciones.reservationDate, reservaciones.nameReservation, eventos.event_name, tipo_reservacion.typeReservation, mesas.numMesa, reservaciones.numAsistentes
                    FROM reservaciones
                    LEFT JOIN eventos ON eventos.id_event = reservaciones.id_event
                    LEFT JOIN tipo_reservacion ON tipo_reservacion.id_typeReservation = reservaciones.id_typeReservation
                    LEFT JOIN mesas ON mesas.id_mesa = reservaciones.id_mesa
                    ${whereClause}
                    ORDER BY reservaciones.${sanitizedSortBy} ${sanitizedSortOrder} LIMIT ? OFFSET ? ;`; // LIMIT ?, ? → primero OFFSET, luego LIMIT

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM reservaciones 
        `;

        try {
            const finalParams = [...queryParams, String(limit), String(offset)];
            const [result] = await sqlPool.execute(query, finalParams);
            console.log('Consultando reservaciones de Chanchitos :)');
            
            const [countResult] = await sqlPool.execute(countQuery);
            console.log('Consultando total de reservaciones de Chanchitos :)');

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            const newData = result.map(reservacion => ({
                ...reservacion,
                reservationDate: reservacion.reservationDate.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
            }));

            res.status(200).json({
                success: true,
                data: newData,
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
            console.error('Error al solicitar reservaciones de chanchitos: ', error)
            res.status(500).json({
                success: false,
                mensaje: 'Error interno del servidor',
                error: error
            });
        }
    },

    listById: async (req, res) => {
        const id = req.params
        sqlPool.query(`SELECT * FROM reservaciones WHERE id_reservation = ${id.id_reservation}`, (err, rows) => {
            if (err) throw err;
            const results = Object.values(rows);
            console.log('Consultando reservación de Chanchito indicado :)');
            res.send(results);
        })
        res.status(200)
    },

    create: async (req, res) => {
        const { nameReservation, id_event, id_typeReservation } = req.body
        const queryRes = `INSERT INTO reservaciones 
                        SET nameReservation = ?, id_event = ?, id_typeReservation = ?`
        const queryUser = `SELECT * FROM reservaciones WHERE nameReservation = ? AND id_event = ?`
        try {
            const [resultUser] = await sqlPool.query(queryUser, [nameReservation, id_event]);
            if (resultUser.length >= 1) {
                console.log('Se negó la creación de la reservación porque ya existe una a ese nombre: ', resultUser[0].nameReservation);
                res.status(409).json({ error: `Ya existe una reservación a nombre de: ${nameReservation}` })
            } else {
                const [result] = await sqlPool.query(queryRes, [nameReservation, id_event, id_typeReservation])
                console.log('ID de la reservación creada: ', result.insertId);
                console.log('Reservación creada :) ');
                res.status(201).json({ mensaje: 'Creado en BD', result });
            }
        } catch (error) {
            console.error('Error al crear reservación: ', error)
            res.status(500).json({ error: 'Error al crear reservación' });
        }

    },

    update: async (req, res) => {
        const { nameReservation, event_name, typeReservation, numMesa } = req.body
        const id = req.params.id_user
        const query = `UPDATE reservaciones 
                        SET nameReservation = ?, event_name = ?, typeReservation = ?, numMesa = ?
                        WHERE id_reservation = ?`
        try {
            const [result] = await sqlPool.execute(query, [nameReservation, event_name, typeReservation, numMesa, id]);
            console.log('Filas afectadas: ', result.affectedRows);
            console.log('Reservación actualizada');
            res.status(201).json({ mensaje: 'Actualizado en BD', result });
        } catch (error) {
            console.error('Error al actualizar reservación: ', error)
            res.status(500).json({ error: 'Error al actualizar reservación' });
        }
    },

    destroy: async (req, res) => {
        const id = req.params.id_reservation
        const query = `DELETE FROM reservaciones
                        WHERE id_reservation = ?`
        try {
            const [result] = await sqlPool.execute(query, [id]);
            console.log('Filas afectadas: ', result.affectedRows);
            console.log('ID de Usuario eliminado: ', id);
            console.log('Chanchito eliminado :(');
            res.status(201).json({ mensaje: 'Eliminado de BD', result });
        } catch (error) {
            console.error('Error al eliminar reservación: ', error)
            res.status(500).json({ error: 'Error al eliminar reservación' });
        }
    }
}

export { Reserv }

