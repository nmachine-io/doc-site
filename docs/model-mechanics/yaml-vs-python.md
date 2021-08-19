---
sidebar_label: YAML vs Python
sidebar_position: 1
---

# Language: YAML or Python?

It can be confusing to see both YAML and Python in the docs. This document
addresses the prerequisites around both languages, as well as longer term
strategies for YAML/Python maximalism. 

**TLDR on Requirements**:
- Do I have to know Python?. 
  - **Yes** You'll rely on Python for rapid iteration/debugging in the 
[interactive console](/tutorials/kama-console-tutorial).
- Does the YAML require learning a DSL? 
  - **Kind of**. Mainly, it's [highly idiomatic](https://news.ycombinator.com/item?id=21080606).






## Why YAML-Maximalists still need Python


If you go for YAML-Maximalism, which is [recommended approach](/tutorials/yaml-vs-python#start-with-yaml)
when you get started, you can build an NMachine with 0 lines of Python (excluding the boilerplate). 

So, why do you need Python? The answer is **developer productivity**.



**Feedback Loop**. You can dramatically tighten your development feedback loop
(e.g code, see result) by testing your models in the **[Interactive Console](/tutorials/kama-console-tutorial)** 
before running them in NMachine client. 

**Debugging**. Inside the Interactive Shell, you can inspect model attributes,
run Actions, resolve Suppliers and Predicates, and inspect more or less all sources
of KAMA problems.






## When are YAML and Python Interchangable?

Most of KAMA development is writing **[Model descriptors](/models/models-overview)**, which
are similar to Kubernetes resources. When the NMAchine starts, you 
**[register your descriptors]((/tutorials/startup-sequence-tutorial#registering-your-model-descriptors))**,
which are a list `Dict`, meaning you get to choose whether to load YAMLs or write/generate descriptors
directly in Python.

```python title="main.py" {9-11}
def load_yaml_descriptors():
  path = f'{root_dir}/descriptors'
  return loading_utils.load_dir_yaml_dicts(path, recursive=True)

def generate_descriptors():
  return [{'kind': 'Action' }] # invoke actual factory here

def register_own_descriptors():
  models_man.add_descriptors([
    *load_yaml_descriptors(),
    *generate_some_descriptors()
  ])
```




## The Recommended Approach


### Start with YAML

YAML files can get messy, but they're easy to write, easy to read, and most 
importantly easy to change. Also,
the documentation, boilerplate repo, and tutorial 
[Ice Kream 🍦](https://github.com/nmachine-io/mono/tree/master/ice-kream) are all 
YAML-maximalists.

Once it's time to start scaling/DRYing, you can move on to the next two suggestions.



### Pythonify Conditional [Suppliers](/suppliers/supplier-overview)

Hard to read YAML defaults the purpose of YAML. A hard-to-avoid source of 
messiness is when you have Suppliers doing conditional logic. If you're 
nesting **[`IfThenElseSupplier`](/suppliers/util-suppliers#ifthenelsesupplier)**s,
or **[`ListFilterSupplier`](/suppliers/util-suppliers#listfiltersupplier)**s,
then you should probably write your own models.


 


### Write Factories for Repetitive Descriptors

Once you have a stable NMachine, you can start cracking down on repetitive 
patterns YAML patterns and generate your descriptors programmatically instead.

Keep in mind though, that you can achieve a high level of DRYness using the KAMA's native
features, namely by combining 
**[descriptor inheritance](/model-mechanics/inflating-models-tutorial#inheriting-from-another-descriptor)**
and **[patching](/model-mechanics/inflating-models-tutorial#patching)**.

