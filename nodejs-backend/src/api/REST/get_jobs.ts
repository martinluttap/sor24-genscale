import { Request, Response } from 'express'
import { listJobs } from '../kubernetes/kube.js';

export const getJobs = async (req: Request, res: Response) => {
    req.accepted;
    const jobList = await listJobs();
    res.send(jobList);
}