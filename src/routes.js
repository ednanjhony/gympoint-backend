import { Router } from 'express';

import UserController from './app/controllers/UserControllers';
import StudentController from './app/controllers/StudentControllers';
import SessionController from './app/controllers/SessionControllers';
import PlansController from './app/controllers/PlansController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinsController from './app/controllers/CheckinsController';
import HelpOrdersController from './app/controllers/HelpOrdersController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

// Routes Checkin
routes.post('/students/:id/checkins', CheckinsController.store);

// Routes HelpOrders
routes.post('/students/:id/help-orders', HelpOrdersController.store);

routes.use(authMiddleware);

//  Routes User
routes.put('/users/:id', UserController.update);

//  Routes students
routes.post('/students', StudentController.store);
routes.get('/students', StudentController.index);
routes.put('/students/:id', StudentController.update);
routes.delete('/students/:id', StudentController.delete);

routes.get('/students/:id/checkins', CheckinsController.index);
routes.get('/students/:id/help-orders', HelpOrdersController.index);

// Routes Answers
routes.get('/help-orders', HelpOrdersController.index);
routes.put('/help-orders/:id/answer', HelpOrdersController.update);
// Routes Plans
routes.post('/plans', PlansController.store);
routes.get('/plans', PlansController.index);
routes.put('/plans/:id', PlansController.update);
routes.delete('/plans/:id', PlansController.delete);

// Routes Enrollment
routes.post('/enrollments', EnrollmentController.store);
routes.get('/enrollments', EnrollmentController.index);
routes.put('/enrollments/:id', EnrollmentController.update);
routes.delete('/enrollments/:id', EnrollmentController.delete);

export default routes;
