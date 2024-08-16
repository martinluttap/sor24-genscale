import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime

def time_to_seconds(time_str):
    t = datetime.strptime(time_str, "%H:%M:%S")
    return t.hour * 3600 + t.minute * 60 + t.second

# Data (skipping "init")
tasks = [
    "fastqc-1", "fastqc-2", "fastq-cleaner", "burrows-wheeler-aligner",
    "picard-markduplicate", "samtools-sort-markduplicate", "gatk-base-recalibrator",
    "samtools-index-markduplicate", "gatk-apply-bqsr", "picard-collect-wgs-metrics",
    "picard-validate-sam"
]

parallel_12 = [
    "00:00:30", "00:00:33", "00:01:05", "00:04:27", "00:01:51", 
    "00:00:16", "00:25:37", "00:00:13", "00:01:05", "00:07:32", "00:00:27"
]

parallel_8 = [
    "00:00:41", "00:00:40", "00:01:34", "00:05:23", "00:02:28", 
    "00:00:26", "00:32:45", "00:00:13", "00:01:36", "00:08:11", "00:00:35"
]

parallel_4 = [
    "00:00:54", "00:00:52", "00:02:58", "00:07:51", "00:04:19", 
    "00:00:33", "00:44:26", "00:00:10", "00:02:58", "00:09:05", "00:00:57"
]

parallel_2 = [
    "00:01:26", "00:01:29", "00:05:51", "00:14:59", "00:08:13", 
    "00:01:12", "00:54:19", "00:00:10", "00:05:38", "00:11:03", "00:01:54"
]

non_parallel = [
    "00:02:43", "00:02:43", "00:11:25", "00:32:48", "00:15:45", 
    "00:02:16", "01:05:18", "00:00:12", "00:10:01", "00:14:29", "00:03:13"
]

# Convert times to seconds
parallel_12_seconds = [time_to_seconds(t) for t in parallel_12]
parallel_8_seconds = [time_to_seconds(t) for t in parallel_8]
parallel_4_seconds = [time_to_seconds(t) for t in parallel_4]
parallel_2_seconds = [time_to_seconds(t) for t in parallel_2]
non_parallel_seconds = [time_to_seconds(t) for t in non_parallel]

# Create the plot
fig, ax = plt.subplots(figsize=(20, 10))

x = np.arange(len(tasks))
width = 0.15

rects1 = ax.bar(x - 2*width, parallel_12_seconds, width, label='Parallel-12', color='purple')
rects2 = ax.bar(x - width, parallel_8_seconds, width, label='Parallel-8', color='skyblue')
rects3 = ax.bar(x, parallel_4_seconds, width, label='Parallel-4', color='lightgreen')
rects4 = ax.bar(x + width, parallel_2_seconds, width, label='Parallel-2', color='yellow')
rects5 = ax.bar(x + 2*width, non_parallel_seconds, width, label='Non-Parallel', color='orange')

ax.set_ylabel('Time (seconds)')
ax.set_title('Comparison of Task Durations: Parallel-12 vs Parallel-8 vs Parallel-4 vs Parallel-2 vs Non-Parallel')
ax.set_xticks(x)
ax.set_xticklabels(tasks, rotation=45, ha='right')
ax.legend()

# Function to add value labels
def autolabel(rects, values):
    for rect, value in zip(rects, values):
        height = rect.get_height()
        ax.annotate(f'{value}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', rotation=90)

# Add value labels
autolabel(rects1, parallel_12_seconds)
autolabel(rects2, parallel_8_seconds)
autolabel(rects3, parallel_4_seconds)
autolabel(rects4, parallel_2_seconds)
autolabel(rects5, non_parallel_seconds)

plt.tight_layout()
plt.show()