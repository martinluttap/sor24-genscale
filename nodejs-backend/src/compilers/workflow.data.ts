import { WorkflowType } from "./workflow.types.js";

export const testYamlWorkflow: WorkflowType = {
    name: 'workflow0',
    k8s: {
        volume: 'nfs-pvc',
        root_mount_path: '/data',
        volume_name: 'shared-volume'
    },
    jobs: [
        {
            name: 'workflow-task-one',
            base_image: 'alpine',
            input: [
                {
                    var_name: 'workflow_input_one',
                    job: null,
                    path: 'input/read_from.txt',
                    type: 'file'
                }
            ],
            output: [
                {
                    var_name: 'workflow_output_one',
                    type: 'file',
                    path_relative: 'output_one.txt'
                }
            ],
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    'echo $(echo \"$(cat ${workflow_input_one}) * 15\" | bc) > ${workflow_output_one}'
                ]
            }
        },
        {
            name: 'workflow-task-one-one',
            base_image: 'alpine',
            input: null,
            output: null,
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    'echo \"b\"'
                ]
            }
        },
        {
            name: 'workflow-task-one-two',
            base_image: 'alpine',
            input: null,
            output: null,
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    'echo \"a\"'
                ]
            }
        },
        {
            name: 'workflow-task-two',
            base_image: 'alpine',
            input: [
                {
                    var_name: 'workflow_input_two',
                    job: 'workflow-task-one',
                    path: '${workflow_output_one}',
                    type: 'file'
                }
            ],
            output: [
                {
                    var_name: 'workflow_output_two',
                    type: 'file',
                    path_relative: 'write_out_2.txt'
                }
            ],
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    'echo $(echo \"$(cat ${workflow_input_two}) - 22\" | bc) > ${workflow_output_two}'
                ]
            }
        },
        {
            name: 'workflow-task-three',
            base_image: 'alpine',
            input: [
                {
                    var_name: 'workflow_input_three',
                    job: 'workflow-task-two',
                    path: '${workflow_output_two}',
                    type: 'file'
                }
            ],
            output: null,
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    'echo $(echo \"$(cat ${workflow_input_three}) + 8900\" | bc) > /data/OUT.txt'
                ]
            }
        },
        {
            workflow: {
                name: 'workflow1',
                k8s: {
                    volume: 'nfs-pvc',
                    root_mount_path: '/data',
                    volume_name: 'shared-volume'
                },
                jobs: [
                    {
                        name: 'workflow-task-one',
                        base_image: 'alpine',
                        input: [
                            {
                                var_name: 'workflow_input_one',
                                job: null,
                                path: 'input/read_from.txt',
                                type: 'file'
                            }
                        ],
                        output: [
                            {
                                var_name: 'workflow_output_one',
                                type: 'file',
                                path_relative: 'workflow_output_one.txt'
                            }
                        ],
                        run_command: {
                            command: [
                                '/bin/sh',
                                '-c'
                            ],
                            args: [
                                'echo HELLO'
                            ]
                        }
                    },
                    {
                        workflow: {
                            name: 'workflow2',
                            k8s: {
                                volume: 'nfs-pvc',
                                root_mount_path: '/data',
                                volume_name: 'shared-volume'
                            },
                            jobs: [
                                {
                                    name: 'workflow-task-one',
                                    base_image: 'alpine',
                                    input: [
                                        {
                                            var_name: 'workflow_input_one',
                                            job: null,
                                            path: 'input/read_from.txt',
                                            type: 'file'
                                        }
                                    ],
                                    output: [
                                        {
                                            var_name: 'workflow_output_one',
                                            type: 'file',
                                            path_relative: 'workflow_output_one.txt'
                                        }
                                    ],
                                    run_command: {
                                        command: [
                                            '/bin/sh',
                                            '-c'
                                        ],
                                        args: [
                                            'echo HELLO'
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
}

export const bwaWorkflowMin: WorkflowType = {
    name: 'workflow-bwa',
    k8s: {
        volume: 'nfs-pvc',
        root_mount_path: '/data',
        volume_name: 'shared-volume'
    },
    workflowDataset: [
        {
            var_name: 'bwa_in_one',
            absolute_path: '/data/data/SRR062641_1.filt.fastq.gz'
        },
        {
            var_name: 'bwa_in_two',
            absolute_path: '/data/data/SRR062641_2.filt.fastq.gz'
        },
        {
            var_name: 'bwa_in_three',
            absolute_path: '/data/data/GRCh38.d1.vd1.fa'
        }
    ],
    jobs: [
        {
            name: 'burrows-wheeler-aligner-one',
            base_image: 'infamousxd/bwa-0.7.15',
            input: [
                {
                    var_name: 'workflow_input_one',
                    job: null,
                    path: '${bwa_in_one}',
                    type: 'file'
                },
                {
                    var_name: 'workflow_input_two',
                    job: null,
                    path: '${bwa_in_two}',
                    type: 'file'
                },
                {
                    var_name: 'workflow_input_three',
                    job: null,
                    path: '${bwa_in_three}',
                    type: 'file'
                }
            ],
            output: [
                {
                    var_name: 'workflow_output_one',
                    type: 'file',
                    path_relative: 'output_one.txt'
                }
            ],
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    'bwa/bwa mem -t 96 -T 0 -R "@RG\\tID:HG0096\\tPL:ILLUMINA\\tSM:Sample" ${bwa_in_three} ${bwa_in_one} ${bwa_in_two}'
                ]
            }
        }
    ]
}

export const picardWf: WorkflowType = {
    name: 'workflow0-picard',
    k8s: {
        volume: 'nfs-pvc',
        root_mount_path: '/data',
        volume_name: 'shared-volume'
    },
    workflowDataset: [
        {
            var_name: 'picard_in_one',
            absolute_path: '/data/data/SRR062634_1.filt.part_001.fastq.bam'
        }
    ],
    jobs: [
        {
            name: 'picard-one',
            base_image: 'infamousxd/picard-3.1.1',
            input: [
                {
                    var_name: 'workflow_input_one',
                    job: null,
                    path: '${picard_in_one}',
                    type: 'file'
                }
            ],
            output: [
                {
                    var_name: 'workflow_output_one',
                    type: 'file',
                    path_relative: 'SRR062634_1500MB.bam'
                }
            ],
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    'java -jar /usr/local/bin/picard.jar MarkDuplicates METRICS_FILE=${workflow_output_one}.metrics INPUT=${picard_in_one} ASSUME_SORT_ORDER=queryname OUTPUT=${workflow_output_one} TMP_DIR=. VALIDATION_STRINGENCY=SILENT'
                ]
            }
        }
    ]
}

export const fastqc: WorkflowType = {
    name: 'workflow0-fastqc',
    k8s: {
        volume: 'nfs-pvc',
        root_mount_path: '/data',
        volume_name: 'shared-volume'
    },
    workflowDataset: [
        {
            var_name: 'fastqc_in_one',
            absolute_path: '/data/data/SRR062641_2.filt.fastq.gz'
        }
    ],
    jobs: [
        {
            name: 'fastqc-one',
            base_image: 'infamousxd/fastqc-0.12.1',
            input: [
                {
                    var_name: 'workflow_input_one',
                    job: null,
                    path: '${fastqc_in_one}',
                    type: 'file'
                }
            ],
            output: [
                {
                    var_name: 'workflow_output_one',
                    type: 'file',
                    path_relative: 'SRR062634_1500MB.bam'
                }
            ],
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    '/usr/local/bin/fastqc --dir . --format fastq --kmers 7 --noextract --outdir . --threads 8 ${workflow_input_one} && ls -alps'
                ]
            }
        }
    ]
}

export const fullWorkflow1: WorkflowType = {
    name: 'workflow0-full1',
    k8s: {
        volume: 'nfs-pvc',
        root_mount_path: '/data',
        volume_name: 'shared-volume'
    },
    workflowDataset: [
        {
            var_name: 'SRR062641_1',
            absolute_path: '/data/data/SRR062641_1.filt.fastq.gz'
        },
        {
            var_name: 'SRR062641_2',
            absolute_path: '/data/data/SRR062641_2.filt.fastq.gz'
        },
        {
            var_name: 'index_GRCh38.d1.vd1.fa',
            absolute_path: '/data/data/GRCh38.d1.vd1.fa'
        }
    ],
    jobs: [
        {
            name: 'fastqc-1500',
            base_image: 'infamousxd/fastqc-0.12.1',
            input: [
                {
                    var_name: 'fastqc_in_SRR062641_2',
                    job: null,
                    path: '${SRR062641_2}',
                    type: 'file'
                }
            ],
            output: [
                {
                    var_name: 'workflow_output_one',
                    type: 'file',
                    path_relative: 'SRR062634_1500MB.bam'
                }
            ],
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    '/usr/local/bin/fastqc --dir . --format fastq --kmers 7 --noextract --outdir . --threads 96 ${fastqc_in_SRR062641_2}'
                ]
            }
        },
        {
            name: 'fastq-cleaner-1500',
            base_image: 'infamousxd/fastq-cleaner',
            input: [
                {
                    var_name: 'fastq-cleaner_in_SRR062641_1',
                    job: null,
                    path: '${SRR062641_1}',
                    type: 'file'
                },
                {
                    var_name: 'fastq-cleaner_in_SRR062641_2',
                    job: null,
                    path: '${SRR062641_2}',
                    type: 'file'
                }
            ],
            output: [
                {
                    var_name: 'fastq_cleaner_out_1',
                    type: 'file',
                    path_relative: 'SRR062641_1.filt.fastq.gz'
                },
                {
                    var_name: 'fastq_cleaner_out_2',
                    type: 'file',
                    path_relative: 'SRR062641_2.filt.fastq.gz'
                }
            ],
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    'cd ${JOB_OUT_DIR};/usr/local/bin/fastq_cleaner --fastq ${fastq-cleaner_in_SRR062641_1} --fastq2 ${fastq-cleaner_in_SRR062641_2} --reads_in_memory 5000000'
                ]
            }
        },
        {
            name: 'burrows-wheeler-aligner',
            base_image: 'infamousxd/bwa-0.7.15',
            input: [
                {
                    var_name: 'bwa_input_one',
                    job: 'fastq-cleaner-1500',
                    path: '${fastq_cleaner_out_1}',
                    type: 'file'
                },
                {
                    var_name: 'bwa_input_two',
                    job: 'fastq-cleaner-1500',
                    path: '${fastq_cleaner_out_1}',
                    type: 'file'
                },
                {
                    var_name: 'bwa_input_three',
                    job: null,
                    path: '${index_GRCh38.d1.vd1.fa}',
                    type: 'file'
                }
            ],
            output: [
                {
                    var_name: 'bwa_bam_output',
                    type: 'file',
                    path_relative: 'SRR062641_1.filt.fastq.bam'
                }
            ],
            run_command: {
                command: [
                    '/bin/sh',
                    '-c'
                ],
                args: [
                    'bwa/bwa mem -t 96 -T 0 -R "@RG\\tID:HG0096\\tPL:ILLUMINA\\tSM:Sample" ${bwa_input_three} ${bwa_input_one} ${bwa_input_two} | samtools view -Shb -o ${bwa_bam_output} -'
                ]
            }
        }
    ]
}

