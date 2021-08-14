---
sidebar_position: 1
sidebar_label: KAMA
---

# Kubernetes Application Management API (KAMA)

The KAMA is your NMachine's backend. Recall that NMachine lets publishers
**[digitize operational knowledge](/concepts/concepts-root#digitizing-operational-knowledge)**;
the KAMA is where you encode that knowledge. 

Structurally, the KAMA is an HTTP/JSON API consumed by the NMachine client. 
It is the backend that computes all the values and performs all
the work requested by the user via the NMachine client. 




## Building and Shipping an NMachine

As a publisher, you build your NMachine on top of the
**[KAMA SDK](https://pypi.org/project/kama-sdk-py/)**, which is a Django-like open source framework. 
When it's ready to share, you publish it using the [Publisher Dashboard](https://publish.nmachine.io). 
How and where your KAMA actually runs is explained [here](#where-kama-servers-run). Building a KAMA 
with the SDK is the focus of most of the documentation.



## Internal Structure

![](/img/concepts/kama-zoom.jpg)

As shown above, the KAMA has three main parts. The sections below only give a brief introduction;
dedicated pages are available for each one.

### HTTP API

The NMachine client consumes the KAMA over HTTP/JSON. As such, the KAMA's first important function
is processing HTTP/JSON requests. As publisher, you won't likely need to know 
how the API's controllers, serializers, or routes work; instead you will focus on writing 
[models](#models). Find comprehensive documentation in the [API Spec](/nope).


### Models

As a publisher building your KAMA, most of your focus will be Models. These are the logical
entities that make up an NMachine, like a 
[`ManifestVariable`](/models/variables/manifest-variables) or a 
[`KubectlApplyAction`](/models/actions/kubernetes-actions#kubectlapplyaction). 
As a publisher, your unique NMachine is defined by the Models you define. Find 
 comprehensive documentation starting in the [Models Overview](/models/models-overview.md).


### Core Modules 

Behind the Models lie the Core Modules. These are simply a collection of Python modules.
They do much of the actual work delegated out by Models. As a publisher, you will only
need to think about Core Modules when you create custom `Model` subclasses.
Find comprehensive documentation in the [API Spec](/nope). 




## Where KAMA Servers Run

Once you have a KAMA server, it needs to be available for the NMachine client to consume. There
are three (two in production) ways to make a KAMA server available to the client. As a publisher,
you will be asked to choose when creating an application in the 
[Publisher Dashboard](https://publisher.nmachine.io). Note that you
can **support multiple methods** and let each end-user choose their preferred method.

### Option 1: Managed on NMachine

If you Dockerize and `push` your KAMA to an artifact repo on the web, you can point
[NMachine](https://publish.nmachine.io) to it. It will then host it at
`api.nmachine.io/kama/$org/$app_id`. The benefit of this option 
(beyond "serverless"-ness) is that you can set access control rules
e.g "deny access to anybody with an expired license". It also spares the 
user the need to run one more (relatively heavy) workload in their cluster. 

### Option 2: In-Cluster Server

Again, if you Dockerize your KAMA, you can make it so that 
the NMachine client creates a special workload in your user's cluster that runs that image. 
If your end users are running your app air-gappped, you'll want to support this strategy.    

### Development-Only: Local Server 

Finally, during development, you'll want to just run your KAMA server on `localhost`.
