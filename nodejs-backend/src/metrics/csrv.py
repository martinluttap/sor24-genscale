import csv
import re
import os
import glob
import argparse

parser = argparse.ArgumentParser("pidstat-to-csv")
parser.add_argument("path", help="Path to metrics directory with pidstat outputs", type=str)
args = parser.parse_args()

data_pattern = re.compile(r"""
    \s+(?P<time>\d+)\s+
    (?P<uid>\d+)\s+
    (?P<tgid>\d+|-)\s+
    (?P<tid>\d+|-)\s+
    (?P<usr>\d+\.\d+)\s+
    (?P<system>\d+\.\d+)\s+
    (?P<guest>\d+\.\d+)\s+
    (?P<cpu>\d+\.\d+)\s+
    (?P<cpu_num>\d+)\s+
    (?P<minflt>\d+\.\d+)\s+
    (?P<majflt>\d+\.\d+)\s+
    (?P<vsz>\d+)\s+
    (?P<rss>\d+)\s+
    (?P<mem>\d+\.\d+)\s+
    (?P<kb_rd>[0-9.-]+)\s+
    (?P<kb_wr>[0-9.-]+)\s+
    (?P<kb_ccwr>[0-9.-]+)\s+
    (?P<iodelay>\d+)\s+
    (?P<command>.+)
""", re.VERBOSE)

rows_processed = 0

def convert_pidstat_to_csv(input_filename, csv_filename, num_cores):
    rows = {}
    
    with open(input_filename, 'r') as file:
        pidstat_output = file.readlines()
    
    for line in pidstat_output:
        match = data_pattern.match(line)
        # print(line, end='')
        if match:
            global rows_processed; 
            rows_processed = rows_processed + 1
            row = match.groupdict()
            if (row['tid'] == '0' or row['tid'] == '-'):
                continue
            time = row['time']
            cpu_num = int(row['cpu_num'])
            cpu_usage = float(row['cpu'])
            
            if time not in rows:
                rows[time] = {'rss': 0, 'kb_rd': 0, 'kb_wr': 0, 'kb_ccwr': 0, 'iodelay': 0}
                rows[time].update({f'cpu{n}': 0 for n in range(num_cores)}) 
            
            rows[time]['cpu' + str(cpu_num)] = cpu_usage
            rows[time]['rss'] = int(row['rss'])
            rows[time]['kb_rd'] = float(row['kb_rd'])
            rows[time]['kb_wr'] = float(row['kb_wr'])
            rows[time]['kb_ccwr'] = float(row['kb_ccwr'])
            rows[time]['iodelay'] = int(row['iodelay'])

    fieldnames = ['time'] + [f'cpu{n}' for n in range(num_cores)] + ['rss', 'kb_rd', 'kb_wr', 'kb_ccwr', 'iodelay']

    with open(csv_filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for time, data in rows.items():
            writer.writerow({'time': time, **data})

def process_directory(input_dir, num_cores):
    for input_filepath in glob.glob(os.path.join(input_dir, '*.metrics.txt')):
        base_name = os.path.basename(input_filepath)
        prefix = os.path.splitext(base_name)[0]
        output_filepath = os.path.join(input_dir, f'{prefix}.csv')
        convert_pidstat_to_csv(input_filepath, output_filepath, num_cores)


input_dir = args.path 
num_cores = 96 
process_directory(input_dir, num_cores)