export const wkflw: WorkflowType = {
    "name": "workflow0-full1",
    "k8s": {
        "volume": "nfs-pvc",
        "root_mount_path": "/data",
        "volume_name": "shared-volume"
    },
    "workflowDataset": [
        {
            "var_name": "SRR_150MB_1",
            "absolute_path": "/data/data/SRR24039108_150MB_1.fastq"
        },
        {
            "var_name": "SRR_150MB_2",
            "absolute_path": "/data/data/SRR24039108_150MB_2.fastq"
        },
        {
            "var_name": "SRR062641_1",
            "absolute_path": "/data/data/SRR062641_1.filt.fastq.gz"
        },
        {
            "var_name": "SRR062641_2",
            "absolute_path": "/data/data/SRR062641_2.filt.fastq.gz"
        },
        {
            "var_name": "index_GRCh38",
            "absolute_path": "/data/data/GRCh38.d1.vd1.fa"
        },
        {
            "var_name": "ref_dbsnp_144",
            "absolute_path": "/data/data/dbsnp_144.hg38.vcf.gz"
        },
        {
            "var_name": "bam_for_gatkbase",
            "absolute_path": "/data/data/SRR062634_1500MB.bam"
        }
    ],
    "jobs": [
        {
            "name": "fastqc-1500-srr062641-1",
            "base_image": "infamousxd/fastqc-0.12.1",
            "input": [
                {
                    "var_name": "fastqc_in_SRR062641_1",
                    "job": null,
                    "path": "${SRR062641_1}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "fastqc_out_SRR062641_1",
                    "type": "file",
                    "path_relative": "SRR062641_1.filt_fastqc.zip"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "/usr/local/bin/fastqc --dir . --format fastq --kmers 7 --noextract --outdir ${JOB_OUT_DIR} --threads 96 ${fastqc_in_SRR062641_1}"
                ]
            },
            "metrics_identifier": "fastqc"
        },
        {
            "name": "fastqc-1500-srr062641-2",
            "base_image": "infamousxd/fastqc-0.12.1",
            "input": [
                {
                    "var_name": "fastqc_in_SRR062641_2",
                    "job": null,
                    "path": "${SRR062641_2}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "fastqc_out_SRR062641_2",
                    "type": "file",
                    "path_relative": "SRR062641_2.filt_fastqc.zip"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "/usr/local/bin/fastqc --dir . --format fastq --kmers 7 --noextract --outdir ${JOB_OUT_DIR} --threads 96 ${fastqc_in_SRR062641_2}"
                ]
            },
            "metrics_identifier": "fastqc"
        },
        {
            "name": "fastq-cleaner-1500-srr062641-1and2",
            "base_image": "infamousxd/fastq-cleaner",
            "input": [
                {
                    "var_name": "fastq-cleaner_in_SRR062641_1",
                    "job": "fastqc-1500-srr062641-1",
                    "path": "${SRR062641_1}",
                    "type": "file"
                },
                {
                    "var_name": "fastq-cleaner_in_SRR062641_2",
                    "job": "fastqc-1500-srr062641-2",
                    "path": "${SRR062641_2}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "fastq_cleaner_out_1",
                    "type": "file",
                    "path_relative": "SRR062641_1.filt.fastq.gz"
                },
                {
                    "var_name": "fastq_cleaner_out_2",
                    "type": "file",
                    "path_relative": "SRR062641_2.filt.fastq.gz"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "cd ${JOB_OUT_DIR};/usr/local/bin/fastq_cleaner --fastq ${fastq-cleaner_in_SRR062641_1} --fastq2 ${fastq-cleaner_in_SRR062641_2} --reads_in_memory 500000"
                ]
            },
            "metrics_identifier": "fastq_cleaner"
        },
        {
            "name": "burrows-wheeler-aligner",
            "base_image": "infamousxd/bwa-0.7.15",
            "input": [
                {
                    "var_name": "bwa_input_one",
                    "job": "fastq-cleaner-1500-srr062641-1and2",
                    "path": "${fastq_cleaner_out_1}",
                    "type": "file"
                },
                {
                    "var_name": "bwa_input_two",
                    "job": "fastq-cleaner-1500-srr062641-1and2",
                    "path": "${fastq_cleaner_out_2}",
                    "type": "file"
                },
                {
                    "var_name": "bwa_input_three",
                    "job": null,
                    "path": "${index_GRCh38}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "bwa_bam_output",
                    "type": "file",
                    "path_relative": "SRR062641_1.filt.fastq.bam"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "bash -c 'bwa mem -t 8 -T 0 -R \"@RG\\tID:HG0096\\tPL:ILLUMINA\\tSM:Sample\" ${bwa_input_three} ${bwa_input_one} ${bwa_input_two} | samtools view -Shb -o ${bwa_bam_output} -'"
                ]
            },
            "metrics_identifier": "bwa"
        },
        {
            "name": "picard-markduplicate",
            "base_image": "infamousxd/picard-3.1.1",
            "input": [
                {
                    "var_name": "picard_in_bam",
                    "job": "burrows-wheeler-aligner",
                    "path": "${bwa_bam_output}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "picard_out_bam",
                    "type": "file",
                    "path_relative": "SRR062634.bam"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "java -jar /usr/local/bin/picard.jar MarkDuplicates METRICS_FILE=SRR062634_1500MB.bam.metrics INPUT=${picard_in_bam} ASSUME_SORT_ORDER=queryname OUTPUT=${picard_out_bam} TMP_DIR=. VALIDATION_STRINGENCY=SILENT"
                ]
            },
            "metrics_identifier": "picard"
        },
        {
            "name": "samtools-sort-markduplicate",
            "base_image": "infamousxd/samtools-1.8",
            "input": [
                {
                    "var_name": "samtools_in_bam",
                    "job": "picard-markduplicate",
                    "path": "${picard_out_bam}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "samtools_out_bam",
                    "type": "file",
                    "path_relative": "SRR062634.bam"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "samtools sort -@ 8 -o ${samtools_out_bam} -T tmp_srt ${samtools_in_bam}"
                ]
            },
            "metrics_identifier": "samtools"
        },
        {
            "name": "samtools-index-markduplicate",
            "base_image": "infamousxd/samtools-1.8",
            "input": [
                {
                    "var_name": "samtools_in_bam_index",
                    "job": "samtools-sort-markduplicate",
                    "path": "${samtools_out_bam}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "samtools_out_bai",
                    "type": "file",
                    "path_relative": "SRR062634.bai"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "samtools index -b -@ 8 ${samtools_in_bam_index} ${samtools_out_bai}"
                ]
            },
            "metrics_identifier": "samtools"
        },
        {
            "name": "gatk-base-recalibrator",
            "base_image": "infamousxd/gatk-4.2.4.1",
            "input": [
                {
                    "var_name": "gatkbase_in_grch38",
                    "job": null,
                    "path": "${index_GRCh38}",
                    "type": "file"
                },
                {
                    "var_name": "gatkbase_in_dbnsp_144",
                    "job": null,
                    "path": "${ref_dbsnp_144}",
                    "type": "file"
                },
                {
                    "var_name": "gatkbase_in_bam",
                    "job": "samtools-sort-markduplicate",
                    "path": "${samtools_out_bam}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "samtools_out_grp",
                    "type": "file",
                    "path_relative": "SRR062634_bqsr.grp"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "java -jar /usr/local/bin/gatk.jar BaseRecalibrator --output ${samtools_out_grp} --input ${gatkbase_in_bam} --known-sites ${gatkbase_in_dbnsp_144} --reference ${gatkbase_in_grch38} --tmp-dir ."
                ]
            },
            "metrics_identifier": "java"
        },
        {
            "name": "gatk-apply-bqsr",
            "base_image": "infamousxd/gatk-4.2.4.1",
            "input": [
                {
                    "var_name": "gatkbqsr_in_bam",
                    "job": "samtools-sort-markduplicate",
                    "path": "${samtools_out_bam}",
                    "type": "file"
                },
                {
                    "var_name": "gatkbqsr_in_bqsr_grp",
                    "job": "gatk-base-recalibrator",
                    "path": "${samtools_out_grp}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "gatkbqsr_out_bam",
                    "type": "file",
                    "path_relative": "SRR062634.bam"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "java -jar /usr/local/bin/gatk.jar ApplyBQSR --output ${gatkbqsr_out_bam} --bqsr-recal-file ${gatkbqsr_in_bqsr_grp} --emit-original-quals true --input ${gatkbqsr_in_bam} --tmp-dir ."
                ]
            },
            "metrics_identifier": "java"
        },
        {
            "name": "picard-validate-sam",
            "base_image": "infamousxd/picard-3.1.1",
            "input": [
                {
                    "var_name": "picard_in_bqsr_bam",
                    "job": "gatk-apply-bqsr",
                    "path": "${gatkbqsr_out_bam}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "picard_sam_out",
                    "type": "file",
                    "path_relative": "SRR062634.bam.metrics"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "java -jar /usr/local/bin/picard.jar ValidateSamFile IS_BISULFITE_SEQUENCED=false OUTPUT=${picard_sam_out} IGNORE_WARNINGS=true INDEX_VALIDATION_STRINGENCY=NONE INPUT=${picard_in_bqsr_bam} MAX_OUTPUT=100 MODE=VERBOSE TMP_DIR=. VALIDATE_INDEX=false VALIDATION_STRINGENCY=STRICT"
                ]
            },
            "metrics_identifier": "java"
        },
        {
            "name": "picard-collect-wgs-metrics",
            "base_image": "infamousxd/picard-3.1.1",
            "input": [
                {
                    "var_name": "picardwgs_in_bqsr_bam",
                    "job": "gatk-apply-bqsr",
                    "path": "${gatkbqsr_out_bam}",
                    "type": "file"
                },
                {
                    "var_name": "picardwgs_in_grch38",
                    "job": null,
                    "path": "${index_GRCh38}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "picardwgs_out",
                    "type": "file",
                    "path_relative": "SRR062634.bam.metrics"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "java -jar /usr/local/bin/picard.jar CollectWgsMetrics OUTPUT=${picardwgs_out} INPUT=${picardwgs_in_bqsr_bam} REFERENCE_SEQUENCE=${picardwgs_in_grch38} VALIDATION_STRINGENCY=SILENT"
                ]
            },
            "metrics_identifier": "java"
        },
        //   {
        //     "name": "picard-collect-0xogmetrics",
        //     "base_image": "infamousxd/picard-3.1.1",
        //     "input": [
        //       {
        //         "var_name": "picard0xo_in_bqsr_bam",
        //         "job": "gatk-apply-bqsr",
        //         "path": "${gatkbqsr_out_bam}",
        //         "type": "file"
        //       },
        //       {
        //         "var_name": "picard0xo_in_grch38",
        //         "job": null,
        //         "path": "${index_GRCh38}",
        //         "type": "file"
        //       },
        //       {
        //         "var_name": "picard0xo_in_dbnsp_144",
        //         "job": null,
        //         "path": "${ref_dbsnp_144}",
        //         "type": "file"
        //       }
        //     ],
        //     "output": [
        //       {
        //         "var_name": "picard0xo_out",
        //         "type": "file",
        //         "path_relative": "SRR062634.bam.oxometrics"
        //       }
        //     ],
        //     "run_command": {
        //       "command": [
        //         "/bin/sh",
        //         "-c"
        //       ],
        //       "args": [
        //         "java -jar /usr/local/bin/picard.jar CollectOxoGMetrics OUTPUT=${picard0xo_out} CONTEXTS=CCG DB_SNP=${picard0xo_in_dbnsp_144} INPUT=${picard0xo_in_bqsr_bam} REFERENCE_SEQUENCE=${picard0xo_in_grch38} TMP_DIR=. USE_OQ=true VALIDATION_STRINGENCY=SILENT"
        //       ]
        //     }
        //   }
    ]
}

