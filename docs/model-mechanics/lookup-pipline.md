---
sidebar_label: Lookup Pipeline
sidebar_position: 4
---

# The Attribute Lookup Pipeline

Given a [model](/models/model-overview) inflated with a descriptor, it is 
reasonable to assume that `model.get_attr(x)` simply returns the value of `descriptor['x']`.
While the assumption is not false, a `Model` also has the functionality to support 
more advanced lookups. There are currently **four special lookups supported**; each section
below corresponds to one. 

Each special lookup has two parts to it: a named clause and an escape prefix. It is
easier to show the workings of each special lookup than to state the general rule, so make 
sure each read each section.




## Cached Attributes

We know that YAML-based descriptors can 
**[perform computations using `Supplier`](computation.md)**. 
The followup question becomes whether we cache results for reuse? The answer is Yes, 
and it is made easy with the `cache` clause:

```yaml title="Using the cached clause"
kind: Model
id: "model"
title: "Ice Kream has ${get::self>>response->. | length} resources"
info: "First of which is a ${get::self>>response->.[0].kind}"
cache:
  response:
    kind: HttpDataSupplier
    endpoint: "https://api.nmachine.io/ktea/nmachine/ice-kream-ktea/1.0.1"
    output: ".body.data"
```

The value of [`response`](https://api.nmachine.io/ktea/nmachine/ice-kream-ktea/1.0.1) 
gets cached after the first `get_title`, so that `get_info` is instantaneous 

```python title="$ python main.py console"
>>> model = Model.inflate("model")
>>> model.get_title() # takes a second
'Ice Kream has 5 resources'
>>> model.get_info() # instantaneous
'First of which is a PersistentVolumeClaim'
```

To escape the caching, use **`_no_cache_<attribute_name>`**:
```python title="$ python main.py console"
>>> model = Model.inflate("model")
>>> model.get_attr("response") # cache miss
# ...
>>> model.get_attr("response") # cache hit
# ...
>>> model.get_attr("_no_cache_response") # deliberate cache miss
# ...
```






## Virtual and Resolved Attributes

You may have noticed we use `Model#get_title` in many of our examples. Most
of the time, this is equivalent to `get_attr("title")`. Sometimes though, 
a `Model` subclass will transform a value it reads from a descriptor before using 
it internally. 
The `PatchManifestVariablesAction` does just this:

```python title="kama_sdk.model.action.ext.manifest.patch_manifest_variables_action (simplified)"
class PatchManifestVariablesAction(Action):
  @model_attr
  def get_title(self) -> str:
    return self.get_attr("title") or f"Patch {self.get_target_key()} values"
```

The question becomes: how can do we, from our descriptor, access the "original"
versus the "new" version of the `title`?


```yaml
kind: PatchManifestVariablesAction
id: virtuals
info: "Highjacked '${get::self>>resolved_title}'!"

```

```python
>>> inst = Model.inflate("virtuals")
>>> inst.get_info()
"Highjacked 'Patch user_vars values'!"
```







## Self-Referential Attribute Redefinition

### Problem: Infinite Recursion

We know that 
**[descriptors can inherit from each other](inflating-models.md#inheriting-from-another-descriptor)**
to stay DRY. If B inherits A, then A is deep merged into A, meaning B overwrites any attributes it 
had in common with A.
However, what if we needed to **redefine an attribute in terms of its original value**? 
Our first instinct should be to use a 
**[`SelfSupplier` via `get::self>>`](computation.md#getself-and-getparent)**: 

```yaml title="Crash your NMachine with a stack overflow 💀💀💀"
kind: Model
id: "donor"
title: "Donor"
---
kind: Model
id: "inheritor"
inherit: "donor"
title: "Son of ${get::self>>title}"
info: "Try to honor the past, crash instead"
```

If you tried to run this, <u>**you would get a stack overflow**</u> because you are
recursively defining `title` in terms of itself.
 
### Solution: the `redefine` clause

To get around this, we need to keep the original `title` intact. We do this 
by **putting it inside a `redefine` clause** and **prefixing references to the original 
with `_no_redefine_`**:

```yaml title="Correct self-referential attribute redefinition 💪💪💪"
kind: Model
id: "inheritor"
inherit: "donor"
redefine:
  title: "Son of ${get::self>>_no_redefine_title}"	
info: "Successfully honor the past"
```

The result:  

```python title="$ python main.py console"
>>> inheritor = Model.inflate("inheritor")
>>> inheritor.get_title()
'Son of Donor'
```

The general rule is:
- An attribute `x` in the `redefine` clause will be given precedence over an `x`
outside of the clause
- An attriute reference preceeded by `_no_redefine_` will return escape the
`redefine` clause

