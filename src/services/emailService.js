import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: './src/env/.env' });

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Función para generar el HTML del email (versión mejorada)
const generateEmailHTML = (reservationData) => {
    const eventDate = reservationData.event_date ? new Date(reservationData.event_date).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'Próximamente';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Reservación - Tumbao</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=Quicksand:wght@400;500&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Quicksand', sans-serif;
                background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
                color: #ffffff;
                margin: 0;
                padding: 20px;
                min-height: 100vh;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: rgba(32, 31, 31, 0.95);
                border-radius: 16px;
                padding: 40px 30px;
                box-shadow: 0 12px 40px rgba(0,0,0,0.4);
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #19d2c3;
            }
            
            .header h1 {
                font-family: 'Oswald', sans-serif;
                font-size: 2.5rem;
                color: #19d2c3;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .header .subtitle {
                color: rgba(255,255,255,0.8);
                font-size: 1.1rem;
            }
            
            .event-info {
                background: rgba(25, 210, 195, 0.1);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 30px;
                text-align: center;
                border: 1px solid rgba(25, 210, 195, 0.3);
            }
            
            .event-info h2 {
                font-family: 'Oswald', sans-serif;
                color: #19d2c3;
                font-size: 1.4rem;
                margin-bottom: 10px;
            }
            
            .event-date {
                font-size: 1.1rem;
                color: rgba(255,255,255,0.9);
                font-weight: 500;
            }
            
            /* ✅ ELIMINADO: Sección de método de pago */
            
            .grid-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 25px;
                margin-bottom: 35px;
            }
            
            .grid-item {
                text-align: left;
                padding: 15px;
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
                border-left: 3px solid #19d2c3;
            }
            
            .grid-item h4 {
                font-family: 'Oswald', sans-serif;
                color: #19d2c3;
                margin-bottom: 8px;
                font-size: 0.9rem;
                text-transform: uppercase;
            }
            
            .grid-item p {
                font-family: 'Quicksand', sans-serif;
                font-size: 1rem;
                margin: 0;
                font-weight: 500;
            }
            
            .qr-section {
                text-align: center;
                border-top: 2px solid rgba(255,255,255,0.1);
                padding-top: 30px;
                margin-top: 30px;
            }
            
            .qr-section h3 {
                font-family: 'Oswald', sans-serif;
                color: #19d2c3;
                margin-bottom: 20px;
                font-size: 1.3rem;
                text-transform: uppercase;
            }
            
            .qr-code {
                background: white;
                padding: 15px;
                border-radius: 12px;
                display: inline-block;
                margin-bottom: 20px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }
            
            .qr-hash {
                font-family: 'Quicksand', sans-serif;
                font-size: 0.75rem;
                color: rgba(255,255,255,0.7);
                word-break: break-all;
                margin-top: 15px;
                background: rgba(0,0,0,0.3);
                padding: 10px;
                border-radius: 6px;
                font-family: monospace;
            }
            
            .instructions {
                background: rgba(255,255,255,0.05);
                padding: 20px;
                border-radius: 10px;
                margin-top: 25px;
                border-left: 4px solid #19d2c3;
            }
            
            .instructions h4 {
                font-family: 'Oswald', sans-serif;
                color: #19d2c3;
                margin-bottom: 10px;
                font-size: 1rem;
            }
            
            .instructions ul {
                text-align: left;
                padding-left: 20px;
            }
            
            .instructions li {
                margin-bottom: 8px;
                font-size: 0.9rem;
                color: rgba(255,255,255,0.9);
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
                color: rgba(255,255,255,0.6);
                font-size: 0.8rem;
            }
            
            @media (max-width: 600px) {
                .container {
                    padding: 25px 20px;
                    margin: 10px;
                }
                
                .grid-container {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                
                .header h1 {
                    font-size: 2rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Reservación Confirmada</h1>
                <p class="subtitle">Tu lugar está asegurado para una experiencia única</p>
            </div>
            
            <div class="event-info">
                <h2>${reservationData.event_name}</h2>
                <p class="event-date">${eventDate}</p>
            </div>
            
            <!-- ✅ ELIMINADO: Sección de método de pago -->
            
            <div class="grid-container">
                <div class="grid-item">
                    <h4>ID de la reservación:</h4>
                    <p>#${reservationData.id_reservation}</p>
                </div>
                <div class="grid-item">
                    <h4>Evento:</h4>
                    <p>${reservationData.event_name}</p>
                </div>
                <div class="grid-item">
                    <h4>Nombre del asistente:</h4>
                    <p>${reservationData.name} ${reservationData.lastname}</p>
                </div>
                <div class="grid-item">
                    <h4>Mesa asignada:</h4>
                    <p>Mesa ${reservationData.numMesa}</p>
                </div>
            </div>
            
            <div class="qr-section">
                <h3>Tu Código QR de Acceso</h3>
                <div class="qr-code">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(reservationData.qr_reservation)}&format=png&margin=10" 
                         alt="Código QR de acceso" width="180" height="180">
                </div>
                <p style="margin-bottom: 15px; color: rgba(255,255,255,0.9);">Presenta este código QR al ingresar al evento</p>
                <div class="qr-hash">${reservationData.qr_reservation}</div>
            </div>
            
            <div class="instructions">
                <h4>📋 Instrucciones importantes:</h4>
                <ul>
                    <li>Guarda este email, es tu comprobante de reservación</li>
                    <li>Presenta el código QR al ingresar al evento</li>
                    <li>Llega 15 minutos antes del inicio del evento</li>
                    <li>Tu mesa ${reservationData.numMesa} estará reservada para ti</li>
                    <li>Para cualquier duda, responde a este email</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} Tumbao Events. Todos los derechos reservados.</p>
                <p>Este es un email automático, por favor no respondas directamente.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// También actualiza el texto plano (sin método de pago)
const sendReservationEmail = async (userEmail, reservationData) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Tumbao Events <onboarding@resend.dev>',
            to: userEmail,
            subject: `✅ Confirmación de Reservación - ${reservationData.event_name}`,
            html: generateEmailHTML(reservationData),
            text: `
Confirmación de Reservación - ${reservationData.event_name}

Hola ${reservationData.name},

Tu reservación ha sido confirmada exitosamente.

📋 Detalles de tu reservación:
- ID de reservación: #${reservationData.id_reservation}
- Evento: ${reservationData.event_name}
- Nombre: ${reservationData.name} ${reservationData.lastname}
- Mesa asignada: ${reservationData.numMesa}

🔐 Tu código QR de acceso: ${reservationData.qr_reservation}

Presenta este código QR al ingresar al evento. Tu mesa ${reservationData.numMesa} estará reservada para ti.

¡Te esperamos para una experiencia única!

Saludos,
El equipo de Tumbao Events
            `
        });

        if (error) {
            console.error('❌ Error enviando email con Resend:', error);
            throw new Error(`Error Resend: ${error.message}`);
        }

        console.log(`✅ Email enviado a: ${userEmail} - ID: ${data.id}`);
        return {
            success: true,
            emailId: data.id,
            recipient: userEmail
        };

    } catch (error) {
        console.error('❌ Error en sendReservationEmail:', error);
        return {
            success: false,
            error: error.message,
            recipient: userEmail
        };
    }
}

