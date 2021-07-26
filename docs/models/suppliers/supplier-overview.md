---
sidebar_position: 0
sidebar_label: Suppliers
---

# Suppliers

A `Supplier` is a `Model` subclass whose role is to perform a computation and 
_supply_ the result to other models. Practically speaking, Suppliers let you 
implement basic logic in YAML without constantly switching to Python. They are a bit like
YAML-invokable functions.

As a simple example, the `RandomStringSupplier` exists so that disparate models
that might need to random strings don't each need 

```yaml
kind: GenericVariable
id: "inline_secrets.database_password"
default_value: 
  kind: RandomStringSupplier
  length: 16
``` 
 
## Universal Attributes

{@import ./../../../partials/supplier-attrs.md} 


## Pre-Processing the Output

Each `Supplier` subclass returns something different, but all are
capable of customizing their final output based on the 
serializer/output system. 

### The `jq` Serializer

If `serializer` is `jq` and `output` is not null, then the final
output is computed by running `output` as a [`jq`](https://stedolan.github.io/jq/manual/)
query against the original result. For this to work, the original result 
must be cast to the `JSON` schema.

```yaml
kind: Supplier
id: my-suplier
source:
  foo:
    bar: baz
output: . foo
```

Running it in the KAMA shell:

```python title="$ python3 main.py -m shell"
supplier = Supplier.inflate("my-supplier")
print(supplier.resolve())
# => {'bar': 'baz'}
``` 

Note that you can use real `jq` functions like `". | length"`.

#### Handling Lists

Setting `many` to `true` will instruct the `jq` serializer to treat
the input as a list:

```yaml
kind: Supplier
id: my-supplier
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

The second currently supported way to manipulate the original output is
the `native` serializer. You should use this serializer if the original
return value is a Python object whose properties/methods you need to access.

The most common reason to use the `native` serializer is to talk to `KatRes`
objects. The following example demonstrates how the `native` serializer can:
1. Output a Dict with an entirely new shape
1. Access methods/attributes in Python objects (`KatSvc#external_ip` and `KatSvc#internal_ip`) 

```yaml
kind: ResourcesSupplier
id: my-supplier
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

By changing the descriptor a little bit, we can get a simple list of
the strings corresponding to each `internal_ip`:

```yaml
kind: ResourcesSupplier
id: my-supplier
serializer: "native"
many: true
selector: 
  res_kind: Service
  name: "frontend"
output: "internal_ip" 
```

```python title="$ python3 main.py -m shell"
supplier = Supplier.inflate("my-supplier")
print(supplier.resolve())
# => ['10.40.7.144']
```
 

> **There are obvious security risks** with this method. Whenever possible,
use the `jq` serializer instead as it is much more powerful in most cases. 

## Syntactic Sugar: `->` and `=>` 

When you start nesting suppliers, the YAML tends to get big. Instead, 
we can combine the `->` and `=>` syntax with the 
[`get::` syntax](/models/models-overview#supplier-values-with-get) to invoke a Supplier and 
reformat its output using an expression instead of writing a descriptor.

### Using `->` for a `jq` Serializer 



```yaml
kind: Model
``` 

## Special case: Provider

## Helper

The `Supplier` base class has a `resolve` method that calls the private
`_compute` method in the subclass. 

are essentially a construct that makes 
