import Graph, { DirectedGraph } from "graphology";
import { WorkflowType } from "./workflow.types.js";
import { hasCycle } from "graphology-dag";
import { parseInitJob, parseJob } from "./jobs.js";
import { DefaultDistributedScheduler } from "../schedulers/distributed.js";
import { parallelismJobTemplate, parallelismWorkflowTemplate } from "./templates.js";

const INIT_DEFAULT: string = 'init'
const DATA_PARAL_GROUP_SUFFIX = '-dpgroup-parent'

export class Workflow {
    workflowObject: WorkflowType;
    workflowName: string;
    workflowPrefix: string;
    workflowJobsList: string[];
    workflowVolume: string;
    workflowMountPath: string;
    workflowVariableDict: Object;
    workflowPath: string;
    exec: {
        state: string,
        tasksPending: string[],
        tasksRunning: string[],
        tasksCompleted: string[]
    }

    workflowGraph: DirectedGraph;
    workflowScheduler: DefaultDistributedScheduler;

    parallelism: {
        workflow: WorkflowType,
        splits: number,
        paths: Array<{
            var_name: string,
            path: string,
            split_path: string
        }>
    }
    

    constructor() {
        this.workflowObject = undefined;
        this.workflowName = undefined;
        this.workflowPrefix = '';
        this.workflowJobsList = undefined;
        this.workflowVolume = undefined;
        this.workflowMountPath = undefined;
        this.workflowGraph = undefined;
        this.workflowVariableDict = new Object();
        this.workflowPath = '';
        this.exec = {
            state: 'pending',
            tasksCompleted: [],
            tasksPending: [],
            tasksRunning: []
        }
    }

    normalizeNodeName(name: string): string {
        return this.workflowName + '-' + name;
    }

    readWorkflowFromYAML() { }

    readWorkflowFromObject(workflowObject: any, setPrefix: any = '') {
        this.workflowObject = structuredClone(workflowObject);
        if (!this.workflowObject.parallelism?.enable) {
            // Non Parallel
            if (setPrefix !== '')
                setPrefix += '-';
            this.workflowPrefix = `${Math.floor(Math.random()*(999-100+1)+100)}`;
            this.workflowObject.name = setPrefix + this.workflowObject.name + '-' + this.workflowPrefix;
            this.workflowPrefix = setPrefix + this.workflowPrefix;
        } else {
            // Parallel
            this.workflowObject.name = this.workflowObject.name
        }
    }

    parseWorkflow() {
        if (this.workflowObject == undefined) return;

        if (this.workflowObject.parallelism?.enable) {
            this.workflowName = this.workflowObject.name;
            this.workflowVolume = this.workflowObject.k8s.volume;
            this.workflowMountPath = this.workflowObject.k8s.root_mount_path;

            this.workflowJobsList = [...this.workflowObject.jobs.map((job: any) => job.name)]

            this.workflowPath = `${this.workflowObject.k8s.root_mount_path}/${this.workflowObject.name}`;
            
            this.processParallelism();
        } else {
            this.workflowName = this.workflowObject.name;
            this.workflowVolume = this.workflowObject.k8s.volume;
            this.workflowMountPath = this.workflowObject.k8s.root_mount_path;
            this.workflowJobsList = [...this.workflowObject.jobs.map((job: any) => job.name)]

            this.workflowPath = `${this.workflowObject.k8s.root_mount_path}/${this.workflowObject.name}`;

            this.triggerVariableCompilation();
        }
    }

