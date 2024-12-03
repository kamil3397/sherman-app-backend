import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (token == null) return res.sendStatus(403);

  jwt.verify(token, process.env.JWT_SECRET as string, (err) => {

    if (err) return res.sendStatus(403);

    next();
  });
};
