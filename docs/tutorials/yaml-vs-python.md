---
sidebar_label: Yaml or Python?
sidebar_position: 2
---

# Are KAMAs Written in YAML or Python?

It can be confusing to see both YAML and Python in the docs. Two questions arise: 
1. Will you mostly be spending time writing YAML or Python?
1. Can you ignore the Python parts of the docs and just focus on YAML?    

**TLDR**; you spend more time _typing_ YAML, but are seriously handicapped
if you don't engage with the SDK's Python API as during development.      



## Short Answer: It's Mostly YAML 

**By volume**, the vast majority of your source code will be in YAML. That's because you
express most of your KAMA's behavior via [Models](/models/models-overview), 
which work with key-value descriptors. 

**Pro Tip**. Remember, your YAML just get parsed into `dict`s 
[when you register them](/tutorials/startup-sequence-tutorial#registering-your-model-descriptors)
. This means you are free to register programmatically generated descriptors: 

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



## Right Answer: Python = Efficient Development

**Feedback Loop**. You can dramatically tighten your development feedback loop
(e.g code, see result) by testing your models in the [Interactive Shell](/tutorials/kama-shell-tutorial) 
before running them in NMachine client. 

**Debugging**. Inside the Interactive Shell, you can inspect model attributes,
run Actions, resolve Suppliers and Predicates, and inspect more or less all sources
of KAMA problems.

**Custom Model Subclasses**. If you can think of more fitting Models than the ones
that ship with the SDK, [writing custom Models](/nope) is very simple.

