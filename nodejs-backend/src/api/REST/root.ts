import { Request, Response } from 'express'

export const root = (req: Request, res: Response) => {
    res.send('PATH: / [UA]: ' + req.headers['user-agent']);
}