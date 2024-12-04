/* eslint-disable indent */
import { Request, Response } from 'express';
import { Collection } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

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
    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        try {
            const user = await this.usersCollection.findOne({ email });
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).send({ message: 'Invalid email or password' });
            }

            const jwtToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET!,
                { expiresIn: '1h' }
            );
            return res.status(200).json({
                accessToken: jwtToken,
                userId: user._id,
                user: {
                    _id: user._id,
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                }
            });
        } catch (err) {
            return res.status(500).send({ message: 'Internal Server Error' });
        }
    }

    async logout(req: Request, res: Response) {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({ message: 'Unauthorized: No token provided' });
        }
        return this.usersCollection.deleteOne({ token })
            .then(() => {
                return res.status(200).send({ message: 'Logout successful' });
            })
            .catch((error) => {
                console.error('Error during logout:', error);
                return res.status(500).send({ message: 'Internal Server Error' });
            });
    }
}
