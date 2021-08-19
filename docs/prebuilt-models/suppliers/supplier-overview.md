---
sidebar_position: 0
sidebar_label: Overview
---

# Suppliers Overview

A `Supplier` is a special `Model` that performs a computation and 
_supplies_ the result to its parent model, when the former decides to resolve it. 
You can think of them as YAML-invokable functions. The `SumSupplier` shows this intuitively:

```yaml title="descriptors/demo.yaml" {4,5}
kind: Model 
id: "parent"
give_me_five: 
  kind: SumSupplier
  source: [2, 3]
``` 
 

## Prebuilt Supplier Subclasses

The SDK ships with many prebuilt `Supplier` subclasses and descriptors. As you go through the 
[A to Z Walkthrough](/walkthrough/getting-started.md), you will need to read their 
docs to know what their inputs and outputs are. Use table below as a handy reference: 


## Universal Supplier Attributes

All subclasses of `Supplier` support the following attributes.

{@import ./../../../partials/supplier-attrs.md} 


## Transforming the Original Output

Before returning a final resolved value, a `Supplier` gives you a chance 
 to transform to the originally computed result. This is powerful technique you
 will use a lot throughout your KAMA. 

The `serializer` and `output` attributes define the transformation.
 The `serializer` specifies which kind of transformation should be applied, 
 and the `output` is the transformer-specific expression/config transform description. 

### The `identity`/`None` Serializer

Performs no transformation at all, leaving the output unchanged. This is obviously the
default.

### The `jq` Serializer

When you use a `jq` serializer, the value of `output` is treated as a 
[`jq query`](https://stedolan.github.io/jq/manual/) to be run against 
the originally computed Supplier result.

```yaml {7}
kind: Supplier
id: "my-suplier"
source: 
  foo:
    bar: "baz"
serializer: "jq"
output: ". foo"
```

Running it:

```python title="$ python main.py console"
supplier = Supplier.inflate("my-supplier")
supplier.resolve()
# => {'bar': 'baz'}
``` 

Note that you can use any `jq` expression, e.g `". | length"`.

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

```python title="$ python main.py console"
supplier = Supplier.inflate("my-supplier")
print(supplier.resolve())
# => [{'bar': 'baz'}]
``` 

:::caution jq needs JSON-serializable data
The original result must be castable to `JSON`, e.g 
`json.dumps(original_result)` must succeed.
:::

### The `model` Serializer

The `model` serializer treats `output` as an attribute key
to be used on the computed result, which must itself be a `Model` instance. 
For example, `parent` can get its `child`'s title at runtime: 

```yaml {5-7}
kind: Model
id: "parent"
my_childs_title:
  kind: Supplier
  source: "load::Model::child"
  serializer: "model"
  output: "title"
---
kind: Model
id: "child"
title: "Child"
```




### The `native` Serializer

You should use this serializer if the original
return value is a Python object whose properties/methods you need to access.

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
  res_kind: "Service"
  name: "frontend"
output: 
  public_address: "external_ip"
  private_address: "internal_ip"
```

```python title="$ python main.py console"
supplier = Supplier.inflate("my-supplier")
print(supplier.resolve())
# => {'public_address': None, 'private_address': '10.40.7.144'}
```

:::danger
This technique involves reflexive method invokation, which is a serious security risk.
This serializer will likely be deprecated in the near future. Favor jq whenever possible. 
::: 



