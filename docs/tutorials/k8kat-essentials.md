---
sidebar_label: K8Kat Essentials
sidebar_position: 10
---

# Learn the K8Kat Essentials

The KAMA SDK interfaces with Kubernetes through **`k8kat`** - 
an open source NMachine-maintained library based on the official Kubernetes python library. 
Read about it on [GitHub](https://github.com/nmachine-io/k8kat).

This page is intended to give you enough working knowledge of `k8kat` to be
effective in your KAMA development.

## Connecting to a Cluster

:::caution
This applies **to development only**. Learn about how this works in production 
[here](/tutorials/publishing-tutorial).
:::

If your project is based on the [`kama-boilerplate`](https://github.com/nmachine-io/kama-boilerplate),
you should have a `.env` file with the following:

```shell script title=".env"
KAT_ENV=development
FLASK_ENV=development
DEVELOPMENT_CONNECT_TYPE=kube-config
```

During development, the cluster you mean to connect to is most probably listed in your `~/.kube/config`. If
so, do not change the `.env`. Otherwise, read the more comprehensive [k8kat cluster connection docs](/nope).

Using the `.env` above as-is, `k8kat` will connect to whatever cluster is given by the `current-context`. 
To see your `current-context`, run `kubectl config current-context`.

To force `k8kat` to connect via a particular context, set the `CONNECT_TYPE` variable:

```shell script title=".env"
# ...old contents unchanged
DEVELOPMENT_CONNECT_TYPE=<context name>
```
