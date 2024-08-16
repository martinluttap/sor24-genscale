export type WorkflowType = {
    name: string;
    k8s: {
        volume: string;
        root_mount_path: string;
        volume_name: string;
    };
    workflowDataset?: WorkflowDatasetType[],
    jobs: Job[];
    parallelism?: {
        enable: boolean;
        pathVars?: [string];
        splits: number;
    }
};

type WorkflowDatasetType = {
    var_name: string;
    absolute_path: string;
    local_path?: string;
    need_moving?: boolean;
    split?: boolean;
}

export type Job = {
    name?: string;
    base_image?: string;
    input?: Input[] | null;
    output?: Output[] | null;
    run_command?: {
        command: string[];
        args: string[];
    };
    workflow?: WorkflowType;
    workflowRunAfterJob?: string[];
    metrics_identifier?: String;
};

type Input = {
    var_name: string;
    job: string | null;
    path: string;
    type: string;
};

type Output = {
    var_name: string;
    type: string;
    path_relative: string;
};