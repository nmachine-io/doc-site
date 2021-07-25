---
sidebar_position: 0
sidebar_label: Overview
---

# Models Overview

Models the are the entities that make up the KAMA's world view. The SDK provides
a multitude of models, which you, as a publisher, instantiate 
using YAML or Python, giving your NMachine its behavior. Models are conceptually similar 
to Resources in Kubernetes. 

Example that shows the mapping between models and final output:

<p align="center">
  <img src='/img/models/operations/breakdown.png' width="100%" />
</p>


## `Model` is a Python Class

Before jumping into the YAML, it helps to understand how models work at a very basic level.
[`Model`](/nope) is a class in the KAMA SDK. A `Model` instance is constructed with
a key-value configuration bundle that we call a **descriptor**. 
For example, this is how the KAMA SDK might inflate a `Predicate` - a subclass of Model: 

```python
predicate = Predicate.inflate({
  'title': "is 1 greater than 0?"
  'challenge': 1,
  'check_against': 0,
  'operator': "greater-than"
})
print(f"Inflated from {predicate.config}")
```

Without going into detail, the `Predicate` class **will expect certain key-value pairs** 
to be present, read them, and use them in computations. The descriptor can be 
gotten by calling `config` property on a Model instance.


## Registering your Model Descriptors 

You need to pass all your descriptors to
the `models_man` during your NMachine's startup sequence:  

```python title=main.py
from kama_sdk.model.base.model import models_man

my_descriptors = [{'kind': 'Predicate'}]
models_man.add_descriptors(my_descriptors)
```  

In real life, you'll probably want to use YAML. If you used the recommended directory 
structure for your project and your YAMLs are all in `<project>/models`, you can 
use the handy `utils.yamls_in_dir` function to convert all your YAML descriptors
to dicts:

```python title=main.py
import os
from kama_sdk.core.core import utils
from kama_sdk.model.base.model import models_man

root_dir = os.path.dirname(os.path.abspath(__file__))
dicts = utils.yamls_in_dir(f'{root_dir}/models', recursive=True)
models_man.add_descriptors(dicts)
```  

You can of course use any mixture of both YAML and Dicts. In fact, as your 
code grows, you'll likely want to generate descriptors programmatically.

Everything given to the `models_man` will be in memory for server's
lifetime. Because NMachines have multiple processes, you cannot add descriptors after startup. 


## Base Attributes

Every model understands the following attributes.

| Key            | Info                                                                                                                                                       |   |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|---|
| `kind`         | name of the `Model` subclass that should load this descriptor                                                                                              |   |
| `id`           | id that other models can use to refer to this instance. should be unique within the `kind`. if duplicates are found, the last one defined takes precedence |   |
| `space`        | name of the space responsible for this model. `app` if the main KAMA or id of plugin, explained [here](/concepts/spaces-concept)                           |   |
| `config_space` |                                                                                                                                                            |   |
| `title`        | if user-facing                                                                                                                                             |   |
| `info`         |                                                                                                                                                            |   |
| `labels`       |                                                                                                                                                            |   |
| `synopsis`     |                                                                                                                                                            |   |
| `cached`       |                                                                                                                                                            |   | 

## Parents and Children

Few models work alone. Most models inflate other models, either single models
or collections. 

### Referencing a List of Children

