import { mkdirSync } from "fs";
import { EXEC_HISTORY, METRICS_PATH } from "../constants.js";
import fs from 'fs';
import path from "path";
import { exec } from "child_process";

type EventType = 'ADDED' | 'RUNNING' | 'COMPLETED' | 'FAILED'

type LogEventType = {
    event: EventType,
    timestamp: number
}

export class DefaultLogger {
    log: Map<String, Array<LogEventType>>
    exportMetrics: boolean;
    metricsExportPath: String;
    workflowName: String;
    logv2: Object;

    constructor(workflowName: String) {
        this.log = new Map<String, Array<LogEventType>>();
        this.exportMetrics = true;
        this.workflowName = workflowName;
        this.logv2 = {};

        this.prepareMetricsAssets(workflowName);
    }

    logEvent(job: string, type: EventType, date: number = Math.floor(new Date().getTime() / 1000)) {
        if (this.log.get(job) == undefined) {
            this.log.set(job, new Array<LogEventType>());
        }

        this.log.get(job).push({
            event: type,
            timestamp: date
        });

        this.logv2[job] = {
            ...this.logv2[job],
            [type]: date
        }
    }

    prepareMetricsAssets(workflowName: String) {
        this.metricsExportPath = METRICS_PATH + workflowName;
        mkdirSync(this.metricsExportPath.toString(), { recursive: true });
    }

    createMetricsCSV(job: String, parentWorkflow: String) {
        this.prepareMetricsAssets(parentWorkflow);
        let src = `/mnt/nfs/${parentWorkflow}/metrics/${job.replace(parentWorkflow + '-', '')}.metrics.txt`;
        let dest = path.resolve(`assets/outputs/metrics/${parentWorkflow}/${job.replace(parentWorkflow + '-', '')}.metrics.txt`);
        fs.copyFile(src, dest, (err) => {
            if (err) {
              console.error('Error copying the file:', err);
            } else {
              console.log('File copied successfully to', dest);

                exec(`python3 src/metrics/csrv.py assets/outputs/metrics/${parentWorkflow}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing Python script: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`Python script stderr: ${stderr}`);
                        return;
                    }
                    console.log(`Python script output: ${stdout}`);

                    exec(`python3 src/metrics/plotter.py assets/outputs/metrics/${parentWorkflow} 96`, (error, stdout, stderr) => {
                        if (error) {
                        console.error(`Error executing Python script: ${error.message}`);
                        return;
                        }
                        if (stderr) {
                            console.error(`Python script stderr: ${stderr}`);
                            return;
                        }
                        console.log(`Python script output: ${stdout}`);

                        const jsonString = JSON.stringify(EXEC_HISTORY.get(this.workflowName), null, 2);

                        fs.writeFile(path.resolve(`assets/outputs/metrics/${parentWorkflow}/workflowObject.txt`), jsonString, 'utf8', (err) => {
                            if (err) {
                                console.error('Error writing file', err);
                            } else {
                                console.log('File has been written successfully');
                            }
                        });
                    });
                });
            }
        }); 
    }
}