---
sidebar_position: 2
sidebar_label: Connecting a Cluster
---

# Connecting to your Cluster

This tutorial is for end-users. We cover the steps required to connect your Kubernetes cluster
to NMachine Cloud. You'll want to do this if you plan use the SaaS client 
**[an.nmachine.io](https://an.nmachine.io)** as your NMachine client.

:::note Not required for the Desktop Client
If you instead choose the **[Desktop Client](/nope)**, NMachine will connect to your
cluster by reading the `~/.kube/config`.
:::


## 1. Create the RBAC Resources

NMachine connects to your cluster via 
**[Service Account authentication](https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/)**.

This means you need to create roles, role bindings, and a service account resource 
that constitute NMachine's permissions and identity. To use the default configuration, 
apply the pre-built: 

```bash
file="https://raw.githubusercontent.com/nmachine-io/k8kat/master/auth/nmachine-cloud-access.yaml"
kubectl apply -f "$file"
```

This creates 
* a `ServiceAccount` called `nmachine-client` in the `default` namespace
* a `ClusterRoleBinding` called `nmachine-client`

## 2. Get the Credentials

With the RBAC resource created, Kubernetes will have generated a `Secret` called `asdd` 
for our new `ServiceAccount`. List `secrets` with kubectl and copy the  name of the newest 
one (name starts with `'nmachine-client-'`):

```bash
NAME                          TYPE                                  DATA   AGE
default-token-4hpbk           kubernetes.io/service-account-token   3      31d
nmachine-client-token-msvqm   kubernetes.io/service-account-token   3      90m
``` 

Then, store the values we need in variables (make sure to 
replace `nmachine-client-token-msvqm` with your secret's name from the step above):

```bash
token=$(kubectl get secret/nmachine-client-token-msvqm -o json -n default | jq -r .data.token)
ca_crt=$(kubectl get secret/nmachine-client-token-msvqm -o json -n default | jq -r '.data."ca.crt"')
```

Finally, grab your cluster's IP address. The easiest way is to run `cluster-info`: 

```bash
kubectl cluster-info
>>> Kubernetes master is running at https://XXX.YYY.ZZZ.TTT
>>> # ...
```


## 3. Fill the Form

Use `xclip` to copy the `token` and `ca.crt` values to the clipboard:

```bash
echo $ca_crt | xclip -sel clip
# now copy paste into form
echo $token | base64 -d | xclip -sel clip
# now copy paste into form
```

![](/img/tutorials/connect-cluster-form.png)

Head to the **[Cluster Registration Page](https://an.nmachine.io/settings/connection/new)**. 
