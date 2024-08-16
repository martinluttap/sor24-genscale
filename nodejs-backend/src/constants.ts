import { Workflow } from "./compilers/workflow.js";

const SCRAPE_INTERVAL = '2s';
const METRICS_PATH = './assets/outputs/metrics/';
const PROM_URL = 'http://localhost:30000/api/v1/query_range';
const SYSSTAT_IMAGE = 'pockost/sysstat';
const WORKFLOWS_DIR = 'assets/inputs/workflows';

const CPU_METRICS = {
    COMMAND: 'pidstat -u -t -G',
    INTERVAL: 1
}

const EXEC_HISTORY: Map<String, Workflow> = new Map();

export { SCRAPE_INTERVAL, METRICS_PATH, PROM_URL, SYSSTAT_IMAGE, CPU_METRICS, WORKFLOWS_DIR, EXEC_HISTORY }