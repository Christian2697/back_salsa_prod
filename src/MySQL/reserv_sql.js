import {sqlPool} from './connectionSQL.js'

const Reserv = {

    list: async (req, res) => {
        const query = 'SELECT * FROM asistentes '
        try {
            const [result] = await sqlPool.execute(query);
            console.log('Consultando Chanchitos :)');
            res.status(200).send(result);
        } catch (error){
            console.error('Error al solicitar chanchitos: ', error)
            res.status(500).send(error).json({ error: 'Error al solicitar usuarios' });
        }
    },

    listById: async (req, res) => {
        const id = req.params
        sqlPool.query(`SELECT * FROM asistentes WHERE id_user = ${id.id_user}`, (err, rows) => {
            if (err) throw err;
            const results = Object.values(rows);
            console.log('Consultando Chanchito indicado :)');
            res.send(results);
        })
        res.status(200)
    },

    create: async (req, res) => {
        const {nameReservation, id_event, id_typeReservation} = req.body
        const queryRes = `INSERT INTO reservaciones 
                        SET nameReservation = ?, id_event = ?, id_typeReservation = ?`
        const queryUser = `SELECT * FROM reservaciones WHERE nameReservation = ? AND id_event = ?`
        try {
            const [resultUser] = await sqlPool.query(queryUser,[nameReservation, id_event]);
            if (resultUser.length >= 1){
                console.log('Se negó la creación de la reservación porque ya existe una a ese nombre: ', resultUser[0].nameReservation);
                res.status(409).json({ error: `Ya existe una reservación a nombre de: ${nameReservation}` })
            } else {
                const [result] = await sqlPool.query(queryRes,[nameReservation, id_event, id_typeReservation])
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
        const {name, lastname, email} = req.body
        const id = req.params.id_user
        const query = `UPDATE asistentes 
                        SET name = ?, lastname = ?, email = ?
                        WHERE id_user = ?`
        try {
            const [result] = await sqlPool.execute(query, [name, lastname, email, id]);
            console.log('Filas afectadas: ', result.affectedRows);
            console.log('Chanchito actualizado');
            res.status(201).json({ mensaje: 'Actualizado en BD', result });
        } catch (error){
            console.error('Error al actualizar chanchito: ', error)
            res.status(500).json({ error: 'Error al actualizar usuario' });
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
        } catch (error){
            console.error('Error al eliminar chanchito: ', error)
            res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    }
}

export {Reserv}