export const gatk: WorkflowType = {
    name: 'workflow0-gatk',
    k8s: {
        volume: 'nfs-pvc',
        root_mount_path: '/data',
        volume_name: 'shared-volume'
    },
    "workflowDataset": [
        {
            "var_name": "SRR062641_1",
            "absolute_path": "/data/data/SRR062641_1.filt.fastq.gz"
        },
        {
            "var_name": "SRR062641_2",
            "absolute_path": "/data/data/SRR062641_2.filt.fastq.gz"
        },
        {
            "var_name": "index_GRCh38",
            "absolute_path": "/data/data/GRCh38.d1.vd1.fa"
        },
        {
            "var_name": "ref_dbsnp_144",
            "absolute_path": "/data/data/dbsnp_144.hg38.vcf.gz"
        },
        {
            "var_name": "samtools_out_bam",
            "absolute_path": "/data/data/SRR062634_1500MB.bam"
        }
    ],
    jobs: [
        {
            "name": "gatk-base-recalibrator",
            "base_image": "infamousxd/gatk-4.2.4.1",
            "input": [
                {
                    "var_name": "gatkbase_in_grch38",
                    "job": null,
                    "path": "${index_GRCh38}",
                    "type": "file"
                },
                {
                    "var_name": "gatkbase_in_dbnsp_144",
                    "job": null,
                    "path": "${ref_dbsnp_144}",
                    "type": "file"
                },
                {
                    "var_name": "gatkbase_in_bam",
                    "job": null,
                    "path": "${samtools_out_bam}",
                    "type": "file"
                }
            ],
            "output": [
                {
                    "var_name": "samtools_out_grp",
                    "type": "file",
                    "path_relative": "SRR062634_bqsr.grp"
                }
            ],
            "run_command": {
                "command": [
                    "/bin/sh",
                    "-c"
                ],
                "args": [
                    "java -jar /usr/local/bin/gatk.jar BaseRecalibrator --output ${samtools_out_grp} --input ${gatkbase_in_bam} --known-sites ${gatkbase_in_dbnsp_144} --reference ${gatkbase_in_grch38} --tmp-dir ."
                ]
            }
        }
    ]
}

