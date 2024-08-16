export type PromMetricsOptions = {
    query: string,
    start: string,
    end: string,
    step: string
}

export const fetchMetricsFromPrometheus = async (endpoint: String = 'http://192.5.86.159:30000/api/v1/query_range', options: PromMetricsOptions) => {
    const prometheusQueryUrl = `${endpoint}?${new URLSearchParams(options).toString()}`;
    try {
        const result = await fetch(prometheusQueryUrl);
        const data = await result.json();
        return data;
      } catch (error) {
        return error;
      }
}