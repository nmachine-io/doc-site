---
sidebar_position: 0
sidebar_label: Overview
---

# Actions

Broadly speaking, an Action is any DevOps work done behalf of the user, where 
a) the outcome is not guaranteed to be successful, and b) metadata from the execution is
valuable to the user and yourself (the application publisher).

Actions typically perform Kubernetes-type work,
such as applying manifests, updating variables, patching resources (etc...), but 
can also deal with broader DevOps concerns.
 
The **[`Action`](#the-action-model)** and **[`MultiAction`](#the-multiaction-model)** base Models
provide a standard work execution context for all their subclasses. In plainer terms, these two
models handle the boilerplate logic associated with execution - logging, errors, halting, status - 
so that subclasses can focus on the business logic. As we will see below, you **cannot** 
write a descriptor whose `kind` is the base **[`Action`](#the-action-model)** class, but 
you **can** for the **[`MultiAction`](#the-multiaction-model)**.


![](/img/models/action.png)


There are four places you can write actions for your user to use:
1. **As Standalones** visible in the Actions page
1. **Callbacks in [Operations](/asd)**
1. **Callbacks in [ViewSpec](/)**
1. **Callbacks in [ActionRemediationOptions](/)** 








## The `Action` Model

The `Action` model on its own does not _do_ anything interesting; for instance there would 
never be a reason to write descriptor with `kind: Action`. Instead, your descriptor would reference
a subclass of `Action`. Nevertheless, it is necessary to be aware of some of the behavior that
`Action` subclasses inherit from `Action`.


### Process Agnosticism

As covered in the **[Startup Sequence tutorial](/tutorials/startup-sequence-tutorial)**, the KAMA 
needs one server process and at least one worker process. For a running NMachine, all actions 
are assumed to be long running, and therefore run in the worker process. As far as their behaviors go, 
it should not matter which process an `Action` runs in. If your action runs successfully in the 
**[interactive console](/tutorials/kama-console-tutorial)**, it will also work in the worker process.
 



### Playing with Actions

Without diving into the `Action`
**[class docs](/foo)** 
, being aware of five `Action` instance methods will help you do
**[console](/tutorials/kama-console-tutorial)**-based debugging much more productively:
- `run`: run the action _with_ the inherited `Action` error/telem/status logic
- `perform`: invoke the subclass' raw computation _without_ error/telem/status logic
- `get_status`: the status string - `"idle" | "running" | "positive" | "negative"`
- `get_logs`: returns the logs emitted by the action
- `get_error_capture`: returns any **[`ErrorCapture`](#the-errorcapture-bundle)** from a **[failure mode](#failure-modes)**


To illustrate this, we can create a 
**[`KubectlApplyAction`](/prebuilt-models/actions/kubernetes-actions#the-kubectlapplyaction-model)** with a problem:

```yaml title="examples/descriptors/actions/base-actions.yaml"
kind: KubectlApplyAction
id: "playing-with-actions"
res_descs:
  - kind: ConfigMap
    apiVersion: v1
    data: "this-is-a-problem"
```

Using the methods above:

```python title="$ python main.py console"
>>> action = Action.inflate("playing-with-actions")
>>> action.run()
# ... ommitting stack trace
>>> action.get_logs()
['configmaps/None error: error validating "/tmp/man.yaml": error validating data: ValidationError(ConfigMap.data): invalid type for io.k8s.api.core.v1.ConfigMap.data: got "string", expected "map"; if you choose to ignore these errors, turn validation off with --validate=false', 'error: error validating "/tmp/man.yaml": error validating data: ValidationError(ConfigMap.data): invalid type for io.k8s.api.core.v1.ConfigMap.data: got "string", expected "map"; if you choose to ignore these errors, turn validation off with --validate=false']
>>> action.get_status()
'negative'
>>> action.get_error_capture()
{'type': 'kubectl_apply', 'reason': 'Resource rejected. kubectl apply failed for configmaps/None', 'logs': ['error: error validating "/tmp/man.yaml": error validating data: ValidationError(ConfigMap.data): invalid type for io.k8s.api.core.v1.ConfigMap.data: got "string", expected "map"; if you choose to ignore these errors, turn validation off with --validate=false'], 'extras': {'resource_signature': {'name': None, 'kind': 'configmaps'}, 'resource': {'kind': 'ConfigMap', 'apiVersion': 'v1', 'data': 'more-wrong'}}, 'fatal': True, 'is_original': True, 'occurred_at': '2021-08-24 10:19:30.012150', 'event_vid': 'd2ca48b0-4ce3-4c21-8452-d92ae9eeca5d'}
```



### Return Data

You will notice in the Prebuilt Action docs that certain actions have return values.
These can be read by subsequent actions inside **[`MultiAction`](#the-multiaction-model)** sequences.
While debugging, you access an action's return value very easily; the 
**[`TemplateManifestAction`](/)** for example, outputs a list of `Dict` representing Kubernetes resources:

```python title="$ python main.py console"
>>> action = TemplateManifestAction.inflate({"values": {}})
>>> action.run()
{'res_descs': [{'apiVersion': 'v1', 'kind': 'PersistentVolumeClaim', #... 
# truncated for readability
```



### Failure Modes

There are three ways an `Action` can halt other than returning normally:
1. Deliberately raising an `ActionError`
1. Deliberately raising a `FatalActionError`
1. Unhandled Python `Exception` 




### The `ErrorCapture` Bundle 












## The `MultiAction` Model

Most worthwhile actions do several things in sequence (e.g make omlette := break eggs, apply heat, etc...).
To create the best user experience, and to modularize your KAMA code, you should break
up actions into sub-actions.

The `MultiAction` class has a list of **[`Action`](#the-action-model)** it reads from 
its `sub_actions` attribute. It
executes each action in sequence, halting if it gets a `FatalActionError` or any Python `Exception`. 

```yaml title="MultiAction structure"
kind: MultiAction
title: "Make an omelette"
sub_actions:
  - kind::BreakTheEggs
  - kind::ApplyHeat
```

### The Maximum Nesting Level 

You cannot have more than **three levels** of `MultiAction` nesting. This 
is primarily for the benefit of the user, but also for the publisher, who 
will needs to make sense of telemetry.

![](/img/models/multi-action-depth.png)



### Accessing Action Return Values 

Notice that our `AnnotateBananaPodAction` returns something - 
`{'old_sweetness': old_sweetness, 'new_sweetness': new_sweetness}`. When an action
is part of a `MultiAction`, its return values will be made available to subsequent actions 
it via attribute patching.

```python
from kama_sdk.model.action.base.action import Action


class LogOldSweetnessAction(Action):
  def get_old_sweetness():
  	return self.resolve_prop("old_sweetness")

  def perform():
  	old_sweetness = self.get_old_sweetness()
  	self.add_logs(["old_sweetness from previous action: {old_sweetness}"])

```

With the following `MultiAction`, our new `LogOldSweetnessAction` would log
whatetver `old_sweetness` the `AnnotateBananaPodAction` returned.


```yaml
kind: MultiAction
sub_actions:
  - kind::AnnotateBananaPodAction
  # returns {old_sweetness: x, ...}
  - kind::LogOldSweetnessAction
  # available via get::self>>old_sweeetness by the time it runs

```

**Important**. Because return values are passed around by patching models, 
each return value **must** be a `dict`. Furthermore, to avoid name collections,
you may want to prefix your results with unique name:

```python
from kama_sdk.model.action.base.action import Action


class FooBarAction(Action):
  def perform():
    return {
      'foo_bar': {
        'actual_value_one': 'x',
        # ...
      }
    }
```

In this scenario, a downstream action would retreive `actual_value_one` as

```yaml
kind: MultiAction
sub_actions:
  - kind::FooBarAction
  - kind: Action
    the_upstream_value: get::self>>foo_bar->.actual_value_one
```


### Triggering Short Circuits

You can specify a list of `circuit_breakers` dicts to conditionally exit early
after a sub-action returns. Each entry must
have:
1. **An `after` value** to match the sub-action to which it applies; may be a string or `dict`
	1. **If it is a string**, its value will be compared to the current sub-action's `id`
	1. **If it is a `dict` with an `id` key**, `after.id` will be compared to the current sub-action's `id`
	1. **If it is a `dict` with an `index` key**, `after.index` will be compared to index of the current sub-action

1. **An `exit` value** which must be `None`, `"positive"`, or `"negative"`
	1. **If it is a `None`**, nothing happens
	1. **If it is a `"positive"`**, subsequent actions are skipped
	1. **If it is a `"negative"`**, subsequent actions are skipped

In the following example, we can trigger a negative short-circuit if 
the `old_sweetness` returned by `AnnotateBananaPodAction` is nullish:

```yaml
kind: MultiAction
sub_actions:
  - kind::AnnotateBananaPodAction
  - kind::LogOldSweetnessAction
circuit_breakers:
  - after: 
  	  index: 0
	exit: 
	  kind: IfThenElse
	  predicate:
	  	challenge: get::self>>old_sweetness
	  	operator: nullish
      if_true: "negative"
      if_false: null

```




## Errors




First and foremost 

