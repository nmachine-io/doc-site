---
sidebar_position: 2
sidebar_label: Inflation
---

# Model Inflation & Association

Inflating means going from _something_ (we'll see what that can be) to a Python object 
that is an instance of `Model`. For example:


```yaml title="The 'something'"
kind: Model
id: "inflation-intro"
```

```python title="The inflated model"
>>> instance = Model.inflate("inflation-intro")
>>> type(instance)
<class 'kama_sdk.model.base.model.Model'>
>>> 
```


## Relevance for YAML Maximalists

It might seem at first that this topic is only relevant to
[Python Maximalists](/nope). **This is not the case**. Even if you only use
YAML in your KAMA, your descriptors will need to conform to the
rules of model inflation, namely for **descriptor inheritance** and **associations**.

Regardless, you will make heavy use of the 
[KAMA interactive console](/tutorials/kama-console-tutorial) where you will need to inflate your models. 
<!-- ::: -->

## The Four ways of Inflating a Model


### Inline Descriptor


#### Top-Level

```python
>>> type(inst), inst.get_kind(), inst.get_id()
(<class 'kama_sdk.model.base.model.Model'>, 'Model', 'inline')
>>> type(inst).__name__, inst.get_kind(), inst.get_id()
('Model', 'Model', 'inline')
```

### 

```yaml
kind: Model
id: "parent"
one_inline_child:
  kind: Model
  id: "child"
two_inline_children:
  - kind: Model
    id: "list-child-one"
  - kind: Model
    id: "list-child-two"
``` 

#### Association


### Descriptor ID Reference

### Descriptor Kind Reference

### Descriptor Query Expression

### Descriptor Special Expression


**Inline Embedding**


**Reference by ID**

```yaml
kind: DeleteResourcesAction
id: "parent"
resource_selectors: 
  - "id::child-one"
---
kind: ResourceSelector
id: "child-one"
``` 

**Reference by Query**

```yaml
kind: DeleteResourcesAction
resource_selectors:
  id: "child-.*"
---
kind: ResourceSelector
id: "child-one"
```




A model is uniquely identified by its kind and id taken together. 


Your most common use case will be "I need to check something about my 
descriptor written YAML". 
 

Inflating a Model from a descriptor of `kind: K` is the process of instantiating a
Python of class of type `K` where `K =< Model`. The trivial example where `K` is 
the base class `Model`:


Notice that our small descriptor does not include `kind: Model`. This is because
when you call `<ModelSubclass>.inflate(<descriptor>)`, 

## Inflating by the Descriptor Itself

## Inflating Singletons by Kind

## Inflating by Special Expression

## Inheriting from another Descriptor

## Patching

A model can be inflated with patch, which is `Dict` that is deep-merged onto
its source descriptor, or inflated normally and patched later.

Typically the SDK will inflate your descriptor with a patch 


## Types and Kinds 

Inflating a Model from a descriptor with `kind: K` is the process of instantiating a
Python object of class of type `C` where `C =< K =< Model`. 

```python title="$ python main.py console"
model = Action.inflate({'kind': "", id': "my-first-model"})
```