    /**
     * 1. Create a template workflow to wrap the WF that needs to be parallelized
     * 2. Split files
     * 3. Move split files to individual WF / update paths
     * 4. Parse copies of WF into # of splits and overload paths
     */
    processParallelism() {
        // wrappers
        let workflowTemplate = structuredClone(parallelismWorkflowTemplate);
        
        this.workflowPrefix = `${Math.floor(Math.random()*(999-100+1)+100)}`;
        workflowTemplate.name = this.workflowPrefix + '-' + this.workflowName + DATA_PARAL_GROUP_SUFFIX;
        this.workflowName = workflowTemplate.name;
        this.workflowPath = `${this.workflowObject.k8s.root_mount_path}/${workflowTemplate.name}`;
        workflowTemplate.k8s = this.workflowObject.k8s;
        
        let datasetToBeSplit = this.workflowObject.workflowDataset.filter(dataset => {return dataset.split});

        workflowTemplate.workflowDataset = structuredClone(datasetToBeSplit);

        let waitForArray = [];

        // file split setup
        datasetToBeSplit.forEach((dataset, index) => {
            if (dataset) {
                let jobTemplate = structuredClone(parallelismJobTemplate);

                jobTemplate.run_command.args = jobTemplate.run_command.args.map(arg => arg = arg.replace('__PARTS', this.workflowObject.parallelism.splits.toString()));

                jobTemplate.input.forEach(inp => inp.path = inp.path.replace('__PATH', dataset.var_name));
                jobTemplate.input.forEach((inp) => { inp.var_name = 'input-' + (index + 1)})

                jobTemplate.run_command.args = jobTemplate.run_command.args.map(arg => arg = arg.replace('__INPUT', 'input-' + (index + 1)));
                jobTemplate.run_command.args = jobTemplate.run_command.args.map(arg => arg = arg.replace('__ITERATION', dataset.var_name + '_'));
                jobTemplate.name += '-' + (index + 1);
                waitForArray.push(jobTemplate.name);

                workflowTemplate.jobs.push(jobTemplate);

                dataset.absolute_path = `${this.workflowObject.k8s.root_mount_path}/${workflowTemplate.name}/split_${dataset.var_name}___PART.fastq.gz`;
            }
        })

        
        // update paths
        for (let i = 0; i < this.workflowObject.parallelism.splits; i++) {
            let wfCopy = structuredClone(this.workflowObject);
            wfCopy.workflowDataset.forEach(dataset => {
                dataset.absolute_path = dataset.absolute_path.replace('__PART', ('000' + (i + 1)).substr(-3));
            })

            wfCopy.jobs.forEach(job => job.output.forEach(out => {
                out.path_relative = out.path_relative.replace('__PART', ('000' + (i + 1)).substr(-3));
            }))

            delete wfCopy.parallelism;

            workflowTemplate.jobs.push({
                workflow: wfCopy,
                workflowRunAfterJob: [...waitForArray]
            });
        }

        this.workflowObject = workflowTemplate;

        this.triggerVariableCompilation();
    }

    createGraph(initNode: string = INIT_DEFAULT, graphToConnect: DirectedGraph = undefined, runAfterJob: string[] = undefined): DirectedGraph {
        if (this.workflowObject == undefined) return undefined;

        this.workflowGraph = new Graph.DirectedGraph();

        this.workflowObject.jobs.forEach(job => {
            if (job.name)
                this.workflowGraph.addNode(this.normalizeNodeName(job.name), parseJob(job, this.workflowObject));
        })

        this.workflowObject.jobs.forEach(job => {
            if (!job.workflow) {
                job.input && job.input.forEach(input => {
                    input.job && !this.workflowGraph.hasDirectedEdge(this.normalizeNodeName(input.job), this.normalizeNodeName(job.name)) && this.workflowGraph.addDirectedEdge(this.normalizeNodeName(input.job), this.normalizeNodeName(job.name))
                })
            } else if (job.workflow) {
                const workflow = new Workflow();
                workflow.readWorkflowFromObject(job.workflow, this.workflowPrefix);
                workflow.parseWorkflow();

                if (!job.workflowRunAfterJob)
                    this.workflowGraph = workflow.createGraph(job.name, this.workflowGraph);
                else
                    this.workflowGraph = workflow.createGraph(job.name, this.workflowGraph, [...job.workflowRunAfterJob.map(name => this.normalizeNodeName(name))]);
            }
        })

        this.workflowGraph.addNode(this.normalizeNodeName(INIT_DEFAULT), parseInitJob(this.workflowObject));
        this.workflowGraph.nodes().forEach(node => {
            if (!this.workflowGraph.inDegree(node) && node != this.normalizeNodeName(INIT_DEFAULT)) this.workflowGraph.addDirectedEdge(this.normalizeNodeName(INIT_DEFAULT), node)
        })


        if (graphToConnect !== undefined) {
            graphToConnect.forEachNode((node, attributes) => {
                this.workflowGraph.addNode(node, attributes);
            });

            graphToConnect.forEachEdge((edge, attributes, source, target) => {
                this.workflowGraph.addEdgeWithKey(edge, source, target, attributes);
            });

            if (!runAfterJob && initNode !== INIT_DEFAULT) {
                this.workflowGraph.addDirectedEdge(initNode, this.normalizeNodeName(INIT_DEFAULT));
            } else if (runAfterJob) {
                runAfterJob.forEach(job => {
                    this.workflowGraph.addDirectedEdge(job, this.normalizeNodeName(INIT_DEFAULT));
                })
            }

        }

        return this.workflowGraph;
    }

