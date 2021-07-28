---
sidebar_label: Yaml or Python?
sidebar_position: 2
---

# Writing an NMachine: YAML or Python?

It can be confusing to see both YAML and Python in the docs. Two questions arise: 
1. Will I mostly be spending time writing YAML or Python?
1. Do I need to be a good Python programmer to write a KAMA?    

**TLDR**; you will spend more time _typing_ YAML, but will have your 
developer productivity seriously hampered without knowledge of 
the KAMA SDK's Python API. 

## Short Answer: It's Mostly YAML 

**By volume**, most of your final source code will be in YAML. That's because you
will be expressing most of your KAMA's behavior via [Models](/models/models-overview), 
which work with key-value configuration. 


## Right Answer: Python = Efficient Development

**Feedback Loop**. You can dramatically tighten your development feedback loop
(e.g code, see result) by testing your models in the [Interactive Shell](/tutorials/kama-shell-tutorial) 
before running them in NMachine client. 

**Debugging**. Inside the Interactive Shell, you can inspect model attributes,
run Actions, resolve Suppliers and Predicates, and inspect more or less all sources
of KAMA problems.

**Custom Model Subclasses**. Write me later. 

## Work Smart: Generate some Descriptors 

Remember, YAML is just convenient format, but what ends up getting complied are 
native Python `dict`s. This means you are entirely free to register descriptors
that you generated programmatically: 

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
