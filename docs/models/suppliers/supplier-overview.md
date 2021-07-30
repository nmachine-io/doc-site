---
sidebar_position: 0
sidebar_label: Overview
---

# Suppliers

A `Supplier` is a special `Model` that performs a computation and 
_supplies_ the result its parent model. They are a bit like YAML-invokable functions. 
The `SumSupplier` is a straightforward example:

```yaml title="descriptors/demo.yaml"
kind: Model
id: "parent"
supply_me_six: 
  kind: SumSupplier
  source: [1, 2, 3]
``` 

Running it:
```python title="python3 main.py -m shell"
caller = Model.inflate("parent")
caller.get_attr("supply_me_six")
# => 6
```
 

To learn more about the semantics of value resolution, read the 
[Models Overview](/models/models-overview).
 
 
## Attributes for all Supplier Subclasses

{@import ./../../../partials/supplier-attrs.md} 





## Pre-Processing the Output

Before returning a final value, a `Supplier` gives you a chance 
 to apply a transformation to the originally computed result. The transformation
behaves according to the `serializer` and `output` attributes you define.

### The `jq` Serializer

If `serializer` is set to `jq` **and** `output` is not nullish, the final
output is computed by treating `output` as a [`jq`](https://stedolan.github.io/jq/manual/) 
query, and running it against the original result. For this to work, **the original result 
must be castable to `JSON`**.

```yaml
kind: Supplier
id: "my-suplier"
source: 
  foo:
    bar: "baz"
output: ". foo"
```

Running it:

```python title="$ python3 main.py -m shell"
supplier = Supplier.inflate("my-supplier")
supplier.resolve()
# => {'bar': 'baz'}
``` 

Note that you can use real `jq` functions like `". | length"`.

#### Handling Lists

Setting `many` to `true` will instruct the `jq` serializer to treat
the input as a list:

```yaml
kind: Supplier
id: "my-supplier"
many: true
source:
  - foo:
      bar: baz
output: ". [0].foo"
```
Running it in the KAMA shell:

```python title="$ python3 main.py -m shell"
supplier = Supplier.inflate("my-supplier")
print(supplier.resolve())
# => [{'bar': 'baz'}]
``` 

### The `native` Serializer

The second currently supported serializer is
the `native` serializer. You should use this serializer if the original
return value is a Python object whose properties/methods you need to access.

:::danger
This technique involves reflexive method invokation, which is a serious security risk.
This serializer will likely be deprecated in the near future. Favor jq whenever possible. 
::: 

The most common reason to use the `native` serializer is to talk to `KatRes`
objects. The following example demonstrates how the `native` serializer can:
1. Output a Dict with an entirely new shape
1. Access methods/attributes in Python objects (`KatSvc#external_ip` and `KatSvc#internal_ip`) 

```yaml {8-10}
kind: ResourcesSupplier
id: "my-supplier"
serializer: "native"
many: false
selector: 
  res_kind: Service
  name: "frontend"
output: 
  public_address: "external_ip"
  private_address: "internal_ip"
```

```python title="$ python3 main.py -m shell"
supplier = Supplier.inflate("my-supplier")
print(supplier.resolve())
# => {'public_address': None, 'private_address': '10.40.7.144'}
```



### The `model` Serializer

Finally, the `model` serializer treats `output` as an attribute key
to be used on the computed result, which must itself be a `Model`.

```yaml
kind: Model
id: "the-helper"
title: "Helper"

---

kind: Model
id: parent
the_helpers_title:
  kind: Supplier
  source: load::id::the-helper
  serializer: model
  output: title  
```



## Syntactic Sugar: `->`, `=>`, and `>>` 

When you start nesting suppliers, the YAML can quickly start to grow large. Instead, 
we can combine the `->`/`=>`/`>>`  syntax with the 
[`get::` syntax](/models/models-overview#supplier-values-with-get) to invoke a Supplier and 
reformat its output using an expression instead of writing a descriptor.

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
res_kind: Service
many: false
serializer: native
```

Notice in this example that we're actually chaining two serializers. Our 
top-level Supplier, `"first-service-supplier"`, returns a native Python object (`KatSvc`)
that we access by wrapping with another Supplier by means of `=>`. 
The equivalent setup **without using `=>`** would be:

```yaml {4-6}
kind: Model
id: "parent"
external_ip: 
  kind: Supplier
  serializer: native
  output: external_ip
  source:
    kind: ResourcesSupplier
    id: "first-service-supplier"
    res_kind: Service
    many: false
    serializer: native
``` 


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


## Special case: Provider

## Helper

The `Supplier` base class has a `resolve` method that calls the private
`_compute` method in the subclass. 

are essentially a construct that makes 

