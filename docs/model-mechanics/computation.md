---
sidebar_position: 3
sidebar_label: Computation
---

# Computation inside Descriptors 

Your descriptors can, and often must, declare attributes whose values are
evaluated at runtime. For example, a health check modelled as a 
`Predicate`, will need to read some current information about
the system, e.g get properties about a Node, a pod, etc...

To declare a runtime-resolvable attribute value, you need to reference a 
**[Supplier](/prebuilt-models/supplier-overview)**, which carries out the computation 
and returns the result. This page covers how to do this referencing.









## Referencing Suppliers

A Supplier is resolved when its parent model attempts to **read the attribute referencing it**.
There are **two ways** to reference a `Supplier`, each very similar to what we've seen in 
**[Associations](/model-mechanics/inflating-models)**.

### Inline Reference

You declare a `Supplier` inline the exact same way you would a normal child descriptor:
```yaml
kind: Model
id: "parent"
give_me_foo:
  kind: Supplier
  source: "Foo"
```

Reading `give_me_foo` give us the inline descriptor's result: 

```python title="$ python main.py console"
>>> parent = Model.inflate("parent")
>>> parent.get_attr("give_me_foo")
Foo
```






### `get::` Reference

The reference form should feel reminiscent of expressing 
[associations](/models/models-overview) with `id::` and `kind::`. All 
we do is prepend `get::` to our reference expression, so `get::id::` and `get::kind::`. 

```yaml
kind: Supplier
id: "foo-supplier"
source: "Foo"
---
kind: Model
id: "parent"
give_me_foo: "get::id::foo-supplier"
```




## The `get::` Shorthands: `->`, `=>`, `>>` 

For convenience, you can follow up your `get::<supplier-ref>` expressions with 
one of `->`, `=>`, `>>`, each of which is an alias for 
**[a particular `serializer`](/prebuilt-models/suppliers/supplier-overview#transforming-the-original-output)** 
(JQ, native, and model). After the alias, provide a string which is your `output` expression. 
The general form is:

```
get::<supplier-ref>::<serializer-alias><output-expr>
``` 

Examples for each serializer type follow:

### `->` for `jq`
```yaml {3-4}
kind: Model
id: "parent"
with_id: "get::id::sdk.supplier.config.user_vars->. frontend.service.type"
with_kind: "get::kind::MergedVariablesSupplier->. frontend.service.type"
```


### `=>` for `native`

```yaml {3}
kind: Model
id: "parent"
external_ip: "get::id::first-service-supplier=>external_ip"
---
kind: ResourcesSupplier
id: "first-service-supplier"
res_kind: "Service"
many: false
serializer: "native"
```

Notice in this example that we're actually chaining two serializers. Our 
top-level Supplier, `"first-service-supplier"`, returns a native Python object (`KatSvc`)
that we access by wrapping with another Supplier by means of `=>`. 

### `>>` for `model`

```yaml {9}
kind: Supplier
id: "the-helper"
title: "Helper"
---
kind: Model
id: parent
title: "Me and ${get::&id::the-helper>>title}"  
```

Notice we use `get::&id`instead of just `get::id` to prevent the referenced supplier 
(`the-helper`) from resolving.


## `get::self` and `get::parent`

Two expressions you will encounter ubiquitously throughout the docs are `get::self<...>`
and `get::parent<...>`. They create a `SelfSupplier` and `ParentSupplier`, which are suppliers
that output the model that resolved them (and their parent for `parent`).

A descriptor can use these to **operate on its own attributes**:

```yaml
kind: Model
id: "parent"
title: "Parent"
info: "I am ${get::self>>title}"
child:
  kind: Model
  id: "child"
  title: "I am ${get::parent>>title}'s child"
``` 

Notice the use of `>>`. If you've read the syntactic sugar section, you should
know that `>>` is the alias for the `model` serializer. This makes sense because
`self` and `parent` return models instances.
