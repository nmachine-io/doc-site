---
sidebar_position: 2
sidebar_label: Models
---




# Models Overview

Models are the building blocks that the KAMA SDK gives you, the developer, 
to define your NMachine. They are, for all intents and purposes, very 
similar to Kuberenetes resources. 

Where Kubernetes resources model the computing infrastructure itself (Deployments etc...), KAMA Models model
_the operation of_ Kubernetes applications - things like 
**[manifest variables](/prebuiltmodels/variables/manifest-variables)**,
**[health checks](/prebuiltmodels/predicates/predicates-base)**, 
**[operations](/prebuiltmodels/operations/operations)**, 
and general **[actions](/prebuiltmodels/actions/action-base)**. 

There are **two distinct topics** you need to learn:
**[Models Mechanics](/model-mechanics/overview)** and 
**[Prebuilt Models](/prebuiltmodels/overview)**. This page only briefly introduces the main ideas; read through 
it to build an intuition for the whole picture, and then dive into the sub-topics.






## The Role of Models

As with Kubernetes resources, KAMA Models give the developer 
a simple YAML API for describing well-scoped behaviors that
a more complex engine, hidden to the developer, turns into useful data and action.

The SDK **[inflates](/model-mechanics/inflating-models)** your models when it needs 
to fulfil a user request. The picture below should help you build an intuition for the role of 
models. 

![](/img/models/operations/breakdown.png)

This image in particular
concerns **[Operations](/prebuiltmodels/operations/operations)**, but an analogous mapping 
exists for every **[Prebuilt model](/prebuilt-models/overview)**.






## Prebuilt Models and Descriptors

The KAMA SDK ships with about 50 models and 30 descriptors. Throughout your KAMA 
[development journey](/walkthrough/getting-started), you will be most prebuilt
models, as well as a handful of prebuilt descriptors.

### Prebuilt Models

### Prebuilt Descriptors 






## Writing Model Descriptors in YAML

You declare instances of Models the same way you declare Kubernetes resources: 
by writing descriptors, **[usually in YAML](/tutorials/yaml-vs-python)**. How you register models is covered  in the 
**[Startup Sequence Tutorial](/startup-sequence-tutorial#registering-your-model-descriptors)**. 
The snippet below shows a simple YAML descriptor for a common model - the `ManifestVariable`. 


```yaml title="descriptors/variables/ingress.yaml"
kind: ManifestVariable
id: "ingress.enabled"
title: "Application Ingress Toggle"
info: "If enabled, Ingress resource is provisioned [...]"
category: "id::sdk.variable-category.networking"
input: {kind: OnOffInput} 
health_predicates: ["id::predicate.ingress_enabled_resource_in_sync"]
```






## Debugging Model Instances in Python  

Models are just classes in the KAMA SDK organized in an obvious OO hierarchy. 
You should get comfortable (and delighted) with idea of playing with
the actual, final, native, inflated instances of your descriptors directly in Python
via the **[interactive console](/)**. This gives us a **tremendous developer productivity advantage** 
of CRDs/Operators in solutions like Replicated.

```python title="$ python main.py console"
model = Model.inflate({'id': "my-first-model"})
model.get_id()
# => my-first-model
```

How `inflate` works in the example above is the topic of 
the **[Model Inflation Tutorial](/model-mechanics/inflating-models-tutorial)**. 







## Computation Inside Descriptors

The Model system lets us do **[computation in our descriptors](/model-mechanics/computation)**,
which gives us something close functional programminng in YAML. This lets you write what are 
effectively callbacks in YAML, where the SDK can inflate your descriptors with input attributes, 
and you can do arbitrary computations based on those inputs. The following example shows a
simple arithmetic addition:


```yaml title="computation-intro.yaml"
kind: Model 
id: "parent"
give_me_five: 
  kind: SumSupplier
  source: [2, 3]
```

As you would expect:

```python title="$ python main.py console"
>>> inst = Model.inflate("computation-intro")
>>> inst.get_attr("give_me_five")
5.0
```






## Inflation and Association 

KAMA introduces special idioms for representing 
**[model descriptors associations and sets](/model-mechanics/inflating-models)**. 
This system of language goes beyond DRYing up code, and is considered essential if you
plan to build an NMachine going the **[YAML Maximalist](/model-mechanics/yaml-vs-python)** route (as it is recommended).

Most idioms come intuitively, but there is nevertheless some learning to do. For example:

```yaml title="different association expressions expo"
kind: DeleteResourcesAction
id: "delete-pods-creatively"
resource_selectors: 
  - "id::some-res-selector"
  - "expr::Pod:a-bad-pod"
  - "kind::MySingletonModel"
  - kind: ResourceSelector
    res_kind: "Pod"
    #...
```


## The Attribute Lookup Pipeline

Models have a system of clauses and escape codes that let
attributes take on special functionality, like caching and self-referencing redefinition.
This system is the **[Attribute Lookup Pipeline](/model-mechanics/inflating-models-tutorial)**.
The snippet below builds our intuition by showing how to cache an expensive computation:

```yaml {6-10}
kind: Predicate
id: "demo.ensure-no-pods"
challenge: "get::self>>pod_replica_counts" 
check_against: 0
reason: "There were unexpectedly {get::self>>pod_replica_counts} pods remaining"
cache:
  pod_replica_counts: 
    kind: ResourceSupplier
    output: "| .count"
    resource_selector: {res_kind: Pod}
```


