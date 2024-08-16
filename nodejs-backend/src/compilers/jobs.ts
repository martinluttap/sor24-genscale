import { CPU_METRICS, SYSSTAT_IMAGE } from "../constants.js";
import { JobWrapper } from "./jobs.types.js";
import { Job, WorkflowType } from "./workflow.types.js";

const normalizeNodeName = (name: string, workflowName: string): string => {
    return workflowName + '-' + name;
}

export const parseJob = (job: Job, workflow: WorkflowType): JobWrapper => {
    return {
        parentWorkflow: workflow.name,
        jobStatus: 'pending',
        jobDetails: {
            metadata: {
                name: normalizeNodeName(job.name, workflow.name)
            },
            apiVersion: 'batch/v1',
            kind: 'Job',
            spec: {
                completions: 1,
                parallelism: 1,
                template: {
                    spec: {
                        restartPolicy: 'Never',
                        shareProcessNamespace: true,
                        containers: [{
                            name: job.name,
                            image: job.base_image,
                            command: job.run_command.command,
                            args: job.run_command.args,
                            volumeMounts: [
                                {
                                    name: workflow.k8s.volume_name,
                                    mountPath: workflow.k8s.root_mount_path
                                }
                            ]
                        }, {
                            name: job.name + '-metrics',
                            image: SYSSTAT_IMAGE,
                            command: ['/bin/sh', '-c'],
                            args: [`pid=$(pidstat -h -u -t -d -r -G ${job.metrics_identifier || job.run_command.args[0].split(' ')[0]} ${CPU_METRICS.INTERVAL} >> ${workflow.k8s.root_mount_path}/${workflow.name}/metrics/${job.name}.metrics.txt &); while sleep 1; do pgrep ${job.metrics_identifier || job.run_command.args[0].split(' ')[0]} > /dev/null || { pkill -15 $pid && pkill -f "$0"; break; }; done`],
                            volumeMounts: [
                                {
                                    name: workflow.k8s.volume_name,
                                    mountPath: workflow.k8s.root_mount_path
                                }
                            ],
                            securityContext: {
                                capabilities: {
                                    add: ['SYS_PTRACE']
                                }
                            }
                        }],
                        volumes: [{
                            name: workflow.k8s.volume_name,
                            persistentVolumeClaim: {
                                claimName: workflow.k8s.volume
                            }
                        }]
                    }
                }
            }
        }
    }
}

export const parseInitJob = (workflow: WorkflowType): JobWrapper => {
    let jobFolders = workflow.jobs.map(job => {
        if (job.name && !job.workflow) return job.name;
        else return ""
    })

    return {
        parentWorkflow: workflow.name,
        jobStatus: 'pending',
        jobDetails: {
            metadata: {
                name: normalizeNodeName('init', workflow.name)
            },
            kind: 'Job',
            apiVersion: 'batch/v1',
            spec: {
                completions: 1,
                parallelism: 1,
                template: {
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'init',
                            image: 'alpine',
                            command: ['/bin/sh', '-c'],
                            args: [`cd ${workflow.k8s.root_mount_path}; rm -rf ${workflow.name};mkdir -p ${workflow.name}; cd ${workflow.name}; mkdir -p ${jobFolders.join(" ")}; mkdir -p metrics`],
                            volumeMounts: [
                                {
                                    name: workflow.k8s.volume_name,
                                    mountPath: workflow.k8s.root_mount_path
                                }
                            ]
                        }],
                        volumes: [{
                            name: workflow.k8s.volume_name,
                            persistentVolumeClaim: {
                                claimName: workflow.k8s.volume
                            }
                        }]
                    }
                }
            }
        }
    }
}