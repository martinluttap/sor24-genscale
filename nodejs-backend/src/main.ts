import express from 'express'
import { root } from './api/REST/root.js';
import { getNodes } from './api/REST/get_nodes.js';
import { getNodesMore } from './api/REST/get_nodes_more.js';
import { getJobs } from './api/REST/get_jobs.js';
import { getExecutions, triggerWorkflow } from './api/kubernetes/workflow.js';
import { getAllWorkflows, getWorkflowByName } from './api/REST/get_workflow.js';
import cors from 'cors';
import { getAllMetricsDirectories, getMetricsByName, getWorkflowObjectByName } from './api/REST/get_metrics.js';

const app = express();
app.use(cors());

app.get('/', root);
app.get('/nodes', getNodes);
app.get('/nodes-more', getNodesMore);
app.get('/get-jobs', getJobs);
app.get('/get-workflows', getAllWorkflows);
app.get('/get-workflow/:name', getWorkflowByName);
app.get('/exec-workflow/:name', triggerWorkflow);
app.get('/get-executions', getExecutions)
app.use('/get-metrics', getAllMetricsDirectories);
app.use('/assets/outputs/metrics', express.static('assets/outputs/metrics'));
app.get('/get-metric/:name', getMetricsByName);
app.get('/get-object/:name', getWorkflowObjectByName);

const PORT: number = 3333;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});