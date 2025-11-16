import { validation } from '../Middlewares/joiValidation.js';
import { schemas } from '../Middlewares/joiSchemas.js';
import { User } from '../MySQL/user_sql.js';
import express from 'express';
import { Auth, isAuthenticated } from '../Middlewares/authController.js';

const router = express.Router()

router.post('/get-users', User.list);
router.post('/search-users', User.search);
router.post('/user', validation(schemas.usuarios), User.createAdmin);
router.post('/usersID', User.listById);
router.put('/user/:id_user', validation(schemas.usuarios), User.update);
router.delete('/user/:id_user', User.destroy);

router.post('/login', validation(schemas.login), Auth.login);
router.post('/register', validation(schemas.register), Auth.register);
router.post('/logout', Auth.logout);
router.get('/protected', (req, res) => {})
router.get('/verify', isAuthenticated, Auth.verify);


export default router;