---
sidebar_position: 0
sidebar_label: Overview
---

# Actions

An Action is anything that runs. Typically, actions perform Kubernetes-related work,
such as a `kubectl apply` execution, updating variable values, patching resources, etc... 
But, you can do any other kind of work too by defining your own subclasses.
The following image sketches out the relationship between the Action models defined in the KAMA and
what the user sees.

![](/img/models/actions/action-breakdown.png)

## The `Action` Model

The base class for actions is `Action`. Its two key methods are `perform()` which subclasses
implement to carry out the logic, and `run()`, which wraps the former and handles things like 
errors and telemetry.












### Halting Early with `FatalActionError`

If the action cannot be completed and needs to halt early, or if it somehow failed,
 you should raise a special `Error` called `FatalActionError`. 

The  `FatalActionError` constructor
takes an `ErrorCapture` (which is just a `dict`) as its sole argument. The `ErrCapture`
holds metadata that will be communicated to the user and the publisher. 

Besides the required `type` and `reason` attributes, you can optionally 
provide `extras`, which must be a `Dict`. For example:


```python
raise FatalActionError(ErrCapture({
  #...
  'extras': { 
    'resource_kind': 'Pod', 
    'resource_name': 'banana' 
  }
}))

```

As a publisher, you will be able to query and read anything in the `extras` bundle
from the [Publisher Dashboard](https://publish.nmachine.io).



### Using attributes as parameters

Like with any `Model` subclass, you can read arbitrary attributes from the YAML in
your model. For this reason the `Action` class does not have a dedicated mechanism 
for injesting parameters. In the `AnnotateBananaPodAction`, you would pass the 
`sweetness` value in the YAML as usual:

```yaml
kind: AnnotateBananaPodAction
id: my-instance
sweetness: extreme

```












## The `MultiAction` Class

Most worthwhile actions do several things in sequence (e.g "make omlette = break eggs, apply heat, etc...").
To create the best user experience, and to modularize your KAMA code, you should break
up actions into sub-actions.

The `MultiAction` class has a list of `Action`s it reads from its `sub_actions` attribute. It
executes each action in sequence, halting if it gets a `FatalActionError` or any Python `Exception`. 

```yaml title="MultiAction structure"
kind: MultiAction
title: "Make an omelette"
sub_actions:
  - kind::BreakTheEggs
  - kind::ApplyHeat

```

**The maximum level of nesting is 3**. 

<p align="center">
    <img src='/img/models/actions/multi-action-breakdown.png' width="80%" />
</p>



### Passing results downwstream 

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

