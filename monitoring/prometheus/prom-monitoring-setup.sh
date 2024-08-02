# Reference: https://devopscube.com/setup-prometheus-monitoring-on-kubernetes/

# create monitoring namespace
kubectl create namespace monitoring

# create cluster role
kubectl create -f clusterRole.yaml
# OUT:
# clusterrole.rbac.authorization.k8s.io/prometheus created
# clusterrolebinding.rbac.authorization.k8s.io/prometheus created

# create a config map for prometheus configs
kubectl create -f config-map.yaml
# OUT:
# configmap/prometheus-server-conf created

# create prometheus deployment
kubectl create  -f prometheus-deployment.yaml 
# OUT:
# deployment.apps/prometheus-deployment created

# [optional] check deployment using
kubectl get deployments --namespace=monitoring
# OUT:
# NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
# prometheus-deployment   1/1     1            1           36s

# create prometheus service to expose container on port 30000 (change in prometheus-service.yaml)
kubectl create -f prometheus-service.yaml --namespace=monitoring
# OUT:
# service/prometheus-service created

#
# --------------- Kube State Metrics (EXPERIMENT)
#

git clone https://github.com/devopscube/kube-state-metrics-configs.git

kubectl apply -f kube-state-metrics-configs/

kubectl get deployments kube-state-metrics -n kube-system