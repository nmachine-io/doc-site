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

{@import ./../../partials/supplier-attrs.md} 


## Invoking Suppliers

A Supplier is resolved when its parent model attempts to **read the attribute pointing to it**.
Either of the following conditions will make a `Model` treat an attribute from its descriptor as a resolvable 
`Supplier`:
- **Inline Form Detected**: the attribute value is a `Dict` whose `kind` is a `Supplier` or subclass thereof. 
- **Reference Form Detected**: the attribute value is a `str` that begins with `get::`.

### Writing the Inline Form

The inline form should feel reminiscent of expressing inline [associations](/models/models-overview):
```yaml
kind: Model
id: "parent"
give_me_foo:
  kind: Supplier
  id: "foo-supplier"
  source: "Foo"
```

Reading `give_me_foo` give us `foo-supplier`'s result: 

```python title="$ python main.py console"
parent = Model.inflate("parent")
parent.get_attr("give_me_foo")
# => Foo
```

### Writing the Reference Form 

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



:::info Suppliers are Lazily Resolved

Inflating a parent model with a Supplier somewhere in its attributes **does not inflate the supplier**; 
you need to actually read the attribute for any work to happen.

We can prove this by pointing to Supplier with a very noticable side-effect (raising an exception) 
and simply ignoring it:

```yaml
kind: Model
id: "parent"
title: "Safe!"
you_will_not_crash:
  kind: ExceptionSupplier
  id: "model-crasher"
```


Neither inflating `parent`, nor reading the `title` will cause an exception:

```python title="$ python main.py console"
parent = Model.inflate("parent")
parent.get_title()
#=> "Safe!"
```

:::


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



## Syntactic Sugar : `->`, `=>`, `>>` 

For convenience, you can follow up your `get::<supplier-ref>` expressions with 
one of `->`, `=>`, `>>` - an alias for a particular `serializer` (JQ, native, 
and model) - and by a string which is your `output` expression. The general form is:

```
get::<supplier-ref>::<serializer-alias><output-expr>
``` 

Examples for each serializer type follow:

#### `->` for `jq`
```yaml {3-4}
kind: Model
id: "parent"
with_id: "get::id::sdk.supplier.config.user_vars->. frontend.service.type"
with_kind: "get::kind::MergedVariablesSupplier->. frontend.service.type"
```


#### `=>` for `native`

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



## Nesting Suppliers

You can nest arbitrarily many Suppliers together to chain their computations,
just as you might in normal programming languages. The following, for instance,
demonstrates this:

```yaml
kind: Model
id: parent
date: 
  kind: FormattedDateSupplier
  output: "%b %d at %I:%M%p %Z"
  source:
    kind: ConfigSupplier
    field_key: "key_last_updated"
```

Note, however, that there is no equivalent for the syntactic sugar `get::` approach,
e.g **you cannot write something like `get::(id::foo())`**. This is a design choice
made for the sake of readability.



## Preventing Resolution with `&`

You will sometimes need to pass a Supplier _itself_ to an attribute, rather than 
the value it resolves to. This is akin to passing a function reference in normal 
programming languages.

To do this, add `"&"` in front of your `id::` or `kind::` reference. For instance:

```yaml
kind: Supplier
id: "delayed_gratification"
soruce: "delayed gratification"
---
kind: Model
id: "parent"
supplier_itself: "get::&id::delayed_gratification" 
```

As expected, getting `supplier_itself` gives us an instance of `Supplier` inflated with
the `delayed_gratification` descriptor.

```python title="$ python main.py console"
parent = Model.inflate("parent")
supplier = parent.get_attr("delayed_gratification")
type(supplier), supplier.resolve()
# => (Supplier, "delayed gratification")
```  
 
 
## Understanding Recursion 

### Default Behavior is Non-Recursive

By default, attribute resolution is **not recursive**. The resolution engine
will try to resolve scalars and lists, as we have seen, but if it gets
a `Dict`, unless the `Dict` itself is `kind: <Supplier subclass>`, the 
engine **will not try to find suppliers nested in the dict's attributes**.  

Consider the following:

```yaml
kind: Model
id: "parent"
nesting:
  separation: 
    kind: Supplier
    id: "will-not-get-resolved"
```

In this example, when we try to resolve `nesting`, the resolution 
engine does not see the `kind: <Supplier subclass>` required for supplier resolution 
and will therefore take it as face value, thus yielding the `Dict` as-is: 

```python title="$ python main.py console"
parent = Model.inflate("parent")
parent.get_attr("nesting")
```


### Forcing Recursive Resolution with `depth=X`


## Outputting Model Descriptors from Suppliers

Some Suppliers, like the `IfThenElseSupplier` are often used to return entire 
model descriptors, as opposed to regular data.  


## Special case: Provider

## Helper

The `Supplier` base class has a `resolve` method that calls the private
`_compute` method in the subclass. 

are essentially a construct that makes 


