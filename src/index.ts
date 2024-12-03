/* eslint-disable no-console */
/* eslint-disable no-return-await */
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { AuthController } from './controllers/AuthController';
import { verifyToken } from './middleware/verifyToken';

const run = async () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  console.log('[Mongo] Connecting to MongoDB...');
  const mongoClient = await new MongoClient(process.env.MONGO_URL!).connect();
  console.log('[Mongo] Connected');

  const database = mongoClient.db();

  const authController = new AuthController(database.collection('users'));

  app.post('/register', async (req, res) => authController.register(req, res));

  app.post('/login', async (req, res) => authController.login(req, res));

  app.listen(process.env.PORT, () => { console.log('info', `Server running on port ${process.env.PORT}`); });

};

run();
