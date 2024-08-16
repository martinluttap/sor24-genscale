import { KubeConfig, CoreV1Api, V1NodeList, BatchV1Api, Watch, V1Job } from '@kubernetes/client-node';

const kubeconfig = new KubeConfig();
kubeconfig.loadFromFile(process.env.KUBECONFIG || `${process.env.HOME}/.kube/config`);

const coreApi = kubeconfig.makeApiClient(CoreV1Api);
const batchApi = kubeconfig.makeApiClient(BatchV1Api);

export const listNodes = async (): Promise<string[]> => {
    let nodes: string[] = [];

    const { body } = await coreApi.listNode();

    body.items.forEach(node => {
        nodes.push(node.metadata.name);
    })

    return nodes;
}

export const listNodesMore = async (): Promise<V1NodeList> => {
    const { body } = await coreApi.listNode();

    return body;
}


export const listJobs = async() => {
    let jobs: string[] = [];

    const { body } = await batchApi.listJobForAllNamespaces();

    body.items.forEach(job => {
        jobs.push(job.metadata.name);
    });

    return body;
}

export const getCompletedPodForJob = async(job: String) => {
    const podList = await coreApi.listNamespacedPod('default');

    // Filter pods that belong to the specified job and are in the 'Succeeded' phase
    const pod = podList.body.items.find(
      pod =>
        pod.metadata.labels &&
        pod.metadata.labels['job-name'] === job &&
        pod.status.phase === 'Succeeded'
    );

    return pod
}

export async function watchJobs() {
    const kubeConfig = new KubeConfig();
    kubeConfig.loadFromDefault();
  
    const watch = new Watch(kubeConfig);
  
    watch.watch('/apis/batch/v1/jobs', {}, (type, obj: V1Job) => {
        console.log(`Job ${obj.metadata.name} status: ${type} >> ${obj.status.succeeded > 0 ? 'completed': 'running'}`);
    }, () => {});
}