---
sidebar_position: 0
sidebar_label: Overview
---

# System Overview

## What is NMachine?

You can think of NMachine as:
- A Helm wrapper + Brigade substitute
- A Platform as Code SDK
- An application-specific Heroku factory
- A Kubernetes B2B App Store


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

### Troubleshooting

Prior knowledge is obviously instrumental to fixing problems. A Kubernetes developer
is often aware of the bad states the system can end up in; it's then a question of doing
the right diagnosis and not botching the remediation. That's why NMachine
lets the publisher create remediation options for failed health checks or actions.

### Organization

With real world, complex, microservice-based application it's not all 
obvious _where things are_. NMachine gives publishers complete freedom to define
dashboards with any kind of data (Kubernetes or not) that makes the most sense for their 
unique application.
 










## Where NMachines Run

NMachine uses a distributed architecture that gives end-users the freedom
to self-host or outsource its two main components - the 
**[KAMA](/concepts/kama-concept)** and **[KTEA](/concepts/ktea-concept)**. 


### NMachine's Four Components

![](/img/concepts/overview-system.jpg)

#### NMachine Client

This is what the end-user (i.e the application operator) sees. It is the dashboard
that lets end-users install/operate apps provided by publishers. One client can 
show multiple NMachines (e.g apps) across multiple Kubernetes clusters. 
For a given NMachine, the client client populates its UI by making calls to the 
corresponding [KAMA server](#kama-server).

#### KAMA Server

In a word, the KAMA Server is the API that serves the logic that the publisher wrote to 
[digitize operational knowledge](#digitizing-operational-knowledge) of their system. It is 
the most important component.
Read the full [KAMA Page](/concepts/kama-concept.md)

#### KTEA Server

A KTEA server essentially serves a manifest templating tool (like Helm) over HTTP/JSON. The
KAMA talks to it whenever it needs to generate a new manifest, e.g because a variable has changed.
Read the full [KTEA Page](/concepts/ktea-concept.md)

#### User Kubernetes Cluster

The cluster where the user wants the publisher's application to run. NMachine is entirely
agnostic to the cluster's properties. Compatibility issues are the publisher's responsibility
to flag using preflight-checks at installation time.

#### NMachine Cloud API

The API at `api.nmachine.io` does two things: 1) give metadata about individual NMachines,
and 2) injest telemetry created by the KAMA. NMachines can be made to run air-gapped.
