---
sidebar_position: 1
sidebar_label: Startup Sequence
---

# The Startup Sequence

When you build on top of the KAMA SDK, your `main.py` is your KAMA's entrypoint.
You must do three things in your `main.py`:

1. **Register** your model descriptors, custom model, and asset files 
1. **Register** any plugins your KAMA uses
1. **Yield** control to the SDK's master `start` routine 
   
Inspecting `main.py` in **[KAMA Boilerplate](https://github.com/nmachine-io/kama-boilerplate)**,
which it is strongly recommended you use, the three steps above are apparent:  

```python main.py
import os

from kama_sdk import entrypoint
from kama_sdk.model.base.model import models_man
from kama_sdk.core.core import utils


def register_self():
  root_dir = os.path.dirname(os.path.abspath(__file__))
  descriptors = utils.yamls_in_dir(f'{root_dir}/descriptors', recursive=True)
  models_man.add_descriptors(descriptors)
  models_man.add_asset_dir_paths([f'{root_dir}/assets'])


def register_plugins():
  pass


if __name__ == '__main__':
  register_plugins()
  register_self()
  entrypoint.start()
```

## Registering your Model Descriptors 

To pass your model

In your KAMA's `main.py` (or wherever your `if __name__ == '__main__'` is),
you need to tell the KAMA SDK about all your model descriptors so is can load
them into memory. This is accomplished with `models_man.add_descriptors()`.

### The General Case

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

### From YAML Files

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

```python title=main.py
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


## Registering Custom Models

Register custom models by calling `models_man.add_models`:

```python title=main.py
from kama_sdk.model.base.model import Model, models_man

class CustomModel(Model):
  def get_title():
    return "big rebel"

def main():
  models_man.add_models([CustomModel])

if __name__ == '__main__':
  main()
```