    getProperties() {
        if (this.workflowObject == undefined) return;

        console.log(`Name: ${this.workflowName}\nJobList: ${this.workflowJobsList}\nVol: ${this.workflowVolume}\nMountPath ${this.workflowMountPath}`);
        console.log(this.workflowGraph.nodes());
        console.log(this.workflowGraph.directedEdges());
        console.log(this.workflowGraph.size);
        console.log('Has cycle? ' + hasCycle(this.workflowGraph));
    }

    /**
     * Uses this.workflowObject and compiles all of the variables (file paths) to their absolute working paths
     * @returns void
     */
    triggerVariableCompilation() {
        if (!this.workflowObject) return;

        this.workflowVariableDict['ROOT'] = `${this.workflowPath}`;
        /**
         * Runs through all job outputs and populates absolute path directory, since output compilation is needed first to
         * compile input
         */
        this.workflowObject.jobs.forEach(job => {
            if (job.name && !job.workflow) {
                job.output?.forEach(output => {
                    if (this.workflowVariableDict.hasOwnProperty(output.var_name)) {
                        if (output.path_relative === '${ROOT}')
                            this.workflowVariableDict[output.var_name] = `${this.workflowPath}`;
                        console.log('Variable conflict: ' + output.var_name + ' in ' + this.workflowObject.name);
                    } else {
                        if (output.path_relative !== '${ROOT}')
                            this.workflowVariableDict[output.var_name] = `${this.workflowPath}/${job.name}/${output.path_relative}`;
                        else
                            this.workflowVariableDict[output.var_name] = `${this.workflowPath}`;

                        console.log('VAR ' + output.var_name, this.workflowVariableDict[output.var_name])
                    }
                })
            }
        })
                
        this.workflowObject.workflowDataset?.forEach((dataset) => {
            if (this.workflowVariableDict.hasOwnProperty(dataset.var_name)) {
                console.log('Variable conflict: ' + dataset.var_name + ' in ' + this.workflowObject.name);
            } else
                this.workflowVariableDict[dataset.var_name] = dataset.absolute_path;
        })

        /**
         * Regex replacement of ${VAR} with VAR's path in the dictionary
         * ONLY output -> input compilation
         */
        this.workflowObject.jobs.forEach(job => {
            if (job.name && !job.workflow) {
                job.input?.forEach(input => {
                    if (input.job !== null) {
                        input.path = input.path.replace(/\${(.*?)}/g, (match, key) => this.workflowVariableDict[key] || match);
                    }
                })
            }
        });

        /**
         * Once input paths are resolved to abs, the dictionary is populated with input keys and absulute paths
         */
        this.workflowObject.jobs.forEach(job => {
            if (job.name && !job.workflow) {
                job.input?.forEach(input => {
                    if (this.workflowVariableDict.hasOwnProperty(input.var_name)) {
                        console.log('Variable conflict: ' + input.var_name + ' in ' + this.workflowObject.name);
                    } else {
                        this.workflowVariableDict[input.var_name] = `${input.path}`;
                        this.workflowVariableDict[input.var_name] = this.workflowVariableDict[input.var_name].replace(/\${(.*?)}/g, (match: any, key: string | number) => this.workflowVariableDict[key] || match)
                    }
                })
            }
        });

        /**
         * Final run, using input and output dictionary paths, regex replace command and arguments 
         */
        this.workflowObject.jobs = this.workflowObject.jobs.map(job => {
            let jx = job;
            this.workflowVariableDict['JOB_OUT_DIR'] = `${this.workflowPath}/${job.name}`;

            if (jx.name && !jx.workflow) {
                let commandArr = jx.run_command.command;
                let argArr = jx.run_command.args;

                commandArr = commandArr.map(comm => {
                    return comm.replace(/\${(.*?)}/g, (match, key) => this.workflowVariableDict[key] || match);
                })
                argArr = argArr.map(arg => {
                    return arg.replace(/\${(.*?)}/g, (match, key) => this.workflowVariableDict[key] || match);
                })

                jx.run_command.command = commandArr;
                jx.run_command.args = argArr;
            }

            return jx;
        });
    }
}
