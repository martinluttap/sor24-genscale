## GenScale -- v0

1. Setup GenScale by following instructions in SETUP.md. 
2. NodeJS backend of GenScale runs on port 3333 of the host node. Suppose node name is 'genscale-node'. We can do port-forwarding to a local machine:

`ssh -f -N -L localhost:3333:localhost:3333 genscale-node`

Open a browser on the local machine and type 'localhost:3333'. 

### Deliverables

We provide the following deliverables: 
- Source code of GenScale
- How to setup
- Dataset
- Container Images 
- Sample Performance Data

#### 1. Source Code

This repository contains all the code needed for setting up GenScale: [Link](https://github.com/martinluttap/genscale-staging)

#### 2. How to Setup

Please check the following file: [Link](https://github.com/martinluttap/genscale-staging/blob/main/SETUP.md)

#### 3. Dataset

As mentioned in [SETUP.md](https://github.com/martinluttap/genscale-staging/blob/main/SETUP.md), we provide two mirrors for sample dataset, i.e. Chameleon Object Store and Google Drive. 

The Goole Drive folder is publicly available here: [Link](https://drive.google.com/drive/folders/1STklmGT5RkU_b3_eJo3G-W8lFLL_dLNZ?usp=sharing)

#### 4. Container Images

The sample DNA-Seq and RNA-Seq workflows requires 7 containers in total. Some of the containers are used in both workflows. We provide both the container images (can be used right away with `docker pull`) and the source code for building each container. 

All containers are merely a repackaging of publicly available tools / applications to suit GenScale's need (e.g. modifying entrypoints). We do not claim ownership of these tools, and we extend heartfelt thanks to the original developers.  

| Application               |    Container   |   Source Code     |
| :----------------         | :------------: | -----------------:|
| BWA                       | [Package](https://github.com/martinluttap/sor24-bwa/pkgs/container/sor24-bwa)               | [Repo](https://github.com/martinluttap/sor24-bwa)             |
| FastQC                    |   [Package](https://github.com/martinluttap/sor24-fastqc/pkgs/container/sor24-fastqc)         | [Repo](https://github.com/martinluttap/sor24-fastqc)             |
| Fastq Cleaner             |  [Package](https://github.com/martinluttap/sor24-fastq_cleaner/pkgs/container/sor24-fastq_cleaner) | [Repo](https://github.com/martinluttap/sor24-fastq_cleaner)          |
| GATK                      |  [Package](https://github.com/martinluttap/sor24-gatk/pkgs/container/sor24-gatk)         | [Repo](https://github.com/martinluttap/sor24-gatk)             |
| Picard                    |  [Package](https://github.com/martinluttap/sor24-picard/pkgs/container/sor24-picard)         | [Repo](https://github.com/martinluttap/sor24-picard)             |
| STAR                      |  [Package](https://github.com/martinluttap/sor24-star/pkgs/container/sor24-star)         | [Repo](https://github.com/martinluttap/sor24-star)             |
| Trimmomatic               |  [Package](https://github.com/martinluttap/sor24-trimmomatic/pkgs/container/sor24-trimmomatic)         | [Repo](https://github.com/martinluttap/sor24-trimmomatic)             |

#### 5. Sample Performance Data

Data can be found in folder `metrics/`.
An example notebook analyzing the CPU utilization can be found here: [Link](https://github.com/martinluttap/genscale-staging/blob/main/metrics/genscale-sor24-dnaseq.ipynb) 