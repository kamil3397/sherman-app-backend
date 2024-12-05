import { NextFunction, Request, Response } from 'express';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().min(2).max(50).required(),
  lastName: yup.string().min(2).max(50).required(),
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
});

export const validateRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.validate(req.body);
    return next();
  } catch (error) {
    res.status(400).json({ message: 'Wrong data provided', error });
  }
};
