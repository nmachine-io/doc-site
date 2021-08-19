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
**[Supplier](/prebuilt-models/supplier-overview)**, which, when read, carries out the computation
and _supplies_ the result. This page covers how to do this referencing.









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
    field_key: "last_updated"
```

```python title="$ python main.py console"
>>> inst = Model.inflate("nested")
>>> inst.get_attr("date")
'Aug 18 at 06:58PM'
```

Note, however, that there is no equivalent for the syntactic sugar `get::` approach,
e.g **you cannot write something like `get::(id::foo())`**. This is a design choice
made for the sake of readability.








## Suppliers inside Lists

When an attribute's value's type is a List, each item gets supplier-resolved.

```yaml
kind: Model
id: "lists"
strings:
  - "get::kind::RandomStringSupplier"
  - "get::kind::RandomStringSupplier"
``` 

```python title="$ python main.py console"
>>> inst = Model.inflate("lists")
>>> inst.get_attr("strings")
['nBmobFxhSpEjGcbk', 'YiEyMkAvqVbJweyX']
```  

:::info Dicts in Lists?
Check out the next section. If your list items are Dicts, you'll need to use `depth=`.  
:::
 
 
 
 
 
 
## Suppliers inside Dicts 

What happens when your supplier is _inside_ a Dict?

### The Default Behavior is Non-Recursive

By default, attribute resolution is **not recursive**. The resolution engine
will try to resolve scalars and lists, as we have seen, but if it gets
a `Dict`, unless the `Dict` itself is `kind: <Supplier subclass>`, the 
engine **will not try to find suppliers nested in the dict's attributes**. Consider the following:

```yaml
kind: Model
id: "supplier-in-dict"
nesting:
  separation:
    kind: Supplier
    source: "Won't get resolved by default."
```

In this example, when we try to resolve `nesting`, the resolution 
engine does not see the `kind: <Supplier subclass>` required for supplier resolution 
and will therefore take it as face value, thus yielding the `Dict` as-is: 

```python title="$ python main.py console"
>>> inst = Model.inflate("supplier-in-dict")
>>> inst.get_attr("nesting")
{'separation': {'kind': 'Supplier', 'source': "Won't get resolved by default."}}
```


### Forcing Recursive Resolution with `depth=`

To force attribute resulution inside a Dict, **you need to pass `depth=<X>`**. Using
the descriptor from the last example, we can get `nesting` to full resolve as follows:

```python title="$ python main.py console" {2}
>>> inst = Model.inflate("supplier-in-dict")
>>> inst.get_attr("nesting", depth=100)
{'separation': "Won't get resolved by default."}
```

Each model knows which attributes _ought to be_ Dicts, so it's their job to use
`depth=`. Assuming you don't write custom models, the only time you will use this is
when debugging your models in the console. 










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











## Outputting Model Descriptors from Suppliers

Some Suppliers, like the `IfThenElseSupplier` are often used to return entire 
model descriptors, as opposed to regular data.  
