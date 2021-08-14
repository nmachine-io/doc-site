---
sidebar_position: 0
sidebar_label: Overview
---

# Models Overview

Models the are the entities that make up the KAMA's world view, representing various
objects and processes in the Kubernetes/DevOps universe.
 The SDK provides
a multitude of models, which you, as a publisher, create instances of 
using descriptors, giving your NMachine its behavior. 

Models are a large topic; this page introduces the main concepts and links
to more in depth material when necessary. The majority of the material
relates to the special tricks Models use to.

The picture below should help you build an intuition
for how the models you write map onto the NMachine your users see.

<p align="center">
  <img src='/img/models/operations/breakdown.png' width="100%" />
</p>


## You Write Model Descriptors in YAML

You declare instances of Models the same way you declare Kubernetes resources: 
by writing descriptors, usually in YAML. How you register models is covered  in the 
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

The docs typically show model descriptors in YAML for readability purposes,
but you can use Python to DRY up as your KAMA grows, as covered in the
[YAML vs Python Guide](/tutorials/yaml-vs-python).



## Debugging Model Instances in Python  

Again, like Resources in Kubernetes, Models are just classes in the KAMA SDK, organized 
in a straightforward OOP hierarchy. But unlike in Kubernetes, you should 
get comfortable with the idea that your model descriptors get inflated into
**not-so-scary Python objects** that you can access and debug in a matter of seconds.
This gives us a tremendous developer productivity advantage of CRDs/Operators in solutions like
Replicated.


```python title="$ python main.py console"
model = Model.inflate({'id': "my-first-model"})
model.get_id()
# => my-first-model
```

How `inflate` works in the example above is the topic of 
the **[Model Inflation Tutorial](/tutorials/inflating-models-tutorial)**. 



## Finding Prebuilt Models and Descriptors

The KAMA SDK ships with about 30 models that span across the Kubernetes/DevOps concept space.
Throughout your KAMA development journey (that starts [here](/walkthrough/getting-started)), 
you will need to look up several pre-built in order to configure them properly. Refer to the
table below for quick access. 



### Prebuilt Models

### Prebuilt Descriptors 


## Inheriting from Other Descriptors

Of the special Model mechanisms covered on this page, descriptor inheritance 
is the simplest. If you have two descriptors `d1` and `d2`, if `d2` declares `inherit: d1`,
then **`d1` will get deep merged into `d2` when loaded**. Illustration:

```yaml
kind: Model
id: d1
title: "D1 title"
foo: "foo"
---
kind: Model
id: d2
inherit: d1
info: "D2 info"
foo: "bar"
```

Testing out the merging rules:

```python title="$ python main.py console"
d2 = Model.inflate("d2")
(d2.get_title(), d2.get_info(), d2.get_attr("foo"))
("D1 title", "D2 info", "bar")
# => 
```


## Expressing Model Associations in Descriptors 

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





## Supplying Dynamic Attribute Values in Descriptors

The biggest difference between descriptors in KAMA and Kubernetes is templating.
Kubernetes is purely declarative: once you submit a resource descriptor with `kubectl apply`,
its attributes are forever taken at face value. You can't say 
things like `replicas: <number_of_nodes + 1>`.

KAMA is different. Your descriptors get inflated at runtime to fulfill 
specific user-initiated requests; **they are expected to use information
in the current context to modulate their behavior**. 

The semantics of dynamic value resolution represent the steepest learning curve
in KAMA development, but provide you with the tremendous expressive power necessary
to efficiently model even the most complex Kubernetes operational knowledge. 

:::info YAML Minimalist?
If you don't like the idea of computation in YAML, you 
can go the **[Python-maximalist](/nope)** route instead.
:::


### The Functional Model: `Supplier`

A `Supplier` is a special `Model` subclass that gets treated 
**as an invokable function** when encountered in descriptor tree. It is important you
read through the **[Supplier Documentation](/models/suppliers/supplier-overview)** 
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
**[Supplier Documentation](/models/suppliers/supplier-overview)** on your reading list.



## Caching and Overriding Attributes 

We just saw that attribute _values_ can be dynamic. In addition to this, 
we can can also nest attributes in special places for special purposes, namely
caching and redefining inherited attributes. 

We only introduce the concept here; for the complete description, read the 
**[Attribute Lookup Pipeline Guide]**.

To build up an intution, consider a hypothetical example for the caching case, 
where a Predicate needs to compute a pod count only once but needs to use 
it twice: 

```yaml
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


