/* eslint-disable no-console */
/* eslint-disable no-return-await */
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { AuthController } from './controllers/AuthController';
import { verifyToken } from './middleware/verifyToken';
import { validateRegister } from './validators/registerSchema';

 interface UserType {
    _id?: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
  }

const run = async () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  console.log('[Mongo] Connecting to MongoDB...');
  const mongoClient = await new MongoClient(process.env.MONGO_URL!).connect();
  console.log('[Mongo] Connected');

  const database = mongoClient.db();

  const usersCollection = database.collection<UserType>('users');

  const authController = new AuthController(usersCollection);

  app.post('/register',  validateRegister, async (req, res) => authController.register(req, res));

  app.post('/login', async (req, res) => authController.login(req, res));

  app.post('/logout', verifyToken, async (req, res) => { authController.logout(req, res); });

  app.listen(process.env.PORT, () => { console.log('info', `Server running on port ${process.env.PORT}`); });

};

run();
