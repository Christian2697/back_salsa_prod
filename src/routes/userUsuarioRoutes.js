import { validation } from '../Middlewares/joiValidation.js';
import { schemas } from '../Middlewares/joiSchemas.js';
import { User } from '../MySQL/user_sql.js';
import {Reserv} from '../MySQL/reserv_sql.js'
import { Qr } from '../MySQL/qr_sql.js'
import express from 'express';

const router = express.Router()


router.post('/user', validation(schemas.usuarios), User.createUser);
router.post('/usersID', User.listById);

router.post('/reservation', validation(schemas.reser), Reserv.create);

router.post('/qr', Qr.create);
router.post('/qrsID', Qr.listById);

export default router;