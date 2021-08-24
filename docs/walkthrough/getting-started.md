---
sidebar_position: 0
sidebar_label: "Getting Started"
---

# Building your first NMachine

## Synopsis

**Objective**. Learn **[KAMA](/concepts/kama-concept)** development by writing a
simple KAMA for a simple, pre-built app. 
Make sure to watch the [demo video](/) as this walkthrough is more or less structured around
how to build each page. We will start with the nearly empty [boilerolate KAMA](/nope) and 
finish with a functional [Ice Kream 🍦](https://github.com/nmachine-io/mono/tree/master/ice-kream)
store you can share with your friends.

**Requirements**. 
1. Python 3.8. Plus, strongly recommended: [Pipenv](https://pipenv.pypa.io/en/latest/).
1. A Kubernetes cluster. Plus, strongly recommended: [k9s](https://github.com/derailed/k9s).
1. `docker` and `git`.

**Non-Objectives**:
1. Publishing our NMachine to the App Store. For that, read the [publishing tutorial](/tutorials/publishing-tutorial.md).
1. Developing the underlying app, its Helm chart, or its [KTEA](/tutorials/helm-to-ktea-tutorial).


**Game Plan**: [boilerplate](/nope) 
-> Variables -> System Checks -> Actions -> Operation -> Plugins -> Homepage 
-> [Ice Kream 🍦](https://github.com/nmachine-io/playground/tree/master/ice-kream)


## Step 1: Clone the Boilerplate Repo

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
Kubernetes namespace with a [Kamafile](/concepts/kamafile-concept.md), which
is the sole resource an NMachine needs to manage an app. For now, we'll use the handy
`mock-install <namespace>` utility to mock one:


```shell script
python main.py mock-install ice-kream
# => [kama_sdk] created configmap/master in namespace ice-kream
# take a look around the configmap
```

Let's first make sure that our NMachine is pointing to the right KTEA:

```python title="$ python main.py console"
config_man.get_ktea_config()
# => {'type': 'server', 'uri': 'https://api.nmachine.io/ktea/nmachine/ice-kream-ktea', 'version': '1.0.1'}
# you should see the above
```

Now we can populate the [Kamafile](/nope)'s' `default_vars` with the contents of our
templating engine's `values.yaml`:


```python title="$ python main.py console"
defaults = ktea_client().load_default_values()
config_man.write_default_vars(defaults)
```

We now have minimally configured Kamafile. This step will get automated once we
graduate to a full fidelity prototype. 









## Step 3: See our NMachine in the Desktop Client


Begin by installing [the NMachine Desktop Client](/nope), making sure it launches, and that it sees
your relevant Kuberenetes contexts (Kubernetes logo in the bottom left corner).


Next start the **server** process. From your project's root:

```shell script title="terminal #1"
python3 main.py server
# [kama_sdk] KAMA server started (namespace=ice-kream)
``` 

Clicking on your NMachine's entry in the desktop client root page, you should see:


![](/img/walkthrough/after-mock-install.png)



## NB: The Walkthrough is [YAML Maximalist](/model-mechanics/yaml-vs-python.md)

A frequent confusion about the KAMA SDK is whether you should use mostly YAML or Python. You 
can find more about this in a **[dedicated article](/model-mechanics/yaml-vs-python.md)**.

This guide takes the YAML maximalist route for two simple reasons: 1) YAML is easy
to read, and 2) most people are YAML maximalists. 


