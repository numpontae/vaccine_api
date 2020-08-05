import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Secret } from '../config/config'

const generateToken = (
  data: object,
  secret: string,
  expiresIn = '60s'
): string => {
  return jwt.sign(data, secret, { expiresIn })
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const bearer_header = req.headers['authorization'] || ''
  const auth = bearer_header.split('Bearer ')[1]

  if (typeof bearer_header !== 'undefined' && typeof auth !== 'undefined') {
    jwt.verify(auth, Secret.SECRET, (err: any, data: any) => {
      if (err) {
        res.status(403).json({ status: err.name, message: err.message })
      } else {
        ;(<any>req)['token'] = auth
        ;(<any>req)['decoded'] = data
        next()
      }
    })
  } else {
    res.sendStatus(403)
  }
}

export = {
  generateToken,
  verifyToken,
}
