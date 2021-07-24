---
sidebar_position: 1
sidebar_label: KAMA
---

# Kubernetes Application Management API (KAMA)

The KAMA is the heart of NMachine. Recall that NMachine lets publishers
**[digitize operational knowledge](/concepts/concepts-root#digitizing-operational-knowledge)**;
the KAMA is where that happens. A KAMA is an HTTP-based API that is implements
the functionality needed to power an NMachine, namely talking to the Kubernetes
cluster, read/writing manifest variables, running health checks, running actions, etc...   

## Building and Shipping a KAMA

As a publisher, you will build your KAMA on top of the
**[KAMA SDK](https://pypi.org/project/kama-sdk-py/)** for Python. Once it is ready, you
will go to the [Publisher Dashboard](https://publish.nmachine.io) and reference
your KAMA as part of your application definition. How and where your KAMA actually runs 
is explained [here](#where-kama-servers-run). Building a KAMA with the SDK is the object
of most of this site.

Two points on terminology we use in this documents:
- **"KAMA"**. Depending on the context, "KAMA" may mean either a) a running instance
of a KAMA server, or b) the code you build on the Python KAMA SDK.
- **"Publisher"**: Depending on the context, the "Publisher" may either be to a) 
company that distributes apps with NMachine, or b) a developer of that company 
who develops a KAMA using the SDK.

Zooming into the KAMA: 

![](/img/concepts/kama-zoom.jpg)

## Internal Structure

As shown above, the KAMA has three main parts. The sections below only give a brief introduction;
dedicated pages that go in greater depth are available for each one.

### HTTP API

The NMachine client consumes the KAMA over HTTP. As such, the KAMA's first important function
the KAMA is processing HTTP/JSON requests. As publisher, you probably won't need to know 
how the API's controllers, serializers, or routes work; instead you will focus on writing 
[models](#models). Find comprehensive documentation in [API Spec](#nope.md).

### Models



### Core Modules 

 




## Where KAMA Servers Run

Once you have a KAMA server, it needs to be available for the NMachine client to consume. There
are three (two in production) ways to make a KAMA server available to the client. As a publisher,
you will be asked to choose when creating an application in the 
[Publisher Dashboard](https://publisher.nmachine.io). Note that you
can **support multiple methods** and let each end-user choose their preferred method.

### Option 1: Managed on NMachine

If you Dockerize and `push` your KAMA server to an artifact repo on the web, you can point
[publish.nmachine.io](https://publish.nmachine.io). It will then host it at
`api.nmachine.io/kama/$org/$app_id`. The benefit of this option 
(beyond "serverless"-ness) is that you can set access control rules
e.g "deny access to anybody with an expired license". It also spares the 
user the need to run one more (relatively heavy) workload in their cluster. 

### Option 2: In-Cluster Server

Assuming again that your KAMA server can run as a Docker image, you can make it so that 
the NMachine client creates a special workload in your user's cluster that runs that image. 
If your end users are running your app air-gappped, you'll want to support this strategy.    

### Development-Only: Local Server 

Finally, during development, you'll want to just run your KAMA server on `localhost`.
