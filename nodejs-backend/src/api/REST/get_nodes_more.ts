import { Request, Response } from 'express'
import { listNodesMore } from '../kubernetes/kube.js';

export const getNodesMore = async (req: Request, res: Response) => {
    req.accepted;
    const nodeList = await listNodesMore();
    res.send(nodeList);
}