---
sidebar_position: 0
sidebar_label: "Getting Started"
---

# Building your first NMachine

## Synopsis

**Objective**. Learn **[KAMA](/concepts/kama-concept)** development by writing a
simple KAMA for a simple, pre-built app 
([Ice Kream 🍦](https://github.com/nmachine-io/playground/tree/master/ice-kream)). 
Make sure you've seen the demo video; this walkthrough is more or less structured around
how to build each page in the app.

**Requirements**. 
1. Python 3.8. Plus, strongly recommended: [Pipenv](https://pipenv.pypa.io/en/latest/).
1. A Kubernetes cluster. Plus, strongly recommended: [k9s](https://github.com/derailed/k9s).
1. Docker and `git`.

**Non-Objectives**:
1. Publishing our NMachine to the App Store. For that, read the [publishing tutorial](/tutorials/publishing-tutorial.md).
1. Developing the underlying app, its Helm chart, or its [KTEA](/tutorials/helm-to-ktea-tutorial).





## Step 1: Create the Project

Clone the [`kama-boilerplate`](https://github.com/nmachine-io/kama-boilerplate) 
project into your workspace, rename it to `ice-kream`, and install the SDK.

```shell script
git clone git@github.com:nmachine-io/kama-boilerplate.git
mv kama-boilerplate ice-cream-kama
cd ice-cream-kama
pipenv install #adjust to your env manager
```

Start the **[KAMA Interactive Console](/tutorials/kama-console-tutorial)** 
and make sure the following two statements return coherent values:

```python title="$ python main.py console"
Model.inflate({'title': "Hello World"}).get_title()
# => Hello World
[ns.name for ns in KatNs.list()]
# => ['default', 'kube-public', 'kube-system']
```

To troubleshoot or configure your Kubernetes connection, read the 
[Connecting to Kubernetes with K8Kat tutorial](/tutorials/k8kat-essentials).






## Step 2: Initialize a mock NMachine

With the SDK installed, we can create a 
Kubernetes namespace with a [Master ConfigMap](/concepts/state-concept.md), which
is the sole resource an NMachine needs to manage an app. For now, we'll use the handy
`mock-install <namespace>` utility to mock one; we'll graduate to making real ones later
on in the tutorial. Issue the following:


```shell script
python main.py mock-install ice-kream
# => [kama_sdk] created configmap/master in namespace ice-kream
# take a look around the configmap
```

Next, let's populate the ConfigMap's `default_vars` with the contents of our
templating engine's `values.yaml`. We'll use a pre-built 
**[KTEA](/concepts/ktea-concept)** that's available at 
[api.nmachine.io/ktea/ice-kream/1.0.1](https://api.nmachine.io/ktea/ice-kream/1.0.1).
Your Master ConfigMap should already be pointing to it; make sure
by inspecting the output of `config_man.get_ktea_config()` from the console.

Now, to populate `default_vars`: 

```python title="$ python main.py console"
defaults = ktea_client().load_default_values()
config_man.write_default_mvariables(defaults)
```

The return value of `config_man.get_default_mvariables()` should be
equal to the `values.yaml` in the 
[source code](https://github.com/nmachine-io/playground/blob/master/ice-kream/ice-kream-ktea/values/values.yaml.erb).





## Step 3: See our NMachine in the Desktop Client


First, install [the NMachine Desktop Client](/nope), make sure it launches, and that it sees
your relevant Kuberenetes contexts (Kubernetes logo in the bottom left corner).


Next start the **server & worker** processes from the SDK. From your project's root, run **two terminals**:

```shell script title="terminal #1"
python3 main.py server
# [kama_sdk] KAMA server started (namespace=ice-kream)
``` 

```shell script title="terminal #2"
python3 main.py worker
# [kama_sdk] KAMA worker started (namespace=ice-kream)
``` 

![](/img/walkthrough/client-dev-flow-1.png)






## Optional: Reflect on our Actions

A **[KTEA (Kubernetes Templating Engine API)](/concepts/ktea-concept)** 
lets you serve a templating engine (like Helm) over HTTP/JSON. 
For this walkthrough, we will use an existing KTEA hosted on NMachine API 
instead of [creating a new one](/tutorials/helm-to-ktea-tutorial). 

Test it out by running the following:

```shell script
BASE_URL=https://api.nmachine.io/ktea/ice-kream/1.0.0
curl "$BASE_URL/values"
curl -X POST "$BASE_URL/template?release_name=hello_ktea"
```

Take a second to understand how the results match 
the concepts from the [KTEA overview](/concepts/ktea-concept).

**Optional**. You may want to try applying this manifest
to your cluster and seeing the Ice Kream homepage:

```shell script
$BASE_URL=https://api.nmachine.io/ktea/ice-kream/1.0.0
MANIFEST=$(curl -X POST "$BASE_URL/template?release_name=ice-kream-test")

kubectl create namespace ice-cream-test
echo $MANIFEST | kubectl apply -f -
kubectl port-forward svc/app 80:8080 -n ice-cream-test
```

Ensure the app is running: [localhost:8080](http://localhost:8080). Clean up by deleting
our temporary namespace: `kubectl delete ns/ice-kream-test`.
