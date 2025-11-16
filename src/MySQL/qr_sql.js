import { sqlPool } from './connectionSQL.js'

const Qr = {

    listByQr: async (req, res) => {
        const { qrHash } = req.body;

        // Validar que qrHash venga en el body
        if (!qrHash) {
            return res.status(400).json({
                mensaje: 'El campo qrHash es requerido'
            });
        }
        console.log(qrHash);
        console.log(typeof qrHash);

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
            console.log(result)
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


    listById: async (req, res) => {
        const QRs = req.body
        console.log(QRs)
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
                    console.log(QR)
                    const [rows] = await sqlPool.execute(query, [QR]);
                    result.push(rows[0]);
                } catch (error) {
                    console.error(`Error con QR ${QR}:`, error);
                    result.push(null);
                }
            }
            console.log(result)
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
                console.error('Error al insertar consulta: ', error)
                res.status(500).json({ error: 'Error al crear reservación' });
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
                mensaje: 'Error al procesar la consulta a la BD',
                error: error.message
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
            res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    }
}

export { Qr }

