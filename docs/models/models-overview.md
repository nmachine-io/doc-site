---
sidebar_position: 0
sidebar_label: Overview
---

# Models Overview

Models the are the entities that make up the KAMA's world view. The SDK provides
a multitude of models, which you, as a publisher, create instances of 
using YAML or Python, giving your NMachine its behavior. Models are conceptually quite similar 
to Resources in Kubernetes. 

Example that shows the mapping between models and final output:

<p align="center">
  <img src='/img/models/operations/breakdown.png' width="100%" />
</p>


## `Model` is a Python Class

Before jumping into the YAML, it helps to understand how models work at a very basic level.
[`Model`](/nope) is a class in the KAMA SDK. A `Model` instance is constructed with
a key-value configuration bundle that we call a **descriptor**. 
For example, this is how the KAMA SDK might inflate a `Predicate` - a subclass of Model: 

```python
predicate = Predicate.inflate({
  'title': "is 1 greater than 0?"
  'challenge': 1,
  'check_against': 0,
  'operator': "greater-than"
})
print(f"Inflated from {predicate.config}")
```

Without going into detail, the `Predicate` class **will expect certain key-value pairs** 
to be present so it can read them for computations. The descriptor can be 
gotten by calling `config` property on a Model instance.

In practice, you'll probably write your descriptors in YAML as explained in the 
[Registering YAML Model Descriptors](/tutorials/registering-model-descriptors) tutorial.


## Universal Attributes

`Model`, and therefore all of its subclasses, can read the following attributes from its descriptor: 
Depending on the context,
 
{@import ./../../partials/common-model-attrs.md}

### `kind`/`id` are usually Required 

Whether or not an attribute is required is context-dependent, as we will see thoughout this document.
A constant, however is that **all top-level descriptors**, require `kind` and `id` to be defined.
A top level descriptor is any descriptor is that is **<u>not</u> defined inline**, 
as [explained below](#inline-definition).

## Model to Model Referencing 

When writing a model descriptor, you will very often need to reference
related models. The `DeleteResourcesAction` model, for instance, expects
its `selectors` attribute to resolve to a **list of `ResourceSelector`**.

There _four ways to achieve this_:

### Method 1: Inline Definition

The most straightforward but least scalable approach is just to
declare child models inline:

```yaml models/inline-definition-demo.yaml
kind: DeleteResourcesAction
id: parent
selectors:
  - kind: ResourceSelector
    id: child-one
    res_kind: ConfigMap
  - kind: ResourceSelector
    id: child-two
    res_kind: Secret
``` 

**NB One**: `child-one` and `child-two` defined inline and are therefore not top-level. 
This means that when the KAMA queries `ResourceSelector` outside of the scope above,
**it will not see `child-one` and `child-two`.** 

**NB Two**: `DeleteResourcesAction` knows it's looking for `ResourceSelector`s, so any 
inline definitions can technically omit their `kind`, although this can hurt readability
in some cases. So for example, the following snippet is equivalent to the original:

```yaml models/inline-definition-demo.yaml
kind: DeleteResourcesAction
id: parent
selectors:
  - id: child-one
    res_kind: ConfigMap
  - id: child-two
    res_kind: Secret
``` 


### Method 2: Id References with `id::`

The second technique is to refer to another top-level model by its ID
using the special syntax `id::<model-id>`, e.g `id::child-one` below. It does
not matter whether the descriptor of the being referenced comes before or
after in the YAML.  

```yaml models/inline-definition-demo.yaml
kind: ResourceSelector
id: child-one
res_kind: ConfigMap
---

kind: ResourceSelector
id: child-two
res_kind: Secret
---

kind: DeleteResourcesAction
id: parent
selectors
  - id::child-one
  - id::child-two
``` 

### Method 3: Singleton References with `kind::`

Some models are conceptually singletons and never need to be customized
by descriptors. For these, with can just refer to them by class name with 
the `kind::<class-name>` e.g `kind::TruePredicate` as below.

```yaml
kind: ManifestVariable
id: always-healthy
info: No practical use; demo only
health_predicates:
  - kind::TruePredicate
```

### Method 4: Attribute Query

By passing a Dict instead of a list,  
