---
sidebar_position: 3
sidebar_label: KTEA
---

# Kubernetes Templating Engine API (KTEA)

NMachine makes two fundamental assumptions about modern Kubernetes apps:

1. Their final manifests come from templating engines like Helm (as opposed to being static)
2. Templating engines output YAML based on user-defined variables passed at invokation time


## KTEA is a Simple Templating Protocol

If we wanted to define an HTTP-based API protocol based on the previous assumptions,
it would look like this:

- **Do template** `POST /template`
    - **Accept**: YAML/JSON dictionary of user-variables
    - **Output**: List of corresponding YAML/JSON dictionaries (k8s resources)
- **Get default values**: `GET /values`
    - **Output**: YAML/JSON dictionary of all default values (e.g `values.yaml`)

That is all a KTEA is - a protocol for HTTP/JSON-based API. The protocol's simplicity
gives NMachine the flexibility to **support any templating engine**. Despite
Helm's popularity, it's not for everybody; moreover, individual preference around
templating engines should be a bottleneck to portability. Finally, remote
templating makes for one less tool/version the user needs to maintain.

## Creating your KTEA Servers

If you're coming from Helm, you can make a KTEA server for your chart in 30 seconds by 
following the [Helm to KTEA Tutorial](/tutorials/helm-to-ktea-tutorial.md). 
If you're using another templating engine, follow the 
[Any to KTEA Tutorial](/tutorials/creating-a-ktea-tutorial.md).

## Where KTEA Servers Run

Once you have a KTEA server, it needs to be available for your KAMA to consume. There
are four (three in production) ways to make a KTEA available to your KAMA. As a publisher,
you will be asked to choose when creating an application in the 
[Publisher Dashboard](https://publisher.nmachine.io) as per the image below. Note that you
can **support multiple methods** and let each end-user choose their preferred method.

![](/img/concepts/choose-ktea-type.png)

### Option 1: Managed on NMachine

If you Dockerize and `push` your KTEA server to an artifact repo on the web, you can point
[publish.nmachine.io](https://publish.nmachine.io). It will then host it at
`api.nmachine.io/ktea/$org/$ktea_id`. The benefit of this option 
(beyond "serverless"-ness) is that you can set access control rules
e.g "deny access to anybody with an expired license". You can also easily monitor
the server's health in the Publisher Dashboard UI:

![](/img/concepts/ktea-pub-dashboard.png)

### Option 2: Generic endpoint on the web

You are free to self-host your KTEA it anywhere on the web.
While conceptually the simplest option, it lacks contextual authentication/authorization 
logic you may need in production, e.g to deny access to KAMAs with expired licenses.  

### Option 3: In-Cluster Server

Assuming again that your KTEA server can run as a Docker image, you can make it so that 
the NMachine client creates a special workload in your user's cluster that runs that image. 
If your end users are running your app air-gappped, you'll want to support this strategy.    

### Development-Only: Local Executable 

Finally, during development, if you have KTEA that you can invoke via the command line,
you can simply choose that as you develop locally. 
Read more [here](#special-case-local-executable-kteas).


## How KAMAs interact with KTEAs

As a publisher building on top the of the KAMA SDK, the high level [Models API](/models/models-overview.md) 
gives you many convenient ways to talk use the KTEAs. If, however, you want to build 
a deeper understanding of the KTEA <-> KAMA mechanism, keep reading.

### Definition

When the NMachine client installs an application, it writes a `ktea` entry in the 
master `ConfigMap` (see [Concepts](/concepts/kamafile-concept.md)) with three key-value assignments:

{@import ./../../partials/ktea-dict.md}

Note that this data structure is type in the KAMA SDK called **KteaDict**.

### Invokation

The KAMA SDK ships with an abstract class called `KteaClient`. Depending on the type 
of the KTEA being invoked, the relevant `KteaClient` subclass will be instantiated
to do the actual invokation. This snippet from the base class makes this mechanism 
clear: 

```python title="kama_sdk.core.ktea.ktea_client"
class KteaClient:

  ktea_dict: KteaDict
  config_space: str

  def __init__(self, ktea_dict: KteaDict, config_space: str):
    self.ktea = ktea_dict
    self.config_space = config_space

  def load_default_values(self) -> Optional[Dict]:
    raise NotImplemented

  def load_preset(self, name: str) -> Optional[Dict]:
    raise NotImplemented

  def template_manifest(self, values: Dict) -> List[K8sResDict]:
    raise NotImplemented
```

As you might expect, these subclasses are `HttpKteaClient`, `InClusterHttpKteaClient`, and 
`LocalExecutableKteaClient`.

## Selection

How is the correct `KteaClient` subclass selected? 


# Special KTEAs

## Locally Executable KTEAs

## Virtual KTEAs 
