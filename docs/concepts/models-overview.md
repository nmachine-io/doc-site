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
[manifest variables](/pre-built-models/variables/manifest-variables),
[health checks](/pre-built-models/predicates/predicates-base), 
[operations](/pre-built-models/operations/operations), 
and general [actions](/pre-built-models/actions/action-base). 

There are **two distinct model-related topics** to learn:
**[Models Mechanics](/model-mechanics/overview)** and 
**[Prebuilt Models](/pre-built-models/overview)**. This page serves as 
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
concerns [operations](/pre-built-models/operations/operations), but applies to
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

Again, like Resources in Kubernetes, Models are just classes in the KAMA SDK, organized 
in a straightforward OOP hierarchy. But unlike in Kubernetes, you should 
get comfortable with the idea that your model descriptors get inflated into
**not-so-scary Python objects** that you can access and debug in a matter of seconds.
This gives us a **tremendous developer productivity advantage** of CRDs/Operators in solutions like
Replicated.


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

The biggest difference between descriptors in KAMA and Kubernetes is templating.
In Kubernetes, once you submit a resource descriptor with `kubectl apply`,
its attributes are forever taken at face value. You can't say 
things like `replicas: <number_of_nodes + 1>`.

KAMA is different. Your descriptors get inflated at runtime to fulfill 
specific user-initiated requests; **they are expected to use information
in the current context to modulate their behavior**. 

The semantics of dynamic value resolution represent the steepest learning curve
in KAMA development, but provide you with tremendous expressive power.

<!-- :::info YAML Minimalist?
If you don't like the idea of computation in YAML, you 
can go the **[Python-maximalist](/nope)** route instead.
:::
 -->

### Performing the Computations: `Supplier`

A `Supplier` is a special `Model` subclass that gets treated 
**as an invokable function** when read in a descriptor. It is important you
read through the **[Supplier Documentation](/pre-built-models/suppliers/supplier-overview)** 
over the course of your KAMA development journey. 

For now, we can build up a quick intuition with a (nearly) real world example - 
a `FormatPredicate` getting a value from a `MergedVariablesSupplier`:

```yaml {6,7}
kind: FormatPredicate
id: predicate.cert_email_defined_if_cert_enabled
title: Valid email address associated with Certificates Manager?
check_against: email
challenge:
  kind: MergedVariablesSupplier
  output: ".cert_manager.email"
```

Again, this topic requires some investment; make sure put the 
**[Supplier Documentation](/suppliers/supplier-overview)** on your reading list.



## The Attribute Lookup Pipeline

We just saw that attribute _values_ can be dynamic. In addition to this, 
`Model` also has a language of special clauses and escape codes that let
you do things like caching and self-referential attribute redefinition. 
This is called the **[Attribute Lookup Pipeline](/model-mechanics/inflating-models-tutorial)**

This is another topic that requires one's full attention, so make sure to read
the full guide. For now, the snippet below should help you build an intuition;
it demonstrates how an expensive `Supplier` is marked for caching by being
inside the `cache` clause.




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


