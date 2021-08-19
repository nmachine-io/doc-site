---
sidebar_position: 2
sidebar_label: Models
---




# Models Overview

Models are the fundamental building blocks in the KAMA SDK. As a developer, you
write model descriptors that represent objects in the Kubernetes operations 
domain space, which the KAMA SDK parses and turns into functionality for the end-user.

A helpful approximation would be to say that, where Kubernetes resources model the computing 
infrastructure itself (Deployments etc...), KAMA Models model
_the operation of_ Kubernetes applications, things like 
[manifest variables](/prebuiltmodels/variables/manifest-variables),
[health checks](/prebuiltmodels/predicates/predicates-base), 
[operations](/prebuiltmodels/operations/operations), 
and general [actions](/prebuiltmodels/actions/action-base). 

There are **two distinct model-related topics** to learn:
**[Models Mechanics](/model-mechanics/overview)** and 
**[Prebuilt Models](/prebuiltmodels/overview)**. This page serves as 
a launch pad; read through it to build
an intuition for the whole picture, and then dive into the sub-topic knowing
larger context they fit into. 






## The Role of Models

Models in KAMA play the same role that resources play in Kubernetes. They expose 
a simple, low-code API (YAML != code 💅) to describe well-scoped behavior that
a more complex engine, hidden to the developer, turns into useful content and action.

The SDK **[inflates](/model-mechanics/inflating-models)** your models when it needs 
to fulfil a user request. The picture below sketches out the mapping between
your models, and the finalized output rendered to the user. This image in particular
concerns [operations](/prebuiltmodels/operations/operations), but applies to
every single page in the NMachine client.

![](/img/models/operations/breakdown.png)







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







## Inflating and Associating Model Descriptors 

Many prebuilt models have **belonging relationships** with other models. These will
be specified in the that model's Attributes Table in the documentation. Notice 
that relationships are always expressed in `parent -> child` form, rather than `child <- parent`.

There are four distinct ways of writing associations in our descriptors, 
each of which are covered in depth in the **[Inflating Models Guide](/nope)**. 

To quickly build an intuition, we can take an example of a real model - `DeleteResourcesAction`. 
The **[attributes table](/nope)** tells us that the `resource_selectors` attribute 
expects a `List[ResourceSelector]`. Here are three ways (the fourth would not work here)
we can express the same `DeleteResourcesAction` with a `ResourceSelector` child. 

**Inline Embedding**

```yaml
kind: DeleteResourcesAction
id: "parent"
resource_selectors:
  - kind: ResourceSelector
    id: "child-one"
``` 

**Reference by ID**

```yaml
kind: DeleteResourcesAction
id: "parent"
resource_selectors: 
  - "id::child-one"
---
kind: ResourceSelector
id: "child-one"
``` 

**Reference by Query**

```yaml
kind: DeleteResourcesAction
resource_selectors:
  id: "child-.*"
---
kind: ResourceSelector
id: "child-one"
```







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


## The Attribute Lookup Pipeline

Models have a system of clauses and escape codes that let
give attributes special functionality, like caching and self-referencing redefinition.
This system is the **[Attribute Lookup Pipeline](/model-mechanics/inflating-models-tutorial)**.
The snippet below builds our intuition demonstrates how the `cache:`
clause marks attributes for caching:

```yaml {6-10}
kind: Predicate
id: "demo.ensure-no-pods"
challenge: get::self>>pod_replica_counts 
check_against: 0
reason: "There were unexpectedly {get::self>>pod_replica_counts} pods remaining"
cache:
  pod_replica_counts: 
    kind: ResourceSupplier
    output: "| .count"
    resource_selector: {res_kind: Pod}
```