// Función para enviar emails a todos los asistentes de una reservación
 const sendBulkReservationEmails = async (reservations) => {
    try {
        console.log('🔍 En sendBulkReservationEmails, reservations:', reservations); // ✅ Debug
        
        // ✅ Validación más robusta
        if (!reservations) {
            throw new Error('reservations es null o undefined');
        }
        
        if (!Array.isArray(reservations)) {
            throw new Error(`reservations no es un array, es: ${typeof reservations}`);
        }

        console.log(`📧 Iniciando envío de ${reservations.length} emails...`);

        const emailPromises = reservations.map((reservation, index) => 
            new Promise((resolve) => {
                setTimeout(async () => {
                    try {
                        console.log(`📨 Procesando email ${index + 1} para: ${reservation.email}`); // ✅ Debug
                        const result = await sendReservationEmail(reservation.email, reservation);
                        resolve(result);
                    } catch (error) {
                        console.error(`❌ Error enviando email a ${reservation.email}:`, error);
                        resolve({
                            success: false,
                            error: error.message,
                            recipient: reservation.email
                        });
                    }
                }, index * 500);
            })
        );

        const results = await Promise.allSettled(emailPromises);

        const successful = results.filter(result => 
            result.status === 'fulfilled' && result.value.success
        ).length;

        const failed = results.filter(result => 
            result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
        ).length;

        console.log(`📊 Resultados del envío: ${successful} exitosos, ${failed} fallidos`);

        return {
            total: reservations.length,
            successful,
            failed,
            details: results.map(result => 
                result.status === 'fulfilled' ? result.value : { success: false, error: 'Promise rejected' }
            )
        };

    } catch (error) {
        console.error('❌ Error en sendBulkReservationEmails:', error);
        throw error;
    }
}

export {
    sendReservationEmail,
    sendBulkReservationEmails,
    generateEmailHTML
};