---
sidebar_position: 1
sidebar_label: Registering Models
---

# Registering your Model Descriptors 

In your KAMA's `main.py` (or wherever your `if __name__ == '__main__'` is),
you need to tell the KAMA SDK about all your model descriptors so is can load
them into memory. This is accomplished with `models_man.add_descriptors()`.

## The General Case

You need to pass all your descriptors to
the `models_man` during your NMachine's startup sequence:  

```python title=main.py
from kama_sdk.model.base.model import models_man

def main():
  models_man.add_descriptors([{
    'kind': 'TemplateManifestAction',
    'id': 'demo-action',
    'values': {'frontend': {'replicas': 2}}
  }]

if __name__ == '__main__':
  main()
```  

## From YAML Files

In practice, you'll probably want to use YAML for your descriptors. 
You can use the handy `utils.yamls_in_dir` function to convert all your YAML descriptors
to dicts. The example above would look like this with YAML.

```yaml title=/models/demo-action.yaml
kind: TemplateManifestAction
id: demo-action
values:
  frontend:
    replicas: 2
---
# more descriptors...
```

```python title=/main.py
import os
from kama_sdk.core.core import utils
from kama_sdk.model.base.model import models_man

def main():
  root_dir = os.path.dirname(os.path.abspath(__file__))
  dicts = utils.yamls_in_dir(f'{root_dir}/models', recursive=True)
  models_man.add_descriptors(dicts)

if __name__ == '__main__':
  main()
```  

You can of course use any mixture of both YAML and Dicts. In fact, as your 
code grows, you'll likely want to generate descriptors programmatically.

Everything given to the `models_man` will be in memory for server's
lifetime. Because NMachines have multiple processes, you cannot add descriptors after startup. 
