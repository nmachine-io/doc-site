---
sidebar_position: 0
sidebar_label: Overview
---

# System Overview

## What is NMachine?

As a quick and dirty mental placeholder, you can think of NMachine as the intersection of:
- A Helm & Puppet wrapper
- A Platform as Code SDK
- A Kubernetes App-store
- An application-specific Heroku

**In wordier terms**, NMachine gives software publishers an SDK to build an application-specific platform 
for a Kubernetes application, where operational knowledge is digitized,
so that unfamiliar users may install/operate/troubleshoot/update 
said application with confidence at the production-level on their own infrastructure. Publishers can 
then leverage rich distribution features from our cloud-based dashboard, such as
telemetry access, release channels, payments/licenses, and rule-based last-mile configurations. 


## What is _an_ NMachine?

Anytime we refer to **_<u>an</u>_** NMachine, we mean a running instance 
of the application-specific platform. This the _an_ in [an.nmachine.io](https://an.nmachine.io).
Akin to VMs being VMWare instances.

## Digitizing Operational Knowledge

What can a publisher program their NMachine to 
do that makes life better for unfamiliar users who need to run their application? 
The best way to build an intuition for this is to watch the
 demo [Youtube video](https://www.youtube.com/watch?v=p7dqmROKGIo).  

### 1. Confidence through Health Checks

Operators build confidence about the state of an application
with liveness probes and tools ([Polaris](https://github.com/FairwindsOps/polaris), etc..), 
**but what really matters** is _how well they know_ the app. NMachine makes it 
excessively easy for publishers to proliferate health checks throughout their platforms: 
global checks, resource and variable-specific checks, preflight checks, etc...

### 2. Manifest Variable Management 

Manifest variables are effectively the control knobs for modern chart-based 
Kubernetes applications and are therefore critical to set right. 
The KAMA SDK lets publishers associate their app's manifest variables with validations, 
dependency analysis, health checks, backups, and rich metadata.

### 3. Controlled Operations

In practice, operating a Kubernetes app requires the 
operator to do more than `helm upgrade`: they often must CRUD resources, 
run shell commands, test things manually, etc... 
NMachines have a unified Action/Operation system that lets publishers create 
rich, contextual, interactive actions that users can execute with confidence.

### 4. Troubleshooting

Prior knowledge is obviously instrumental to fixing problems. A Kubernetes developer
is often aware of the bad states the system can end up in; it's then a question of doing
the right diagnosis and not botching the remediation. That's why NMachine
lets the publisher create remediation options for failed health checks or actions.

### 5. Logical Organization

In an application with 50+ Kubernetes resources, it can be difficult for an unfamilar 
operator to know what to focus on. NMachine gives publishers complete freedom to define
dashboards with any kind of data (Kubernetes or not) that makes the most sense for their 
unique application.
 

## Components

![](/img/concepts/overview-system.jpg)

### NMachine Client

This is what the end-user (i.e the application operator) sees. It is the dashboard
that lets end-users install/operate apps provided by publishers. One client can 
show multiple NMachines (e.g apps) across multiple Kubernetes clusters. 
For a given NMachine, the client client populates its UI by making calls to the 
corresponding [KAMA server](#kama-server).

### KAMA Server

In a word, the KAMA Server is the API that serves the logic that the publisher wrote to 
[digitize operational knowledge](#digitizing-operational-knowledge) of their system. It is 
the most important component.
Read the full [KAMA Page](/concepts/kama-concept.md)

### KTEA Server

A KTEA server essentially serves a manifest templating tool (like Helm) over HTTP/JSON. The
KAMA talks to it whenever it needs to generate a new manifest, e.g because a variable has changed.
Read the full [KTEA Page](/concepts/ktea-concept.md)

### User Kubernetes Cluster

The cluster where the user wants the publisher's application to run. NMachine is entirely
agnostic to the cluster's properties. Compatibility issues are the publisher's responsibility
to flag using preflight-checks at installation time.

### NMachine Cloud API

The API at `api.nmachine.io` does two things: 1) give metadata about individual NMachines,
and 2) injest telemetry created by the KAMA. NMachines can be made to run air-gapped.
