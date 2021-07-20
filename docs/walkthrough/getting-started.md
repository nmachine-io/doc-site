import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting Started For Publishers

This guides takes us through building a simple platform around a simple Kubernetes application, 
publishing it, and pushing updates. **Pre-requisites**:
1. Access to a Kubernetes Cluster with a valid `context`
1. Python3 installed (and ideally  `pipenv`)
1. An understanding of the [Key concepts](/)


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
