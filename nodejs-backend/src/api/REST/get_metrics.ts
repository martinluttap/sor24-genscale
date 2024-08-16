import { Request, Response } from 'express'
import path from 'path';
import fs from 'fs';

export const getAllMetricsDirectories = (req: Request, res: Response) => {
    req.accepted;
    const metricsDir = path.join('assets/outputs/metrics');

    fs.readdir(metricsDir, { withFileTypes: true }, (err, files): any => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).send('Server error');
        }

        let folders: any = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

        folders = folders.map((folder: any) => ({
            id: folder,
            name: folder
        }))

        res.json(folders);
    });
};

export const getMetricsByName = (req: Request, res: Response) => {
    req.accepted;
    const fileName = req.params.name;
    const filePath = path.resolve(path.join('assets/outputs/metrics', fileName, 'metrics_report.pdf'));

    fs.access(filePath, fs.constants.F_OK, (err): any => {
        if (err) {
            console.error('File does not exist:', err);
            return res.status(404).send('File not found');
        }
        res.sendFile(filePath);
    });
};

export const getWorkflowObjectByName = (req: Request, res: Response) => {
    req.accepted;
    const fileName = req.params.name;
    const filePath = path.resolve(path.join('assets/outputs/metrics', fileName, 'workflowObject.txt'));

    fs.access(filePath, fs.constants.F_OK, (err): any => {
        if (err) {
            console.error('File does not exist:', err);
            return res.status(404).send('File not found');
        }
        res.sendFile(filePath);
    });
};