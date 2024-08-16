// Default distributed K8S Scheduler

import { KubeConfig, V1Job, BatchV1Api, makeInformer } from "@kubernetes/client-node";
import { DirectedGraph } from "graphology";
import { DefaultLogger } from "../loggers/default.js";

const JOB_WATCH_PATH = '/apis/batch/v1/jobs';

export class DefaultDistributedScheduler {
    workloadGraph: DirectedGraph
    kubeConfig: KubeConfig
    logger: DefaultLogger
    api: BatchV1Api
    jobSet: Set<String>

    constructor(graph: DirectedGraph) {
        this.workloadGraph = graph;
        this.kubeConfig = new KubeConfig();
        this.kubeConfig.loadFromDefault();
        this.api = this.kubeConfig.makeApiClient(BatchV1Api);
        this.logger = undefined;
        this.jobSet = new Set<String>();
    }

    attachLogger(logger: DefaultLogger) {
        this.logger = logger;
    }

    async triggerWorkload() {
        if (this.workloadGraph === undefined) return;
    
        for (const node of this.workloadGraph.nodes())
            await this.deleteJobOnK8s(node);

        for (const node of this.workloadGraph.nodes())
            await this.deleteJobOnK8s(node);

        this.workloadGraph.nodes().forEach(node => this.jobSet.add(node));

        let readyJobs = this.fetchSchedulableJobs();
        console.log('RUN', readyJobs)
        readyJobs.forEach(async (job) => {
            // console.log(this.workloadGraph.getNodeAttribute(job, 'jobDetails'))
            await this.runJobOnK8s(this.workloadGraph.getNodeAttribute(job, 'jobDetails'));
        })

        const listFn = () => this.api.listNamespacedJob('default');
        const informer = makeInformer(this.kubeConfig, JOB_WATCH_PATH, listFn);

        informer.on('add', (obj: V1Job) => {
            if (this.workloadGraph.hasNode(obj.metadata.name)) {
                if (this.logger) this.logger.logEvent(obj.metadata.name, 'ADDED');
                console.log(`[${new Date().toLocaleString("en-US", {timeZone: "America/New_York"})}] Job ${obj.metadata.name} status: ADDED`);
            }
        });
        informer.on('update', (obj: V1Job) => {
            console.log(`[${new Date().toLocaleString("en-US", {timeZone: "America/New_York"})}] Job ${obj.metadata.name} status: UPDATED >> ${obj.status.succeeded > 0 ? 'completed': 'running'}`);
            console.log(obj.status)
            if (obj.status.succeeded > 0 && this.workloadGraph.hasNode(obj.metadata.name)) {
                if (this.logger) {
                    this.logger.logEvent(obj.metadata.name, 'COMPLETED');
                    this.logger.createMetricsCSV(obj.metadata.name, this.workloadGraph.getNodeAttribute(obj.metadata.name, 'parentWorkflow'));
                }

                this.jobSet.delete(obj.metadata.name);

                console.log(`${this.jobSet.size} jobs left.`);
                if (this.jobSet.size === 0 && this.logger) console.log('LOG', this.logger.log);

                this.workloadGraph.updateNodeAttribute(obj.metadata.name, 'jobStatus', () => 'completed');
                readyJobs = this.fetchSchedulableJobs();
                console.log('RUN', readyJobs)
                readyJobs.forEach(async (job) => {
                    await this.runJobOnK8s(this.workloadGraph.getNodeAttribute(job, 'jobDetails'));
                })
            }
        });
        informer.on('delete', (obj: V1Job) => {
            if (this.workloadGraph.hasNode(obj.metadata.name))
                console.log(`[${new Date().toLocaleString("en-US", {timeZone: "America/New_York"})}] Job ${obj.metadata.name} status: DELETED`);
        });
        informer.on('error', (err: V1Job) => {
            console.log(`[${new Date().toLocaleString("en-US", {timeZone: "America/New_York"})}] Informer crashed, attempting a Restart`, err);
            // Restart informer after 5sec
            setTimeout(() => {
                informer.start().then(() => (console.log(`[${new Date().toLocaleString("en-US", {timeZone: "America/New_York"})}] Informer Restarted`)));
            }, 1000);
        });

        informer.start();
    }

    async deleteJobOnK8s(jobName: string) {
        try {
            const existingJob = await this.api.readNamespacedJob(jobName, 'default');
            if (existingJob.body) {
                await this.api.deleteNamespacedJob(jobName, 'default');
                console.log(`Deleted existing job: ${jobName}`);
            }
        } catch (error) {
            // console.error('Error checking existing job:', error.body);
        }
    }

    async runJobOnK8s(job: V1Job) {
        try {
            const response = await this.api.createNamespacedJob('default', job);
            console.log('Job created:', response.body.metadata.name);
            this.workloadGraph.updateNodeAttribute(job.metadata.name, 'jobStatus', () => 'running');
        } catch (error) {
            console.error('Error creating job:', error.body);
        }
    }

    fetchSchedulableJobs(): string[] {
        let schedulable: string[] = [];

        this.workloadGraph.nodes().forEach((node) => {
            let allowNode: Boolean = true;
            this.workloadGraph.forEachInNeighbor(node, (neighbour) => {
                if (this.workloadGraph.getNodeAttribute(neighbour, 'jobStatus') !== 'completed')  allowNode = false;
            });

            if (allowNode && this.workloadGraph.getNodeAttribute(node, 'jobStatus') === 'pending') schedulable.push(node);
        })

        return schedulable;
    }
}