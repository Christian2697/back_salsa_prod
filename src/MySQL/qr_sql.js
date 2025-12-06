import { sqlPool } from './connectionSQL.js'

const Qr = {

    search: async (req, res) => {
        const { qrHash } = req.body;

        // Validar que qrHash venga en el body
        if (!qrHash) {
            return res.status(400).json({
                mensaje: 'El campo qrHash es requerido'
            });
        }

        const query = `SELECT reservaciones.id_reservation, reservaciones.nameReservation, qr.qr_reservation, asistentes.name, asistentes.lastname, asistentes.email, eventos.event_name, mesas.numMesa, estados_pago.payStatus, qr.userAttend
                    FROM qr
                    LEFT JOIN reservaciones ON reservaciones.id_reservation = qr.id_reservation
                    LEFT JOIN asistentes ON qr.id_user = asistentes.id_user
                    LEFT JOIN eventos ON eventos.id_event = reservaciones.id_event
                    LEFT JOIN mesas ON mesas.id_mesa = reservaciones.id_mesa
                    LEFT JOIN estados_pago ON estados_pago.id_payStatus = qr.id_payStatus
                    WHERE qr.qr_reservation = ? `;

        try {
            const [result] = await sqlPool.execute(query, [qrHash.trim()]);
            result.length > 0 ? console.log('QR encontrado \n ID de la reservación: ', result[0].id_reservation)
                : console.log('No se encontraron resultados', result);


            // Siempre devolver 200 con el array de resultados (puede estar vacío)
            res.status(200).json({
                mensaje: result.length > 0 ? 'QR encontrado' : 'No se encontraron resultados',
                result: result
            });

        } catch (error) {
            console.error(`Error con QR ${qrHash}:`, error);
            res.status(500).json({
                mensaje: 'Error al procesar la consulta a la BD',
                error: error.message
            });
        }
    },

    searchList: async (req, res) => {
        const { search, page, limit, sortBy, sortOrder, event_name } = req.body;

        if (!search || search.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'El parámetro de búsqueda es requerido'
            });
        }

        const sorterOrder = sortOrder ? sortOrder : 'ASC';

        const sortMap = {
            nameReservation: 'reservaciones.nameReservation',
            name: 'asistentes.name',
            email: 'asistentes.email'
        };

        const sanitizedSortBy = sortMap[sortBy] || 'qr.id_qr';

        const validSortOrders = ['ASC', 'DESC'];
        const sanitizedSortOrder = validSortOrders.includes(sorterOrder.toUpperCase()) ? sorterOrder.toUpperCase() : 'ASC';

        const searchTerm = `%${search.trim()}%`;
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

        // Construir la cláusula WHERE
        const whereClause = whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : '';

        try {
            // Consulta principal con paginación
            const query = `
            SELECT qr.id_qr, reservaciones.nameReservation, asistentes.name, asistentes.email, eventos.event_name, mesas.numMesa, qr.qr_reservation, metodo_pago.payMethod, estados_pago.payStatus
            FROM qr 
            LEFT JOIN reservaciones ON reservaciones.id_reservation = qr.id_reservation
            LEFT JOIN asistentes ON qr.id_user = asistentes.id_user
            LEFT JOIN eventos ON eventos.id_event = reservaciones.id_event
            LEFT JOIN mesas ON mesas.id_mesa = reservaciones.id_mesa
            LEFT JOIN estados_pago ON estados_pago.id_payStatus = qr.id_payStatus
            LEFT JOIN metodo_pago ON metodo_pago.id_payMethod = qr.id_payMethod
            WHERE (reservaciones.nameReservation LIKE ?
                OR asistentes.name LIKE ? 
                OR asistentes.email LIKE ?)
               ${whereClause}
            ORDER BY ${sanitizedSortBy} ${sanitizedSortOrder}
            LIMIT ? OFFSET ?
        `;

            // Consulta para el total de resultados
            const countQuery = `
            SELECT COUNT(*) as total 
            FROM qr
            LEFT JOIN reservaciones ON reservaciones.id_reservation = qr.id_reservation
            LEFT JOIN asistentes ON qr.id_user = asistentes.id_user
            LEFT JOIN eventos ON eventos.id_event = reservaciones.id_event
            LEFT JOIN mesas ON mesas.id_mesa = reservaciones.id_mesa
            LEFT JOIN estados_pago ON estados_pago.id_payStatus = qr.id_payStatus
            LEFT JOIN metodo_pago ON metodo_pago.id_payMethod = qr.id_payMethod 
            WHERE (reservaciones.nameReservation LIKE ?
                OR asistentes.name LIKE ? 
                OR asistentes.email LIKE ?) 
               ${whereClause} 
        `;

            const baseSearchParams = [searchTerm, searchTerm, searchTerm];
            const finalParams = [...baseSearchParams, ...queryParams, String(limit), String(offset)];
            const [results] = await sqlPool.execute(query, finalParams);

            const countQueryParams = [
                ...baseSearchParams,  // searchTerm, searchTerm, searchTerm  
                ...queryParams        // event_name values
            ];
            const [countResult] = await sqlPool.execute(countQuery, countQueryParams);

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
                error: 'Error interno del servidor'
            });
        }
    },

    list: async (req, res) => {
        const { page, limit, sortBy, sortOrder, event_name } = req.body;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                mensaje: 'Los parámetros page y limit deben ser números válidos mayores a 0'
            });
        }

        const sorterOrder = sortOrder ? sortOrder : 'ASC';

        // const validSortColumns = ['id_qr', 'nameReservation', 'name', 'email'];
        // const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'id_qr';
        const sortMap = {
            nameReservation: 'reservaciones.nameReservation',
            name: 'asistentes.name',
            email: 'asistentes.email'
        };

        const sanitizedSortBy = sortMap[sortBy] || 'qr.id_qr';

        const validSortOrders = ['ASC', 'DESC'];
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

        // if (typeReservation && typeReservation.length > 0) {
        //     const placeholders = typeReservation.map(() => '?').join(',');
        //     whereConditions.push(`tipo_reservacion.typeReservation IN (${placeholders})`);
        //     queryParams.push(...typeReservation);
        // }

        // Construir la cláusula WHERE
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
            SELECT qr.id_qr, reservaciones.nameReservation, asistentes.name, asistentes.email, eventos.event_name, mesas.numMesa, qr.qr_reservation, metodo_pago.payMethod, estados_pago.payStatus
            FROM qr
            LEFT JOIN reservaciones ON reservaciones.id_reservation = qr.id_reservation
            LEFT JOIN asistentes ON qr.id_user = asistentes.id_user
            LEFT JOIN eventos ON eventos.id_event = reservaciones.id_event
            LEFT JOIN mesas ON mesas.id_mesa = reservaciones.id_mesa
            LEFT JOIN estados_pago ON estados_pago.id_payStatus = qr.id_payStatus
            LEFT JOIN metodo_pago ON metodo_pago.id_payMethod = qr.id_payMethod
            ${whereClause}
            ORDER BY ${sanitizedSortBy} ${sanitizedSortOrder} LIMIT ? OFFSET ? ;`; // LIMIT ?, ? → primero OFFSET, luego LIMIT

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM qr
            LEFT JOIN reservaciones ON reservaciones.id_reservation = qr.id_reservation
            LEFT JOIN asistentes ON qr.id_user = asistentes.id_user
            LEFT JOIN eventos ON eventos.id_event = reservaciones.id_event
            LEFT JOIN mesas ON mesas.id_mesa = reservaciones.id_mesa
            LEFT JOIN estados_pago ON estados_pago.id_payStatus = qr.id_payStatus
            LEFT JOIN metodo_pago ON metodo_pago.id_payMethod = qr.id_payMethod
            ${whereClause} 
        `;

        try {
            const finalParams = [...queryParams, String(limit), String(offset)];
            const [result] = await sqlPool.execute(query, finalParams);
            console.log('Consultando reservaciones de Chanchitos :)');

            const [countResult] = await sqlPool.execute(countQuery, queryParams);
            console.log('Consultando total de reservaciones de Chanchitos :)');

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
            console.error('Error al solicitar reservaciones de chanchitos: ', error)
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                mensaje: error
            });
        }
    },


    listById: async (req, res) => {
        const QRs = req.body;
        const query = `SELECT reservaciones.id_reservation, reservaciones.nameReservation, qr.qr_reservation, asistentes.name, asistentes.lastname, asistentes.email, eventos.event_name, mesas.numMesa, estados_pago.payStatus
                        FROM qr
                        LEFT JOIN reservaciones ON reservaciones.id_reservation = qr.id_reservation
                        LEFT JOIN asistentes ON qr.id_user = asistentes.id_user
                        LEFT JOIN eventos ON eventos.id_event = reservaciones.id_event
                        LEFT JOIN mesas ON mesas.id_mesa = reservaciones.id_mesa
                        LEFT JOIN estados_pago ON estados_pago.id_payStatus = qr.id_payStatus
                        WHERE qr.id_qr = ? ;`
        try {
            const result = [];
            for (const QR of QRs) {
                try {
                    const [rows] = await sqlPool.execute(query, [QR]);
                    result.push(rows[0]);
                } catch (error) {
                    console.error(`Error con QR ${QR}:`, error);
                    result.push(null);
                }
            }
            console.log('QR´s de Chanchitos encontrados :)')
            res.status(200).json({ mensaje: 'QRs encontrados', result })
        } catch (error) {
            console.error('Error al listar QR de chanchitos: ', error)
            res.status(500).json({ error: 'Error al consultar QR' });
        }
    },

    create: async (req, res) => {
        const datas = req.body
        let result = [];
        let qrIDs = [];

        const queryUser = `SELECT id_qr, id_user, id_reservation FROM qr WHERE id_user = ? AND id_reservation = ?;`
        const queryQr = `INSERT INTO qr 
                        SET id_user = ?, id_reservation = ?, id_payMethod = ?, id_payStatus = ?;`

        for (const asistente of datas) {
            let respuesta = {
                mensaje: '',
                resultado: [],
            };

            try {
                const [resultUser] = await sqlPool.query(queryUser, [asistente.id_user, asistente.id_reservation]);
                if (resultUser.length >= 1) {
                    console.log('No se agregó el ID : ', resultUser[0].id_user, 'Porque ya existe vinculado a este evento: ', resultUser[0].id_reservation);
                    respuesta.mensaje = `${respuesta.mensaje}\n Problema al agregar usuario ${resultUser[0].id_user} porque ya existe vinculado al evento: ${resultUser[0].id_reservation}`
                } else {
                    const [resultQr] = await sqlPool.query(queryQr, [asistente.id_user, asistente.id_reservation, asistente.id_payMethod, asistente.id_payStatus]);
                    console.log('ID del qr creado: ', resultQr.insertId);
                    console.log('Usuario y reservación vinculados correctamente :)');
                    respuesta = {
                        mensaje: `${respuesta.mensaje}\n Usuario ${asistente.id_user} y reservación ${asistente.id_reservation} vinculados correctamente`,
                        resultado: respuesta.resultado.push(resultQr),
                    }
                    qrIDs.push(resultQr.insertId)
                    result.push(respuesta)
                }
            } catch (error) {
                console.error('Error al vincular chanchitos a reservación :(', error)
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        }
        console.log('Chanchitos vinculados a reservación :) ')
        res.status(201).json({ mensaje: 'Asistentes y reservación vinculados', result: result, qrIDs: qrIDs })

    },

    update: async (req, res) => {
        const { statusPago, asistencia, qr } = req.body;

        // Validar que statusPago, asistencia, qr vengan en el body
        if (!statusPago || !asistencia || !qr) {
            return res.status(400).json({
                mensaje: 'El campo status pago, asistencia y qr son requeridos'
            });
        }

        const query = `UPDATE qr SET id_payStatus = ?, userAttend = ? 
                        WHERE qr_reservation = ?;`;

        try {
            const result = await sqlPool.query(query, [statusPago, asistencia, qr]);
            console.log('Consulta ejecutada. Resultados:', result);

            // Siempre devolver 200 con el array de resultados (puede estar vacío)
            res.status(200).json({
                mensaje: 'Se confirmó asistencia al evento',
                result: result
            });

        } catch (error) {
            console.error(`Error con  ${qr}:`, error);
            res.status(500).json({
                error: 'Error al procesar la consulta a la BD',
                mensaje: error.message
            });
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
            res.status(201).json({ mensaje: 'Eliminado de BD', result });
        } catch (error) {
            console.error('Error al eliminar chanchito: ', error)
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

export { Qr }

