#### Backend

GenScale expose the following APIs to user: 

- `GET~/: Root message (do nothing)`
- `GET~/nodes               : List all nodes`
- `GET~/nodes-more          : List all nodes with metadata`
- `GET~/get-jobs            : List all jobs on the cluster`
- `GET~/get-workflows       : List all of existing workflows`
- `GET~/get-workflow/<name> : Get details of workflow <NAME>`
- `GET~/exec-workflow/<name>: Start execution of workflow <NAME>`
- `GET~/get-executions/     : List all running workflows`