import { Router } from 'express';

import UserController from './app/controllers/UserControllers';
import StudentController from './app/controllers/StudentControllers';
import SessionController from './app/controllers/SessionControllers';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

routes.use(authMiddleware);

//  Routes User
routes.put('/users/:id', UserController.update);

//  Routes students
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

export default routes;
