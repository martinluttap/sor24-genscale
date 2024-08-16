import { Request, Response } from 'express'
import fs from 'fs';
import path from 'path';
import { WORKFLOWS_DIR } from '../../constants.js';

export const getAllWorkflows = async (req: Request, res: Response) => {
    req.accepted;
    
    fs.readdir(WORKFLOWS_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory', err });
        }
        
        let fileDataParsed = [];

        files.forEach(file => {
            fileDataParsed.push({
                id: file,
                name: file,
            });
        })

        return res.json(fileDataParsed);
    });    
}

export const getWorkflowByName = async (req: Request, res: Response) => {
    req.accepted;
    
    const fileName = req.params.name;
    const filePath = path.resolve(WORKFLOWS_DIR, fileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        return res.sendFile(filePath);
    });
}
