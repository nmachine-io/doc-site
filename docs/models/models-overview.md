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

When writing a model descriptor, you will often need to reference
related models. The `DeleteResourcesAction` model, for instance, expects
its `selectors` attribute to resolve to a **list of `ResourceSelector`**.

When writing a descriptor, you have _four ways_ to reference another model:

### Method 1: Inline Definition

The most straightforward but least scalable approach is just to
declare child models inline:

```yaml models/inline-definition-demo.yaml
kind: DeleteResourcesAction
id: "parent"
selectors:
  - kind: ResourceSelector
    id: "child-one"
    res_kind: ConfigMap
  - kind: ResourceSelector
    id: "child-two"
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
id: "parent"
selectors:
  - id: "child-one"
    res_kind: ConfigMap
  - id: "child-two"
    res_kind: Secret
``` 


### Method 2: Id References with `id::`

The second technique is to refer to another top-level model by its ID
using the special syntax `id::<model-id>`, e.g `id::child-one` below. It does
not matter whether the descriptor of the being referenced comes before or
after in the YAML.  

```yaml models/inline-definition-demo.yaml
kind: ResourceSelector
id: "child-one"
res_kind: ConfigMap
---

kind: ResourceSelector
id: "child-two"
res_kind: Secret
---

kind: DeleteResourcesAction
id: "parent"
selectors
  - "id::child-one"
  - "id::child-two"
``` 

### Method 3: Singleton References with `kind::`

Some models are conceptually singletons and never need to be customized
by descriptors. For these, with can just refer to them by class name with 
the `kind::<class-name>` e.g `kind::TruePredicate` as below.

```yaml
kind: DeleteResourcesAction
id: parent
selectors:
  - kind::UnschedulablePodsSelector
```

### Method 4: Attribute Query

By passing a dict instead of a list, your value will be 
[Attribute Query](/tutorials/attribute-query-tutorial), which is very
much like a [Label Selector](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) 
but for Models. For example:

```
kind: ActionsPanelAdapter
id: parent
operations:
  id: operation.backend.*
  labels:
    concerning: database
```

Here, `operations` is a dict with an attribute query.


## Special Attribute Resolution

The most complicated but most powerful feature in the `Model` is its attribute
resolution system. You will likely make extensive use of attribute resolution even
if your NMachine is simple.

**Normal attribute resolution** is when what you see is what you get. 
Consider a descriptor like the following:

```yaml
kind: Model
id: "normal-attr-demo"
title: "I'm just a literal"
```  

We can easily imagine a `get_title()` instance method on `Model` that returns the value as-is
with `self.config.get('title')`:

```python
print(Model.inflate("normal-attr-demo").get_title())
# => "I'm just a literal"
```

In contrast, **_special_ attribute resolution** is when what you see is **not** what you get. 
The next sections go over each case of this. 

### Parent Lookback

If you have a deep hierarchy of models, 
it can be onerous to copy an attribute at each level of depth. Instead if a child could not find
an attribute it expected to be in its own descriptor, it can automatically get it from its parent.
Consider the following: 
```yaml
kind: MultiAction
id: parent
values:
  "frontend.replicas": 2
sub_actions:
  - kind: TemplateManifestAction
  - kind: PatchManifestVarsAction
```

Here, neither `TemplateManifestAction` or `PatchManifestVarsAction`
define `values`, but both have access to it because their parent defines it.

> **This behavior is not universal** across all Model subclasses and attributes. 
As you progress through each Model's documentation, the attributes table will tell
you whether a particular attribute supports lookback or not.

### Self Referencing with `get::self>>`

A descriptor can read its own configuration with the `get::self<attribute-key>` syntax,
for example:

```yaml
kind: Model
original: x
copied: get::self>>original
```

#### Use Case 1: Readability and DRYness

You can use this technique to create what are effectively instance variables that
can be re-used. As a result, you can break long expressions into shorter ones:

```yaml
kind: FruitBowl
apple: "An apple is an edible fruit produced by an apple tree (Malus domestica)"
cherry: "A cherry is the fruit of many plants of the genus Prunus"
contents: ["get::self>>apple", "get::self>>cherry"]
best_fruit: "get::self>>cherry"
```

#### Use Case 2: Delegation  

Self-referencing lets the KAMA SDK treat models almost like functions that
can be invoked with parameters. For example, when the user sets a manifest
variable value from the UI and it's time for the KAMA to validate it, 
it can inflate your `ManifestVariable` with an attribute called `inputs`
(or anything else) that contains the user input. 

```yaml
kind: ManifestVariable
id: "prometheus.url"
validators:
  - kind: Predicate
    operator: "truthiness"
    challenge: "get::self>>inputs->.prometheus.url"
```

Cases when the SDK patches models at inflation time will always be documented.

### Supplier Values with `get::`

We must now introduce a special Model subclass: the **[`Supplier`](/models/supplier/supplier-overview.md)**. 
A `Supplier`'s role is to return something. When a supplier is referenced using either technique 
discussed in [Model to Model Referencing](model-to-model-referencing), it can be made to resolve
to the result of whatever computation it performed. 

When referencing using `id::` or `kind::`, you can enable this behavior by prefixing the entire
expression with `get::`. For instance:

```yaml
kind: RandomStringSupplier
id: my-supplier
length: 32
symbols: ["letters", "numbers"]

---

kind: ManifestVariable
id: "database.password"
default_value: "get::id::my-supplier"
```  

### Helper Values with `get::&`



### Templated Strings with `${}`

### List Splattering with `...`





