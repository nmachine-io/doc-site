---
sidebar_position: 1
sidebar_label: Manifest
---

# Variables Actions
 
The prebuilt actions below are only _logically related_; they bear no common superclass other than `Action`.
We refer to them as "Variables Actions" because they involve reading or writing manifest variables from the 
**[kamafile](/concepts/kamafile-concept)**.
 
:::note These actions read their `config_space`
Because each of the following actions reads/writes the **[kamafile](/concepts/kamafile-concept)**, 
they each read their **[`config_space`](/concepts/spaces-concept#the-config_space-attribute)** attribute. 
If it is null or undefined, `app` will be used.
:::






## The `TemplateManifestAction` Model

The `TemplateManifestAction` invokes a templating engine's templating function/action. Recall that 
NMachines think of templating engines as **[KTEAs](/concepts/ktea-concept)**; under the hood, 
this action calls the **[`ktea_provider`](/nope)** with the values it reads from `ktea` and `values`.

The action returns the KTEA's output as a list of `Dict` (where each `Dict` is a
 Kubernetes resource descriptor) under `res_descs`.


### Example

```yaml title="examples/descriptors/actions/variables-actions.yaml"
kind: TemplateManifestAction
id: "template-manifest-example"
ktea:
  type: "server"
  version: "1.0.1"
  uri: "https://api.nmachine.io/ktea/nmachine/ice-kream-ktea"
values:
  monolith:
    deployment:
      replicas: 2
```

Result:

```python title="$ python main.py console"
>>> action = Action.inflate("template-manifest-example")
>>> ret = action.run()
>>> res_finder = lambda r: r['metadata']['name'] == 'monolith'
>>> monolith_res = next(filter(res_finder, ret['res_descs']))
>>> monolith_res['spec']['replicas']
2
```


### Attributes Table


| Key         | Type                                                               | Notes                                                                     |
|-------------|--------------------------------------------------------------------|---------------------------------------------------------------------------|
| `values`    | `Dict` **required**                                                | Variable assignments bundle to be passed to the KTEA. Can be flat or nested e.g `{"x.y": z'}` or `{'x': {'y': 'z'}` |
| `ktea`      | **[`KteaDict`](/concepts/ktea-concept#how-kamas-interact-with-kteas)** | If non-empty, uses a KTEA with this configuration; otherwise uses the `ktea` entry in the **[kamafile](/concepts/kamafile-concept)** for the action's `config_space`                            |
| `resource_selectors` | **[`List[ResourceSelector]`](/prebuilt-models/computers/resource-selector)**  | if non-empty, acts as a whitelist to filter resources yielded by the KTEA |


### Return Data

| Key         | Type                                                               | Notes                                                                     |
|-------------|--------------------------------------------------------------------|---------------------------------------------------------------------------|
| `res_descs` | `List[Dict]`  | List of Kubernetes resource descriptors in `Dict` form, e.g `[{"kind": "Pod", #...}]`














## The `PatchManifestVarsAction` Model

Patches one level of manifest variables in **[kamafile](/concepts/kamafile-concept)**, 
given by `vars_level` (defaults to `"user_vars"`), with a bundle of assignments, given by 
`values`. The patch is implemented as a deep merge where `values` is right (i.e strong) 
and the existing variables is left (i.e weak).

### Example

```yamlm title="examples/descriptors/actions/variables-actions.yaml"
kind: PatchManifestVarsAction
id: "patch-manifest-vars-example"
values:
  monolith:
    deployment:
      replicas: 3
```

Result:

```python title="$ python main.py console"
>>> action = Action.inflate("patch-manifest-vars-example")
>>> action.run()
>>> config_man.get_user_vars()
{'monolith': {'deployment': {'replicas': 3}}}
```


### Attributes

| Attribute      | Type                                       | Notes                                                                                      |
|----------------|------------------------------------------|--------------------------------------------------------------------------------------------|
| `values`       | `Dict`                                  | The patch. Can be flat or nested, e.g `{"x.y": z'}` or `{'x': {'y': 'z'}`      |
| `ktea`      | **[`KteaDict`](/concepts/ktea-concept#how-kamas-interact-with-kteas)** | If non-empty, uses a KTEA with this configuration; otherwise uses the `ktea` entry in the **[kamafile](/concepts/kamafile-concept)** for the action's `config_space`                            |
| `vars_level`   | `str` | The variable ownership-level the patch should be made to. Should be `"user"` in most cases |









## The `UnsetManifestVarsAction` Model

Removes individual variable assignments, whose keys are given by `victim_keys: List`,
from manifest variables in the **[kamafile](/concepts/kamafile-concept)**, 
whose level is given by `vars_level` (defaults to `"user_vars"`).


### Example


```yaml title="examples/descriptors/actions/variables-actions.yaml"
kind: UnsetManifestVarsAction
id: "unset-manifest-vars-example"
vars_level: "user_vars"
victim_keys: ["x.y"]
```

Result:

```python title="$ python main.py console"
>>> config_man.write_user_vars({"x": {"y": "y", "z": "z"}})
>>> action = Action.inflate("unset-manifest-vars-example")
>>> action.run()
>>> config_man.get_user_vars()
{'x': {'z': 'z'}}
```


### Attributes


| Attribute      | Type                                     | Default  | Notes                                                                                      |
|----------------|------------------------------------------|----------|--------------------------------------------------------------------------------------------|
| `victim_keys`  | List of `string`                         | `[]`     | List of flat variable keys that should be unset, e.g `["x", "foo.bar.baz"]`                                          |
| `vars_level`   | `str` |  The variable ownership-level the unset should be made to. Should be `"user"` in most cases |



## The `WriteManifestVarsAction` Model


Completely overwrites one level of manifest variables in **[kamafile](/concepts/kamafile-concept)**, 
given by `vars_level`, with a bundle of assignments, given by 
`values`. Notice that `vars_level` must be explicitly given; an empty value will raise a `FatalActionError`.

### Example

```yaml title="examples/descriptors/actions/variables-actions.yaml"
kind: WriteManifestVarsAction
id: "write-manifest-vars-example"
vars_level: vendor_injection_vars
values:
  frontend:
  	service_type: Replicas
    replicas: 1
```

Result:

```python title="$ python main.py console"
>>> config_man.write_user_vars({"x": {"y": "y", "z": "z"}})
>>> action = Action.inflate("write-manifest-vars-example")
>>> action.run()
>>> config_man.get_user_vars()
{'x': 'mayhem!'}
```

:::danger This action is Unforgiving
There are few scenarios when you should prefer an overwrite to a a patch. Make sure you have 
ruled out the **[`PatchManifestVarsAction`](#the-patchmanifestvarsaction-model)** before using this action.
:::



### Attributes


| Attribute      | Type                                     | Default  | Notes                                                                                      |
|----------------|------------------------------------------|----------|--------------------------------------------------------------------------------------------|
| `values`       | `dict`                                   | `{}`     | The replacement. Can be flat or nested, e.g `{"x.y": z'}` or `{'x': {'y': 'z'}`      |
| `vars_level`   | `str` **required** | `"user"` | The variable ownership-level the write should be made to. Should be `"user"` in most cases |
| `config_space` | `string`                                 | `"app"`  | ID of the KAMA-space the write should be made to, i.e the main app or a plugin             |
