import { validation } from '../Middlewares/joiValidation.js';
import { schemas } from '../Middlewares/joiSchemas.js';
import { User } from '../MySQL/user_sql.js';
import {Reserv} from '../MySQL/reserv_sql.js'
import { Qr } from '../MySQL/qr_sql.js'
import express from 'express';

const router = express.Router()

router.post('/get-users', User.list);
router.post('/search-users', User.search);
router.post('/user', validation(schemas.usuarios), User.createAdmin);
router.post('/usersID', User.listById);
router.put('/user/:id_user', validation(schemas.usuarios), User.update);
router.delete('/user/:id_user', User.destroy);

router.post('/recep-qr', Qr.listByQr);
router.patch('/update-recep', Qr.update);


export default router;