import { V1Job } from "@kubernetes/client-node"

export type JobWrapper = {
    jobDetails: V1Job,
    jobStatus: 'running' | 'completed' | 'pending',
    parentWorkflow: string
}