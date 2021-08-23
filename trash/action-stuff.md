## The Execution Context

The `Action` base class itself is abstract. Subclasses must implement the `perform` method where the actual work happens.
The base class wraps `perform` with a method called `run` to handle concerns like errors and telemetry.

A custom action that demonstrates usage of the `Action` API:

```python
from typing import Dict
from kama_sdk.core.core import config_man
from kama_sdk.core.core.types import ErrCapture
from kama_sdk.model.action.base.action import Action
from kama_sdk.model.action.base.action_errors import FatalActionError

class AnnotateBananaPodAction(Action):

  def get_new_sweetness() -> str:
  	return self.resolve_prop("sweetness", backup="ultra")

  def perform() -> Dict:
  	if banana_pod := KatPod.find("banana", config_man.ns()):
      old_sweetness = banana_pod.annotations.get("sweetness")
      new_sweetness = self.get_new_sweetness()
      self.add_logs([f"change {old_sweetness} to {new_sweetness}"])
      banana_pod.annotate({'sweetness': new_sweetness})
      return {'old_sweetness': old_sweetness, 'new_sweetness': new_sweetness}
    else:
      raise FatalActionError(ErrCapture({
        'type': 'no_banana',
        'reason': f"no banana pod in namespace {config_man.ns()}"
  	  }))

```

The following sub-sections focus on points of interest from the example.
