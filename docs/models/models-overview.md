---
sidebar_position: 0
sidebar_label: Overview
---

# Models Overview

Models the are the entities that make up the KAMA's world view. The SDK provides
a multitude of models, which you, as a publisher, create instances of 
using [descriptors](/tutorials/startup-sequence-tutorial#registering-your-model-descriptors), 
giving your NMachine its behavior. Models are conceptually quite similar 
to Resources in Kubernetes. 

Example that shows the mapping between models and final output:

<p align="center">
  <img src='/img/models/operations/breakdown.png' width="100%" />
</p>






## `Model` is a Python Class

Before jumping into the configs, it helps to understand how Models work at the most basic level.
[`Model`](/nope) is a class in the KAMA SDK. A `Model` instance is constructed with
a key-value configuration bundle that we call a **descriptor**. 
Constructing an instance of a `Model` from a `descriptor` dict is easy: 

```python title="$ python3 main.py -m shell"
model = Model.inflate({
  'id': 'my-first-model',
  'title': "Hello Model!"
})
model.get_id()
# => my-first-model
```

In practice, you'll want write your descriptors in YAML as explained in 
**[Registering YAML Model Descriptors](/tutorials/registering-model-descriptors)**. Most
descriptors in the docs are expressed in YAML so make sure you are comfortable 
with this concept.







## Bound Attributes

An attribute in a descriptor is **"bound"** if its descriptor's `Model` subclass reads it. You know
which attributes are bound by looking at the Bound Attributes Table in a Model's reference docs.

An attribute that is not read by the wrapping `Model` subclass is **free**. Why would you want
to write attributes that the model does not read? The answer is given
[later in the document](#self-referencing-with-getself).
 
### Universal Bound Attributes

The `Model` base class, and therefore all of its subclasses, 
reads the following attributes:

{@import ./../../partials/common-model-attrs.md}


**Example of a Free Attribute**. Now that we know what the bound attributes for 
a `Model` from the table above, we also know that for `Model` itself, 
_a free attribute is anything not on that list_, such as `"foo"`:
```yaml
kind: Model
id: "i-am-bound"
title: "Me too!"
foo: "I am free!"
```





## Inflating Models

As we have seen informally, you inflate a `Model` subclass either directly
or by reference, e.g passing the as 






## Model to Model Associations 

Many Models in the KAMA SDK have a **belonging relationship** with other models. Using
the classic ORM example, a `Company < Model` would have an `employees` attribute 
with a list of `Employee < Model`. 

To learn what a specific Model subclass' relationships are, find the model in the 
documentation and read its "Attributes Table". You'll note that relationships are 
always parent -> child, never the reverse.

For example, **[reading the Attributes Table](/nope)** for a `DeleteResourcesAction` 
tells us that its `selectors` attribute must be `List[ResourceSelector]`.
How do we express this relationship? The are four ways do it:

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

Running it:

```python title="$ python3 main.py -m shell"
parent = DeleteResourcesAction.inflate("parent")
inflated_children = parent.get_selectors()
[child.get_id() for child in inflated_children]
# => ['child-one', 'child-two']
```

**NB One**: `child-one` and `child-two` are defined inline and are therefore <u>not</u> top-level. 
This means that when the KAMA queries `ResourceSelector` outside of the scope above,
**it will not see `child-one` and `child-two`.** 

**NB Two**: `DeleteResourcesAction` knows it's looking for `ResourceSelector`s, so any 
inline definitions can technically omit their `kind`, although this can hurt readability
in some cases.





### Method 2: Id References with `id::`

The second technique is to refer to another top-level model by its ID
using the special syntax `id::<model-id>`, e.g `id::child-one` below. It does
not matter whether the descriptor of the being referenced comes before or
after in the YAML.  

```yaml models/inline-definition-demo.yaml {15-18}
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
selectors:
  - "id::child-one"
  - "id::child-two"
``` 

### Method 3: Singleton References with `kind::`

Some models are conceptually singletons because they don't read any attributes therefore
cannot be customized by descriptors. For these, with can just refer to them by class name with 
the `kind::<class-name>` e.g `kind::TruePredicate` as below.

```yaml {3-4}
kind: DeleteResourcesAction
id: parent
selectors:
  - "kind::UnschedulablePodsSelector"
```

### Method 4: Attribute Query

By passing a dict instead of a list, your value will be 
[Attribute Query](/tutorials/attribute-query-tutorial), which is very
much like a [Label Selector](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) 
but for Models. An example with the [`ActionsPanelAdapter`](/nope) that expects `operations` to be a
`List[Operation]`.

```yaml title="descriptors/demo.yaml" {3-7}
kind: ActionsPanelAdapter
id: "parent"
operations:
  id: "operation.backend.*"
  labels:
    concerning: "database"
```

This is most useful when you  need to be e


## Special Attribute Resolution

The most complicated but most powerful feature in the `Model` is its attribute
resolution system. You will likely make extensive use of attribute resolution even
if your NMachine is simple.

**_Normal_ attribute resolution is when what you see is what you get**. 
Consider a descriptor like the following:

```yaml
kind: Model
id: "normal-attr-demo"
my_literal: "I'm just a literal"
```  

What we see is what we get:

```python title="$ python3 main.py -m shell"
model = Model.inflate("normal-attr-demo")
model.get_attr("my_literal")
# => "I'm just a literal"
```

In contrast, **special** attribute resolution is when what you see is **not** what you get. 
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
```

Here, `TemplateManifestAction` does not define `values`, but can resolve it because its parent defines it:

```python title="$ python3 main.py -m shell"
parent = MultiAction.inflate("parent")
child = parent.sub_actions()[0]
print(child.resolve_attr("values"))
# => {'frontend': {'replicas': 2}}
```



### Self Referencing with `get::self>>`

A descriptor can read its own configuration with the `get::self<attribute-key>` syntax,
for example:

```yaml {4}
kind: Model
id: "demo-model"
original: "123"
copied: "get::self>>original"
```

Running it:

```python title="$ python3 main.py -m shell"
instance = Model.inflate("parent")
print(instance.resolve_attr("original"))
# => '123'
```

#### Use Case 1: Readability and DRYness

You can use this technique to create what are effectively instance variables that
can be re-used. As a result, you can break long expressions into shorter ones:

```yaml {4,5}
kind: FruitBowl
apple: "Long text..."
cherry: "More long text..."
contents: ["get::self>>apple", "get::self>>cherry"]
best_fruit: "get::self>>cherry"
```

#### Use Case 2: Delegation  

Self-referencing lets the KAMA SDK treat models almost like functions that
can be invoked with parameters. For example, when the user sets a manifest
variable value from the UI and it's time for the KAMA to validate it, 
it can inflate your `ManifestVariable` with an attribute called `inputs`
(or anything else) that contains the user input. 

```yaml {6}
kind: ManifestVariable
id: "prometheus.url"
validators:
  - kind: Predicate
    operator: "truthiness"
    challenge: "get::self>>inputs->.prometheus.url"
```
The `->.` syntax is explained later. Cases when the SDK patches models at 
inflation time will always be documented.

### Supplier Values with `get::id` and `get::kind`

We must now introduce a special Model subclass: the **[`Supplier`](/models/supplier/supplier-overview.md)**. 
A `Supplier`'s role is to return something. When a supplier is referenced using either technique 
discussed in [Model to Model Referencing](model-to-model-referencing), it can be made to resolve
to the result of whatever computation it performed. 

When referencing using `id::` or `kind::`, you can enable this behavior by prefixing the entire
expression with `get::`. For instance:

```yaml {10}
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

A `Supplier` can act as a helper by making its instance methods accessible
as attributes as is explained in the [Supplier Overview](/model/suppliers/supplier-overview).
For example, the `BestSiteEndpointSupplier` makes `as_url` 
available as an attribute. Because it is a `Model` attribute, it is read with
`>>`, rather than `=>` or `->`.

```yaml {9}
kind: BestSiteEndpointSupplier
id: "endpoint-supplier"
site_access_nodes: #...more yaml

---

kind: Model
id: "model-doing-the-get"
value_we_want: "get::&id::endpoint-supplier>>as_url"
```

Running it:

```python title="$ python3 main.py -m shell"
instance = Model.inflate("model-doing-the-get")
print(instance.resolve_attr("value_we_want"))
# => "10.40.7.144"
```

### Templated Strings with `${}`

The techniques above can be used in conjunction with the special `${}` 
syntax for strings:

```yaml {5}
kind: Predicate
id: templating-demo
challenge: "foo"
check_against: "bar" 
title: "${get::self>>challenge} VS ${get::self>>check_against}"
```

We would get:

```python
print(Model.inflate("templating-demo").get_title())
# => foo VS bar
```

### List Splattering with `...`

You will sometimes want to add to a list provided by a `Supplier`. You can
do this with the `...` syntax:

```yaml {10,11}
kind: Supplier
id: "my-list-supplier"
source: ["apple", "banana"]

---

kind: Model
id: "fruit-bowl"
fruit:
  - "...get::id::my-list-supplier"
  - "kiwi"
```

Running it:

```python title="$ python3 main.py -m shell"
instance = Model.inflate("fruit-bowl")
print(instance.resolve_attr("fruit"))
# => ["apple", "banana", "kiwi"]
```


## Resolved Attributes and Caching

By now you should know that descriptors can both
[reference their own attributes](#self-referencing-with-getself),
and also get values [computed by Suppliers](#supplier-values-with-getid-and-getkind). 
So what happens when we combined these things? Consider the following: 

```yaml
kind: Model
id: "demo-model"
original: get::kind::RandomStringSupplier
copied: get::self>>original
```

It turns out `original` and `copied` are different:

```python title="$ python3 main.py -m shell"
instance = Model.inflate("demo-model")
print(f"{instance.get_attr("original")} VS {instance.get_attr("copied")}")
# => aaa VS bbb
```

This tells us that the **attribute resolution is performed fresh every time** that `get_attr` 
is invoked. This is fine in most cases, but becomes problematic for expensive computations.
The two following section explain the two ways you have of dealing with this.

### For Any Attribute: `cached: `

You can cache arbitrary key-value pairs by having them inside `cached`:

 ```yaml
kind: Model
id: "demo-model"
cached:
  original: "get::kind::RandomStringSupplier"
copied: "get::self>>original"
 ```

This time, when `copied` resolves `original`, it will use the result
that was computed the first time we called `instance.get_attr("original")`: 

```python title="$ python3 main.py -m shell"
instance = Model.inflate("demo-model")
print(f"{instance.get_attr("original")} VS {instance.get_attr("copied")}")
# => aaa VS aaa
```

### For Dedicated Attributes: `resolved_`

The descriptor in the example above has `Model` as its `kind`, 
which makes for readable documentation but makes little sense for a real KAMA.

In reality, most of the attributes you write in a descriptor will be 
**dedicated attributes**, i.e attributes that the descriptor's wrapper class
intends to consume in order to fulfill its role. In contrast, `original` and
`copied` are just random assignments that never get read outside of our shell playground session.

You will know which attributes get read by a particular Model 
by **looking at that model's attributes table** in the docs. 
If an attribute <u>Cached?</u> set to true in the table, then that attribute's cached value
 will be resolvable as **`resolved_<attr_name>`** from the descriptor.
 
#### Real Example with Predicate
 
Let us use a concrete example with the [`Predicate`](/models/predicates/predicates-base) Model.
First, look at its attributes table:

{@import ./../../partials/predicate-attrs.md}

We now know that `challenge` will be available as `resolved_challenge`. We can use this fact
to tell the user what the value that caused an error was:

```yaml {3}
kind: Predicate
id: "real-predicate"
reason: "Bad status code ${get::self>>resolved_challenge} from API"
challlenge:
  kind: HttpDataSupplier
  endpoint: "foo.bar.com/api"
  output: ".status_code"
check_against: 200
```

This way, when the SDK gets the `reason` to show to the user, 
the `HttpDataSupplier` will not be invoked again.
