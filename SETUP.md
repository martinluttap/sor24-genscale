# genscale-staging
Staging repo for genscale (summer of reproducibility 2024) 

# Setup

## Infrastructure
We recommend to use 3 machines with at least 16 cores and 32GB memory each. We have tested the artefacts on *Chameleon@UC* using 3 *cascadelake_r* nodes.  

**NOTE**: We only store the input dataset on Chameleon@UC's object store. Users working on other Chameleon sites might need to download the dataset from Google Drive (see Section **Setup Dataset**).

## K8s Cluster

We consider 3 components as part of the k8s cluster setup: control plane, worker nodes, and shared storage (i.e. NFS). 
At the moment we do not yet have a fully-automated solution for setting up the cluster. 
We provide shell scripts for preparing each component, but it is recommended to read each script and copy-paste its content line by line (or block by block) instead of directly executing them. 

We recommend to use UC site if working on ChameleonCloud.  

Assuming we use ChameleonCloud and have 3 machines with name MACHINE-1, MACHINE-2, and MACHINE-3:

#### Setup control plane:
--> On MACHINE-1 

`setup/cluster/1.control-plane.sh`

#### Setup worker nodes:
--> On MACHINE-{2,3}

`setup/cluster/2.worker-nodes.sh` 

## Setup Shared Storage

#### Setup NFS Server
--> On MACHINE-1

`storage/1.nfs.sh`

#### Setup Persistent Volume (PV) and Claim (PVC) in K8s
--> On MACHINE-1:
1. Get its internal ip address:
`hostname -I | awk '{print $1}'`

Then modify *spec.nfs.server* in `storage/2.nfs-pv.yaml` to use this value. 

2. `kubectl create -f storage/2.nfs-pv.yaml`

3. `kubectl create -f storage/3.nfs-pvc.yaml`

## Setup Workflow Manager
--> On MACHINE-1

### Setup Python Dependencies

`pip3 install pandas matplotlib fpdf2`

### Setup NodeJS

#### If NodeJS is not installed in the system
1. Install nvm
   
   a.) `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`
   
   b.) `source ~/.bashrc`
2. Install NodeJS through nvm

   `nvm install 20.12.0`

#### After NodeJS is installed

1. Go to nodejs-backend: 

   `cd ../nodejs-backend`

2. `npm install`
3. Run the workflow manager:
   1. `npm run build:watch`
   2. `npm run dev` (on a different terminal)

## Setup Input Dataset 

We provide two ways to download the dataset: 1.) *Chameleon Object Store*, and 2.) *Google Drive*. 

The objects are stored in Chameleon@UC site. 

### Chameleon's Object Store 

--> On MACHINE-1

1. Setup Chameleon's OpenStack credentials 

   `https://chameleoncloud.readthedocs.io/en/latest/technical/swift.html#managing-object-store-using-the-cli`

2. Create directory for NFS sharing: 

   `mkdir -p /mnt/nfs/data`

3. Set permission for non-sudo (assuming Chameleon environment):

   `chown -R cc:cc /mnt/nfs/` 

4. Download dataset to the folder: 

   `cd /mnt/nfs/data ; openstack container save genscale-store`

## Monitoring
1. Go to monitoring `cd monitoring/`
2. (if necessary) chmod +x `apply_monitoring.sh`
3. Apply the manifests file: `./apply_monitoring.sh`

The monitoring system consists of Prometheus and Grafana. There are several things to note:
- By default, Prometheus' container listens on port 30000, while Grafana on port 3000. 
- The container ports are not yet forwarded (which makes us unable to use their dashboards). Uncomment the 'Port-forwarding' section to do this.   
- Default credentials for Grafana is *admin*:*admin*.
- We configured Prometheus to perform cluster-level, node-level, and pod-level resource monitoring. Import open-source Grafana dashboards to visualize these metrics (It's very simple!).