export const stress: WorkflowType = {
	"name": "workflow-stress",
	"k8s": {
		"volume": "nfs-pvc",
		"root_mount_path": "/data",
		"volume_name": "shared-volume"
	},
	"workflowDataset": [],
	"jobs": [
		{
			"name": "sysbench-1",
			"base_image": "severalnines/sysbench",
			"input": [
				{
					"var_name": "1",
					"job": null,
					"path": "1",
					"type": "file"
				}
			],
			"output": [
				{
					"var_name": "2",
					"type": "file",
					"path_relative": "2"
				}
			],
			"run_command": {
				"command": [
					"/bin/sh",
					"-c"
				],
				"args": [
					"sysbench --threads=48 --time=10 cpu run"
				]
			}
		},
		{
			"name": "sysbench-2",
			"base_image": "severalnines/sysbench",
			"input": [
				{
					"var_name": "2",
					"job": null,
					"path": "2",
					"type": "file"
				}
			],
			"output": [
				{
					"var_name": "3",
					"type": "file",
					"path_relative": "3"
				}
			],
			"run_command": {
				"command": [
					"/bin/sh",
					"-c"
				],
				"args": [
					"sysbench fileio --file-total-size=15G --file-test-mode=rndrw --time=30 --max-requests=0 prepare; sysbench fileio --file-total-size=15G --file-test-mode=rndrw --time=30 --max-requests=0 run; sysbench fileio --file-total-size=15G --file-test-mode=rndrw --time=30 --max-requests=0 cleanup"
				]
			}
		},
		{
			"name": "sysbench-3",
			"base_image": "severalnines/sysbench",
			"input": [
				{
					"var_name": "3",
					"job": null,
					"path": "3",
					"type": "file"
				}
			],
			"output": [
				{
					"var_name": "4",
					"type": "file",
					"path_relative": "4"
				}
			],
			"run_command": {
				"command": [
					"/bin/sh",
					"-c"
				],
				"args": [
					"sysbench --test=memory --memory-block-size=1M --memory-total-size=1000G run"
				]
			}
		},
		{
			"name": "sysbench-4",
			"base_image": "severalnines/sysbench",
			"input": [
				{
					"var_name": "4",
					"job": null,
					"path": "4",
					"type": "file"
				}
			],
			"output": [
				{
					"var_name": "5",
					"type": "file",
					"path_relative": "5"
				}
			],
			"run_command": {
				"command": [
					"/bin/sh",
					"-c"
				],
				"args": [
					"sysbench --threads=48 --time=30 cpu run"
				]
			}
		}
	]
}