#!/bin/bash

# Apply setup for monitoring

set -e 

# Prometheus
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f prometheus/clusterRole.yaml
kubectl apply -f prometheus/config-map.yaml
kubectl apply  -f prometheus/prometheus-deployment.yaml 
kubectl get deployments --namespace=monitoring
kubectl apply -f prometheus/prometheus-service.yaml --namespace=monitoring
git clone https://github.com/devopscube/kube-state-metrics-configs.git
kubectl apply -f kube-state-metrics-configs/
rm -rf kube-state-metrics-configs/
kubectl get deployments kube-state-metrics -n kube-system

# Grafana
kubectl apply -f grafana/grafana-datasource-config.yaml
kubectl apply -f grafana/deployment.yaml
kubectl apply -f grafana/service.yaml

# Port-forwarding
# --->> UNCOMMENT THE LINES BELOW <<------
# GRAFANA_POD=$(kubectl get pod -n monitoring | grep grafana | tr -s ' ' | cut -d ' ' -f 1)
# PROMETHEUS_POD=$(kubectl get pod -n monitoring | grep prometheus | tr -s ' ' | cut -d ' ' -f 1)
# kubectl port-forward -n monitoring ${GRAFANA_POD} 3000 &
# kubectl port-forward -n monitoring ${PROMETHEUS_POD} 30000 &

# echo "Port-forward grafana: 3000, prometheus: 30000"

