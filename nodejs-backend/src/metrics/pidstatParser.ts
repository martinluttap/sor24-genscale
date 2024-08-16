import * as fs from 'fs';

const dataPattern = new RegExp(
    `(?<time>\\d{2}:\\d{2}:\\d{2})\\s+(?<uid>\\d+)\\s+(?<tgid>\\d+|-)\\s+(?<tid>\\d+|-)\\s+(?<usr>\\d+\\.\\d+)\\s+(?<system>\\d+\\.\\d+)\\s+(?<guest>\\d+\\.\\d+)\\s+(?<wait>\\d+\\.\\d+)\\s+(?<cpu>\\d+\\.\\d+)\\s+(?<cpu_num>\\d+)\\s+(?<minflt>\\d+\\.\\d+)\\s+(?<majflt>\\d+\\.\\d+)\\s+(?<vsz>\\d+)\\s+(?<rss>\\d+)\\s+(?<mem>\\d+\\.\\d+)\\s+(?<kb_rd>[0-9.]+)\\s+(?<kb_wr>[0-9.]+)\\s+(?<kb_ccwr>[0-9.]+)\\s+(?<iodelay>\\d+)\\s+(?<command>.+)`,
    'g'
);

export const convertPidstatToCsv = (inputFilename: string, csvFilename: string, numCores: number): void => {
    const rows: { [key: string]: { [key: string]: number } } = {};

    const pidstatOutput = fs.readFileSync(inputFilename, 'utf8');
    const lines = pidstatOutput.split('\n');

    lines.forEach((line) => {
        const match = line.match(dataPattern);
        if (match) {
            const data: { [key: string]: string } = {};
            const groups = match.groups as { [key: string]: string };

            Object.keys(groups).forEach((key) => {
                data[key] = groups[key];
            });

            const time = data['time'];
            const cpuNum = parseInt(data['cpu_num'], 10);
            const cpuUsage = parseFloat(data['cpu']);

            if (!rows[time]) {
                rows[time] = { kb_rd: 0, kb_wr: 0, kb_ccwr: 0, iodelay: 0 };
                for (let n = 0; n < numCores; n++) {
                    rows[time][`cpu${n}`] = 0;
                }
            }

            rows[time][`cpu${cpuNum}`] = cpuUsage;
            rows[time].kb_rd += parseFloat(data['kb_rd']);
            rows[time].kb_wr += parseFloat(data['kb_wr']);
            rows[time].kb_ccwr += parseFloat(data['kb_ccwr']);
            rows[time].iodelay += parseInt(data['iodelay'], 10);
        }
    });

    const fieldnames = ['time', ...Array.from({ length: numCores }, (_, i) => `cpu${i}`), 'kb_rd', 'kb_wr', 'kb_ccwr', 'iodelay'];

    const csvData = Object.entries(rows).map(([time, data]) => ({ time, ...data }));
    const csvContent = csvData.map((row) => fieldnames.map((field) => row[field] || 0).join(',')).join('\n');

    fs.writeFileSync(csvFilename, fieldnames.join(',') + '\n' + csvContent);
    console.log(`Data has been written to ${csvFilename}`);
}
