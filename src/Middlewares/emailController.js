import { 
    sendReservationEmail, 
    sendBulkReservationEmails, 
    generateEmailHTML 
} from '../services/emailService.js';
import {sqlPool} from '../MySQL/connectionSQL.js';

const EmailController = {
    
    sendReservationEmails: async (req, res) => {
        const reservations = req.body;

        try { 
            console.log('📨 Reservaciones recibidas:', reservations);
            
            if (!Array.isArray(reservations)) {
                return res.status(400).json({
                    success: false,
                    message: 'El cuerpo de la petición debe ser un array'
                });
            }

            if (reservations.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontraron reservaciones para enviar emails'
                });
            }

            console.log(`📨 Encontradas ${reservations.length} reservaciones para enviar emails`);

            // ✅ CORRECCIÓN: Sin payMethod, solo nameReservation
            const enhancedReservations = reservations.map(reservation => ({
                ...reservation,
                nameReservation: reservation.nameReservation || `${reservation.name} ${reservation.lastname}`,
                event_date: reservation.event_date || new Date().toISOString()
            }));

            console.log('📧 Reservaciones mejoradas:', enhancedReservations);

            const emailResults = await sendBulkReservationEmails(enhancedReservations);

            res.json({
                success: true,
                message: `Proceso de envío de emails completado`,
                results: emailResults
            });

        } catch (error) {
            console.error('❌ Error en sendReservationEmails:', error);
            res.status(500).json({
                success: false,
                message: 'Error enviando emails de confirmación',
                error: error.message
            });
        }
    },

    // Reenviar email a un asistente específico
    resendReservationEmail: async (req, res) => {
        const reservationId  = req.body;

        try {
            // Consultar datos de una reservación específica
            const query = `SELECT reservaciones.id_reservation, qr.qr_reservation, asistentes.name, asistentes.lastname, eventos.event_name, mesas.numMesa, estados_pago.payStatus
                        FROM qr
                        LEFT JOIN reservaciones ON reservaciones.id_reservation = qr.id_reservation
                        LEFT JOIN asistentes ON qr.id_user = asistentes.id_user
                        LEFT JOIN eventos ON eventos.id_event = reservaciones.id_event
                        LEFT JOIN mesas ON mesas.id_mesa = reservaciones.id_mesa
                        LEFT JOIN estados_pago ON estados_pago.id_payStatus = qr.id_payStatus
                        WHERE qr.id_qr = ? `
            
            const [reservations] = await sqlPool.query(query, [reservationId]);
            
            if (reservations.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Reservación no encontrada'
                });
            }

            const reservation = reservations[0];
            const result = await sendReservationEmail(reservation.email, reservation);

            if (result.success) {
                res.json({
                    success: true,
                    message: `Email reenviado exitosamente a ${reservation.email}`,
                    emailId: result.emailId
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error reenviando el email',
                    error: result.error
                });
            }

        } catch (error) {
            console.error('❌ Error en resendReservationEmail:', error);
            res.status(500).json({
                success: false,
                message: 'Error reenviando email',
                error: error.message
            });
        }
    },

    // Verificar el estado del servicio de email
    checkEmailService: async (req, res) => {
        try {
            // Puedes implementar una verificación más específica si Resend ofrece un endpoint de health check
            res.json({
                success: true,
                service: 'Resend',
                status: 'Operational',
                plan: 'Free Tier - 3,000 emails/mes'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                service: 'Resend',
                status: 'Error',
                error: error.message
            });
        }
    }
}

export default  EmailController;