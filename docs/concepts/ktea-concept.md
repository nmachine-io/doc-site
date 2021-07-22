---
sidebar_position: 1
sidebar_label: KTEA
---

# Kubernetes Templating Engine API (KTEA)

Helm and Kustomize are examples of popular templating engines for Kubernetes manifests. 
NMachine makes two fundamental assumptions about modern Kubernetes apps:

1. Their final manifests come from templating engines (as opposed to being static)
2. Templating engines output YAML based on user-defined variables consumed at runtime


## KTEA is a Simple Templating Protocol

If we wanted to define an HTTP-based API protocol based on the previous assumptions,
it would look like this:

- **Do template** `POST /template`
    - **Accept**: YAML/JSON dictionary of user-variables
    - **Output**: List of corresponding YAML/JSON dictionaries (k8s resources)
- **Get default values**: `GET /values`
    - **Output**: YAML/JSON dictionary of all default values (e.g `values.yaml`)

That is all a KTEA is - an HTTP API protocol. Despite being simple, this protocol
gives NMachine the flexibility to **support any templating engine**. Despite
Helm's popularity, it's not for everybody; moreover individual preference around
templating engines should be a bottleneck to portability. Finally, with HTTP-based
templating, the end-user does not need to own the templating software, which is good.

## KTEAs in Practice

When the NMachine client installs an application, it writes a `ktea` entry in the 
master `ConfigMap` (see [Concepts](/concepts/master-configmap.md)) with three key-value assignments:

| Key       | Type                                               | Note                                                                                                                                                                                                                                                         |
|-----------|----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`    | `server` \| `managed_server` \| `local_executable` | <ul> <li>`server`: hit the endpoint given by `uri` as-is</li> <li>`managed_server`: special contextual request to `api.nmachine.com`, ignore `uri`</li> <li>`local_executable`: assume `uri` is a script name; execute in shell, result := STDOUT</li> </ul> |
| `uri`     | string or nil                                      | URL or path depending on `type`, e.g or `https://foo.bar/my-ktea`  `~/workspace/my-script.sh`                                                                                                                                                               |
| `version` | string                                             | semantic version format e.g "1.93.4"                                                                                                                                                                                                                         |

**In Production**, the client populates the `ktea` entry by reading the application definition
that you - the publisher - provided in the [Publisher Dashboard](https://www.publish.nmachine.io). 
Note that `type=local_executable` is <u>not available in production</u>.

**In development**, the the values are read from the Application Setup wizard 
you - the publisher - go through.


# Accessing the KTEA in the SDK