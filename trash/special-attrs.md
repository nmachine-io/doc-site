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

```python title="$ python main.py console"
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

```python title="$ python main.py console"
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

```python title="$ python main.py console"
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

```python title="$ python main.py console"
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

### Resolved Values with `resolved_`

When a `Model` subclass parses a bound attribute, it may apply a transformation to the raw value
it read from the descriptor. A very common example of this is when a backup is used if the value
was null. 


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

```python title="$ python main.py console"
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

```python title="$ python main.py console"
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
that was computed the first time we called `instance.get_attr("original")`. 


### For Bound Attributes: `resolved_`

If a particular subclass of 

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
