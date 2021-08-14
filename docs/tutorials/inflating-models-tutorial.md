---
sidebar_label: Inflating Models
---

# Inflating Models

While it is unlikely that your final NMachine source code will contain Python code
for inflating models, as is the object of this tutorial, it's something you should get
comfortable doing via the [KAMA console](/tutorials/kama-console-tutorial)
during development.

## What does Inflating Mean?

Inflating a Model from a descriptor with `kind: K` is the process of instantiating a
Python object of class of type `C` where `C =< K =< Model`. In other words, it's
constructing the appropriate `Model` subclass instance for your descriptor. 

There are four main ways to inflate models, each explained in the sections below.


```python title="$ python main.py console"
model = Action.inflate({'kind': "", id': "my-first-model"})
```

## Inflating by Descriptor ID

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


## Type Inference 

Inflating a Model from a descriptor with `kind: K` is the process of instantiating a
Python object of class of type `C` where `C =< K =< Model`. 

```python title="$ python main.py console"
model = Action.inflate({'kind': "", id': "my-first-model"})
```
