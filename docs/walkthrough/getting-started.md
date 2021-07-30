---
sidebar_position: 0
sidebar_label: "Getting Started"
---

# Building your first NMachine

## Synopsis

**Objective**. Learn **[KAMA](/concepts/kama-concept)** development by writing a
simple KAMA for a simple, pre-built app 
([Ice Kream 🍦](https://github.com/nmachine-io/playground/tree/master/ice-cream/app)). 
Make sure you've seen the demo video; this walkthrough is more or less structured around
how to build each page in the app.

**Requirements**. 
1. Python 3.8. Plus, strongly recommended: [Pipenv](https://pipenv.pypa.io/en/latest/).
1. A Kubernetes cluster. Plus, strongly recommended: [k9s](https://github.com/derailed/k9s).
1. Docker and `git`.

**Non-Objectives**:
1. Publishing our NMachine to the App Store. For that, [go here](/tutorials/publishing-tutorial.md).
1. Developing the underlying app, its Helm chart, or its [KTEA](/tutorials/helm-to-ktea-tutorial).





## Step 1: Create the Project

Clone the [`kama-boilerplate`](https://github.com/nmachine-io/kama-boilerplate) 
project into your workspace and rename it to `ice-kream`:

```shell script
git clone git@github.com:nmachine-io/kama-boilerplate.git
mv kama-boilerplate ice-cream-kama
cd ice-cream-kama
```

Take note of the directory structure:

```
ice-cream-kama
└───assets/
└───descriptors/
└───models/ 
│   main.py
│   Dockerfile
│   Pipfile
```





## Step 2: Hello KAMA Interactive Shell

We want to make sure that 1) there are no problems 
with the SDK and its depenencies, and 2) your Kubernetes cluster is reachable.
It is strongly recommended you use an environment manager for Python like `pipenv`.
Begin by installing the dependencies:

```shell script
# using pipenv
pipenv install
```

Run the **[KAMA Interactive Shell](/tutorials/kama-shell-tutorial)** from your
project root:

```shell_script
python3 main.py -m shell
```

Then, run the following two commands in the shell:

```python title="python3 main.py -m shell"
Model.inflate({'title': "Hello World"}).get_title()
# => Hello World

[ns.name for ns in KatNs.list()]
# => ['default', 'kube-public', 'kube-system']
```

If you noticed any Kubernetes-like errors when the shell started, or if
`KatNs.list()` failed, the 
[Connecting to Kubernetes with K8Kat tutorial](/tutorials/k8kat-essentials).



## Step 3: Hello KTEA (Optional)

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





## Step 4: Hello NMachine Client

**Start the Server & Worker Processes**. From your project root, open two terminals and enter:

```shell script
python3 main.py # from one terminal
python3 main.py -m worker # from the other terminal
``` 

**Download and install the [NMachine Client](https://www.nmachine.io/client)**. 

Start the client and click the "tools" icon on the left. You should see the following.

![](/img/walkthrough/client-dev-flow-1.png)

Fill out the form as follows:
- **KTEA Type**: Static Server
- **KTEA URI**: thing
- **KAMA Type**: Local Server
- **KAMA URI**: http://localhost:5000

Then, click through the steps until the NMachine is installed.
