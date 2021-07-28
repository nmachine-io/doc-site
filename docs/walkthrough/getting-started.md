---
sidebar_position: 0
sidebar_label: "Getting Started"
---

# Getting Started

## Synopsis

**Objective**. Build a simple KAMA for a simple Kubernetes app, learning the basics of
the KAMA SDK along the way.
**Requirements**: Python 3.8, a Kubernetes cluster, Docker, and `git`.


## Step 1: Create the project

Cloning the `boilerplate-kama` project into your workspace and rename it to `ice-cream`:

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

## Step 2: Write the Hello World

Before hooking up to Kubernetes, we want to make sure there are no problems 
with the SDK and its dependencies. 
It is strongly recommended you use an environment manager for Python like `pipenv`.
Begin by installing the dependencies:

```shell script
# using pipenv
pipenv install
```

Run the **[KAMA Interactive Shell](/tutorials/kama-shell-tutorial)** using the following
command:

```shell script {1}
python3 main.py -m shell
```

You should see something like this:

```shell script
[k8kat::kube_broker] In-cluster auth...
[k8kat::kube_broker] In-cluster connect Failed: Service host/port is not set.
Type "help", "copyright", "credits" or "license" for more information.
(InteractiveConsole)
>>> 
```

Don't worry about `"In-cluster connect Failed"` just yet.
Now run the Hello World:

```python
model = Model.inflate({'title': "Hello World"})
model.get_title()
# => 'Hello World'
```

### Step 1.1: Clone the Repo


### Step 1.2: Inspect the 




Create a directory 





## Step 2: Install the Client




### 1. Install the desktop client

Vendors and end-users need the same application to develop and consume 
applications. As a vendor, you will be running your local application in 
**development mode**, as explained in link..

Check that the application starts normally by running `nectop`.


## 2. Install the KAMA Python SDK

As a publisher, you build your application platform using the KAMA SDK. 
KAMA stands for **Kubernetes Application Management API**.

The `wiz` SDK is a Python3 package called `nectwiz`. In this step, we will create
a Python project with `nectwiz` as a dependency. We will be using the `pipenv` 
environment manager throughout the tutorial.

Clone the sample `shortcake-wiz` from [Nectarines repo on GitHub](/) into your workspace, e.g
```
git clone asdasdasdadadsd
cd shortcake-wiz
```

Your `wiz` will need to talk to Kubernetes. For all Kubernetes connection
configuration options, check out the [Key Concepts page](/key-concepts). 
For now, the easiest way to do this during development is to create `.env` file with:
```
DEVELOPMENT_CONNECT_TYPE=kube-config
DEVELOPMENT_CONNECT_CONTEXT=<name-of-desired-kube-context>

```
Finally, run `pipenv install` or equivalent.

Run the server with `pipenv run python3 main.py` and 
open <a>http://localhost:5000/api/status</a> in a web browser.



## 2. Creating a Development TAM

The TAM (Templatable Application Manifest) is what Nectar invokes to
generate your application's Kubernetes manifest. **In production**, your
TAM will need to be a container or a remote API. 
**But during development**, to iterate rapidly, **your TAM can be a local
executable**. 


For this tutorial, we will be using a trivial application called `shortcake`.
You can find its `helm` and `kerbi` TAMs in the [Nectarines Github repo](/).
If you have a complete variable-based templatable application manifest ready 
to go (e.g a Helm chart or), you can use that too. 

In any case, **you need create a local executable that conforms to the TAM protocol**,
which takes 2 or 3 lines `bash` depending on the templating engine you choose. 
The next subsections give examples of how to do this for `helm`, `kerbi`, and generally.


#### Create a TAM executable for a Kerbi Mixer

If you don't have a `kerbi` project, then `git clone asd`. Then, write a 
script called `ktea-eval` containing:
```
#!/bin/bash
cd <path-to-your-kerbi-project-root>
bundle exec ruby main.rb $@
```

Place it wherever you keep global executables, e.g `/usr/local/bin/ktea-eval`. 
Check this worked by ensuring that `ktea-eval template 
--set namespace=test` outputs a coherent-looking Kubernetes manifest.


#### Create a TAM executable for a Helm Chart
If you don't have a `kerbi` project, then `git clone asd`. 
Then, write a script called `ktea-eval` containing:
```
#!/bin/bash
cd <path-to-your-kerbi-project-root>
bundle exec ruby main.rb $@
```

Place it wherever you keep global executables, e.g `/usr/local/bin/ktea-eval`. 
Check this worked by ensuring that `ktea-eval template 
--set namespace=test` outputs a coherent-looking Kubernetes manifest.



## 4. Putting it all together

By now, you should nave Nectop installed, a `ktea-eval` script 
invokable locally, and your `wiz` project running on `localhost:5000`.

Open Nectop and click on the Tools icon bottom right of the Applications page 
to start the **Development Setup** page. 

Plug in the values from above as such:

![alt text](https://storage.googleapis.com/nectar-mosaic-public/images/Screenshot%20from%202020-10-29%2014-31-35.png "Something")

Click next and the installer should let you continue on. You can complete the installation and play around,
but at this point we will start programming the `wiz`. 

## 5. The wiz Project Layout
