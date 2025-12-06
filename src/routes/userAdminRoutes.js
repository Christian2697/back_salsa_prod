import { validation } from '../Middlewares/joiValidation.js';
import { schemas } from '../Middlewares/joiSchemas.js';
import { isAuthenticated } from '../Middlewares/authController.js';
import { User } from '../MySQL/user_sql.js';
import {Reserv} from '../MySQL/reserv_sql.js'
import { Qr } from '../MySQL/qr_sql.js'
import express from 'express';

const router = express.Router()

router.post('/get-users', isAuthenticated, User.list);
router.post('/search-users', isAuthenticated, User.search);
router.post('/user', validation(schemas.usuarios), isAuthenticated, User.createAdmin);
router.post('/usersID', isAuthenticated, User.listById);
router.put('/user/:id_user', validation(schemas.usuarios), isAuthenticated, User.update);
router.delete('/user/:id_user', isAuthenticated, User.destroy);

router.post('/recep/search-qr', Qr.search);
router.patch('/recep/update-qr', Qr.update);

router.post('/reserv/list-qr', Qr.list);
router.post('/reserv/search-qr', Qr.searchList);

router.post('/get-reserv', Reserv.list);
router.delete('/reservation/:id_reservation', Reserv.destroy);


export default router;