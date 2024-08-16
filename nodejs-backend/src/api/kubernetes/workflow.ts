import { Request, Response } from 'express';
import { Workflow } from '../../compilers/workflow.js';
import { DefaultDistributedScheduler } from '../../schedulers/distributed.js';
import { DefaultLogger } from '../../loggers/default.js';
import { EXEC_HISTORY, WORKFLOWS_DIR } from '../../constants.js';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

export const triggerWorkflow = async (req: Request, res: Response) => {
    req.accepted; 

    const fileName = req.params.name;
    const filePath = path.resolve(WORKFLOWS_DIR, fileName);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        } else {
            const yamlContent = yaml.load(data);
            const jsonContent = JSON.parse(JSON.stringify(yamlContent, null, 2));

            const workflow = new Workflow();
            workflow.readWorkflowFromObject(jsonContent);
            workflow.parseWorkflow();
            workflow.createGraph();
            workflow.workflowScheduler = new DefaultDistributedScheduler(workflow.workflowGraph);
            workflow.workflowScheduler.attachLogger(new DefaultLogger(workflow.workflowName));

            EXEC_HISTORY.set(workflow.workflowName, workflow);

            workflow.workflowScheduler.triggerWorkload();

            console.log(EXEC_HISTORY.size)
            
            return res.status(200).json(EXEC_HISTORY.get(workflow.workflowName));
        }
    });
}

export const getExecutions = async (req: Request, res: Response) => {
    req.accepted;

    const executions = Array.from(EXEC_HISTORY, ([label, data]) => ({ label, data }));

    executions.forEach((exec) => {
        exec.data.exec.tasksPending = [];
        exec.data.exec.tasksRunning = [];
        exec.data.exec.tasksCompleted = [];

        exec.data.workflowGraph.nodes().forEach((node) => {
            if (exec.data.workflowGraph.getNodeAttribute(node, 'jobStatus') === 'pending')
                exec.data.exec.tasksPending.push(node);
            else if (exec.data.workflowGraph.getNodeAttribute(node, 'jobStatus') === 'running')
                exec.data.exec.tasksRunning.push(node);
            else if (exec.data.workflowGraph.getNodeAttribute(node, 'jobStatus') === 'completed')
                exec.data.exec.tasksCompleted.push(node);
        })

        if (exec.data.exec.tasksRunning.length === 0 && exec.data.exec.tasksCompleted.length === 0)
            exec.data.exec.state = 'pending'
        else if (exec.data.exec.tasksRunning.length > 0)
            exec.data.exec.state = 'running'
        else if (exec.data.exec.tasksRunning.length === 0 && exec.data.exec.tasksPending.length === 0 && exec.data.exec.tasksCompleted.length > 0)
            exec.data.exec.state = 'completed'
    });

    
    let executionsResponse = []; 
    
    executions.forEach(exec => {
        let executionLog = [];
    
        exec.data.workflowScheduler.logger.log.forEach((val, key) => {
            executionLog.push({
                name: key,
                start: val.find(x => x.event === 'ADDED')?.timestamp,
                end: val.find(x => x.event === 'COMPLETED')?.timestamp,
            })
        })

        executionsResponse.push({
            ...exec.data.exec,
            id: exec.data.workflowName,
            name: exec.data.workflowName,
            logs: executionLog,
            graph: exec.data.workflowGraph,
            logv2: exec.data.workflowScheduler.logger.logv2
        })
    })

    res.json(executionsResponse);
}