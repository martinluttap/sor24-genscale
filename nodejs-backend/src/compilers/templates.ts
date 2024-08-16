export const parallelismWorkflowTemplate = {
	"name": "parallel-group",
	"k8s": {
        "volume": "nfs-pvc",
        "root_mount_path": "/data",
        "volume_name": "shared-volume"
    },
	"workflowDataset": [],
	"jobs": []
}

export const parallelismJobTemplate = {
    "name": "splitter",
    "base_image": "pegi3s/seqkit",
    "input": [
        {
            "var_name": "__INPUT",
            "job": null,
            "path": "${__PATH}",
            "type": "file"
        }
    ],
    "output": [
        {
            "var_name": "splitter-output",
            "type": "file",
            "path_relative": "${ROOT}"
        }
    ],
    "run_command": {
        "command": [
            "/bin/sh",
            "-c"
        ],
        "args": [
            "seqkit split2 -p __PARTS -O ${splitter-output} --by-part-prefix split___ITERATION ${__INPUT}"
        ]
    }
}