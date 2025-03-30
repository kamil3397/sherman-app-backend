import { Collection } from 'mongodb';
import { Response } from 'express';

type UserType = {
    _id: string;
    name: string;
    lastName: string;
    email: string;
}

export class UserController {
  constructor(private usersCollection: Collection<UserType>) {}

  async getAll(res: Response) {
    try {
      const users = await this.usersCollection.find().toArray();
      const usersData = users.map((user) => ({ id: user._id, email: user.email, fullName: `${user.name} ${user.lastName}` }));
      return res.status(200).send(usersData);
    } catch (error) {
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  }

}
