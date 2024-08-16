import { Request, Response } from 'express'
import { listNodes } from '../kubernetes/kube.js';

export const getNodes = async (req: Request, res: Response) => {
    req.accepted;
    const nodeList = await listNodes();
    res.send(nodeList);
}