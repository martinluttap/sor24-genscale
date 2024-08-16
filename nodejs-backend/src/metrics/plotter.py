import pandas as pd
import matplotlib.pyplot as plt
import random
import argparse
import os
from fpdf import FPDF

def get_random_color():
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))

def process_csv_file(input_csv, num_cores, plot_individual):
    # Load the CSV file
    data = pd.read_csv(input_csv)
    prefix = os.path.splitext(os.path.basename(input_csv))[0]
    
    if data.empty or 'time' not in data.columns:
        print(f"Warning: File {input_csv} is empty or doesn't contain the 'time' column. Skipping.")
        return None, None

    # Normalize timestamp
    data['normalized_time'] = data['time'] - data['time'].iloc[0]
    
    stats = {}
    
    # Plot CPU metrics
    plt.figure(figsize=(20, 10))
    if plot_individual:
        cpu_columns = [col for col in data.columns if col.startswith('cpu') and col != 'cpu_num']
        cpu_data = data[cpu_columns]
        for col in cpu_columns:
            plt.plot(data['normalized_time'], data[col], label=col, color=get_random_color())
    else:
        cpu_columns = [col for col in data.columns if col.startswith('cpu') and col != 'cpu_num']
        cpu_data = data[cpu_columns].mean(axis=1)
        plt.plot(data['normalized_time'], cpu_data, label='cpu_aggregate', color=get_random_color())
    plt.title(f'{prefix} - CPU Usage Metrics')
    plt.xlabel('Time Elapsed (seconds)')
    plt.ylabel('CPU Usage')
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    cpu_output_file = os.path.splitext(input_csv)[0] + '.cpu.metrics.png'
    plt.savefig(cpu_output_file)
    plt.close()
    
    stats['cpu'] = {
        'min': cpu_data.min().min(),
        'max': cpu_data.max().max(),
        'mean': cpu_data.mean().mean()
    }

    # Plot Disk metrics
    if 'kb_rd' in data.columns and 'kb_wr' in data.columns:
        plt.figure(figsize=(20, 10))
        plt.plot(data['normalized_time'], data['kb_rd'], label='kb_rd', color=get_random_color())
        plt.plot(data['normalized_time'], data['kb_wr'], label='kb_wr', color=get_random_color())
        plt.title(f'{prefix} - Disk Read/Write Metrics')
        plt.xlabel('Time Elapsed (seconds)')
        plt.ylabel('Disk Read/Write')
        plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.tight_layout()
        disk_output_file = os.path.splitext(input_csv)[0] + '.disk.metrics.png'
        plt.savefig(disk_output_file)
        plt.close()
        
        stats['disk'] = {
            'kb_rd': {
                'min': data['kb_rd'].min(),
                'max': data['kb_rd'].max(),
                'mean': data['kb_rd'].mean()
            },
            'kb_wr': {
                'min': data['kb_wr'].min(),
                'max': data['kb_wr'].max(),
                'mean': data['kb_wr'].mean()
            }
        }
    else:
        print(f"Warning: File {input_csv} doesn't contain 'kb_rd' or 'kb_wr' columns. Skipping disk metrics.")
        disk_output_file = None

    # Plot Memory (RSS) metrics
    if 'rss' in data.columns:
        plt.figure(figsize=(20, 10))
        plt.plot(data['normalized_time'], data['rss'], label='rss', color=get_random_color())
        plt.title(f'{prefix} - Memory (RSS) Metrics')
        plt.xlabel('Time Elapsed (seconds)')
        plt.ylabel('RSS')
        plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.tight_layout()
        memory_output_file = os.path.splitext(input_csv)[0] + '.memory.metrics.png'
        plt.savefig(memory_output_file)
        plt.close()
        
        stats['memory'] = {
            'min': data['rss'].min(),
            'max': data['rss'].max(),
            'mean': data['rss'].mean()
        }
    else:
        print(f"Warning: File {input_csv} doesn't contain 'rss' column. Skipping memory metrics.")
        memory_output_file = None

    return [cpu_output_file, disk_output_file, memory_output_file], stats

def create_pdf(directory, output_pdf, num_cores, plot_individual):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_font('DejaVu', '', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', uni=True)
    for filename in os.listdir(directory):
        if filename.endswith(".csv"):
            prefix = os.path.splitext(filename)[0]
            input_csv = os.path.join(directory, filename)
            output_files, stats = process_csv_file(input_csv, num_cores, plot_individual)
            
            if output_files is None or stats is None:
                continue  # Skip this file if there was an error

            for metric, img_file in zip(['cpu', 'disk', 'memory'], output_files):
                if img_file and os.path.exists(img_file):
                    pdf.add_page()
                    pdf.image(img_file, x=10, y=10, w=190)
                    pdf.set_font("DejaVu", size=12)
                    pdf.ln(200)  # Move to below the image
                    pdf.cell(0, 10, f"{metric.capitalize()} Statistics:", ln=True)
                    if metric == 'disk':
                        for disk_metric in ['kb_rd', 'kb_wr']:
                            pdf.cell(0, 10, f"{disk_metric}:", ln=True)
                            pdf.cell(0, 10, f"  Min:  {stats[metric][disk_metric]['min']:.2f}", ln=True)
                            pdf.cell(0, 10, f"  Max:  {stats[metric][disk_metric]['max']:.2f}", ln=True)
                            pdf.cell(0, 10, f"  Mean: {stats[metric][disk_metric]['mean']:.2f}", ln=True)
                    else:
                        pdf.cell(0, 10, f"Min:  {stats[metric]['min']:.2f}", ln=True)
                        pdf.cell(0, 10, f"Max:  {stats[metric]['max']:.2f}", ln=True)
                        pdf.cell(0, 10, f"Mean: {stats[metric]['mean']:.2f}", ln=True)
    pdf.output(output_pdf)

def main(directory, num_cores, plot_individual):
    output_pdf = os.path.join(directory, 'metrics_report.pdf')
    create_pdf(directory, output_pdf, num_cores, plot_individual)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Render CPU, Disk, and Memory usage metrics graphs for all CSV files in a directory.')
    parser.add_argument('directory', type=str, help='Path to the directory containing CSV files.')
    parser.add_argument('num_cores', type=int, help='Number of CPU cores.')
    parser.add_argument('--plot_individual', action='store_true', default=False, help='Plot individual CPU cores (default is aggregate).')

    args = parser.parse_args()

    main(args.directory, args.num_cores, args.plot_individual)