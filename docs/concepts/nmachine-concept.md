---
sidebar_position: 0
sidebar_label: NMachine
---

# System Overview

## What is NMachine?

You can think of NMachine as:
- A Helm wrapper + Brigade substitute
- A Platform as Code SDK
- An application-specific Heroku factory
- A Kubernetes App Store


**In wordier terms**. NMachine gives software publishers an SDK to build an application-specific platforms 
for their Kubernetes applications, where operational knowledge is digitized,
so that unfamiliar users inside or outside of their organization may install/operate/troubleshoot/update 
said applications with confidence at the production-level on their own infrastructure. Publishers can 
then leverage the long-term-support and distribution features from the 
[Publisher Dashboard](https://publisher.nmachine.io), such as
telemetry access, release channels, payments/licenses, and rule-based last-mile configurations. 

## What is _an_ NMachine?

Anytime we refer to **_an_** NMachine, we mean a running instance 
of the application-specific platform you created. This the _an_ in **[an.nmachine.io](https://an.nmachine.io)**.
Akin to VMs as VMWare instances.








## What NMachine _is Not_

It helps to explicitly disambiguate NMachine in the crowded Cloud Native tooling space. 
NMachine is _not_:
- **A new thing apps run _on_**. We take a strong 
**[stance against stack pollution](/concepts/principles#zero-tolerance-for-stack-pollution)**. 
Applications run _next to_ , not _inside_ or _on top of_ NMachines. 
- **A templating engine**. This is not a Helm alternative. You need to bring your own 
templating engine, _like Helm_, explained in the **[KTEA](/concepts/ktea-concept)** page.
- **A CI/CD Tool**. NMachine will not help you build/push your Docker images to their registries. 
Regarding CD, however, there is an open **[Call for Plugins](/)**.

- **A Monitoring Solution**. You can _and should_ program various 
**[metric visualizations](/)** into 
your NMachine, but should always be able to link to dedicated frontends like Grafana for the full picture.


## Digitizing Operational Knowledge

What can a publisher program their NMachine to 
do that makes life better for unfamiliar users who need to run their application? 
The best way to build an intuition for this is to watch the
 demo [Youtube video](https://www.youtube.com/watch?v=p7dqmROKGIo).  


### Health Check & Backups

Running a Kubernetes application you did not write is overwhelming. You want
to take small, reversible steps, and always be reassured things still work. 
The **[KAMA SDK](/concepts/kama-concept)** lets publishers build with empathy
by making it easy to proliferate health checks and event-based backups across their NMachines.



### Manifest Variable Management 

Manifest variables have become _the_ control interface that modern Kubernetes
application developers expose to users. Failure at this level is therefore not an option.
The **[KAMA SDK](/concepts/kama-concept)** lets publishers 
**[thoroughly model](/prebuilt-models/variables/manifest-variables)** every aspect of each individual
manifest variable, from documentation, to validation, dependencies, and audits.


### Controlled Operations

Operating a Kubernetes app in real life is not as linear 
as we would hope it to be. It involves reactively manipulating resources, 
running shell commands, testing things manually, etc. 
The **[KAMA SDK](/concepts/kama-concept)** gives publishers a consistent 
**[Action](/prebuilt-models/actions/actions-overview)**/
**[Operation](/prebuilt-models/operations/operations-overview)** 
system for modelling 
rich, contextual, and interactive DevOps workflows that users can execute with confidence.

### Automated Troubleshooting

An incident in a Kubernetes app rarely comes as a complete surprise to the system's engineers, for they know its secrets. 
For anybody outside the loop, on the other hand, troubleshooting is an agonizingly heuristic-poor search problem. 
The **[KAMA SDK](/concepts/kama-concept)** 
lets publishers intelligently match failures to **[Remediation Options](/nope)**, 
and send obfuscated dumps to the cloud for human review.


### Specific & Purposeful Dashboards

_What matters_, and in _what context_, isn't obvious in a microservice-rich 
Kubernetes application that you did not write yourself. Dashboards that just tabulate `kubectl get <kind>` help, but only so much. 
So, NMachine's **[View Specs](/prebuilt-models/view-specs/view-spec-overview)** lets publishers build up
purposeful, multi-page, dashboards from grids, tables, panels, graphs, and more, without any HTML or Javascript.


 










## Where NMachines Run

NMachine uses a distributed architecture that gives end-users the freedom
to self-host or outsource its two main components - the 
**[KAMA](/concepts/kama-concept)** and **[KTEA](/concepts/ktea-concept)**. 


### Components

![](/img/concepts/system.png)

#### NMachine Client

The **[Desktop](/nope)** or **[Web](/nope)** app that the end-user (i.e the application operator) 
interacts with. Communicates with the **[KAMA Server](/concepts/kama-concept.md)** in order to render information 
and perform actions that let the user operate the publisher's app.

#### KAMA Server

The backend responsible for 
**[digitizing operational knowledge](#digitizing-operational-knowledge)**, as well as communicating with
the templating engine (the **[KTEA](/concepts/ktea-concept.md)**), and the user's Kubernetes cluster. Where
your _code_ in NMachine's _as code_ lives & runs. Open source. Read on **[here](/concepts/kama-concept)**.

#### KTEA Server

Serves a Kubernetes templating engine as a web-based JSON API. You can 
turn existing **[Helm charts into KTEAs](/tutorials/helm-to-ktea-tutorial)** in seconds,
as well as serve **[other templating engines](/)** easily. 
Open source. Read on **[here](/tutorials/any-to-ktea)**.

#### User Kubernetes Cluster

The cluster inside which the user runs the publisher's application. NMachine is entirely
cluster provider agnostic. Users must currently bring their own clusters, but
NMachine-provided clusters will **[soon be available](/nope)**.

#### NMachine Cloud API

Provides real-time services to NMachines, like application metadata, updates and custom variables. 
Also injests telemetry data from deployed NMachines for later consumption in the
 **[Publisher Dashboard](https://publish.nmachine.io)**.
