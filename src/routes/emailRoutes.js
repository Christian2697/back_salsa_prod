import express from 'express';
import emailController from '../Middlewares/emailController.js';

const router = express.Router()

// Ruta para enviar emails después de crear una reservación
router.post('/reservation-emails', emailController.sendReservationEmails);

// Ruta para reenviar email a un asistente específico
router.post('/resend-email', emailController.resendReservationEmail);

// Ruta para verificar el estado del servicio
router.get('/health', emailController.checkEmailService);

export default router;