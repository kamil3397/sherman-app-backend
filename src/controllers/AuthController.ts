/* eslint-disable indent */
import { Request, Response } from 'express';
import { Collection } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

interface UserType {
    _id?: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
}

export class AuthController {
    constructor(private usersCollection: Collection<UserType>) { }

    async register(req: Request, res: Response) {
        try {
            const { name, lastName, email, password } = req.body;
            console.log('Received registration data:', { name, lastName, email });

            if (!name || !lastName || !email || !password) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const userExists = await this.usersCollection.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser: UserType = {
                _id: uuidv4(),
                name,
                lastName,
                email,
                password: hashedPassword
            };
            console.log('Creating new user:', newUser);

            await this.usersCollection.insertOne(newUser);
            return res.status(201).json({ message: 'New User added successfully', newUser });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}