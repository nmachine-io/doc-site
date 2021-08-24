---
sidebar_position: 1
sidebar_label: Manifest
---

# Variables Actions
 
The prebuilt actions below are only _logically related_; they bear no common superclass other than `Action`.
We refer to them as "Variables Actions" because they involve reading or writing manifest variables from the 
**[kamafile](/concepts/kamafile-concept)**.
 
:::note Each action use `config_space`
Because each of the following actions reads/writes the **[kamafile](/concepts/kamafile-concept)**, 
they each read their **[`config_space`](/concepts/spaces-concept#the-config_space-attribute)** attribute.
:::



## The `TemplateManifestAction` Model

The `TemplateManifestAction` invokes a templating engine's templating function/action. Recall that 
NMachines think of templating engines as **[KTEAs](/concepts/ktea-concept)**; under the hood, 
this action calls the **[`ktea_provider`](/nope)** with the values it reads from `ktea` and `values`.

The action returns the KTEA's output as a list of `Dict` (where each `Dict` is a
 Kubernetes resource descriptor) under `res_descs`.


### Example

```python title="examples/descriptors/actions/variables-actions.yaml"
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
| `values`    | `Dict` **required**                                                | Variable assignments bundle to be passed to the KTEA                      |
| `ktea`      | **[`KteaDict`](/concepts/ktea-concept#how-kamas-interact-with-kteas)** | If non-empty, uses a KTEA with this configuration; otherwise uses the `ktea` entry in the **[kamafile](/concepts/kamafile-concept)** for the action's `config_space`                            |
| `resource_selectors` | **[`List[ResourceSelector]`](/prebuilt-models/computers/resource-selector)**  | if non-empty, acts as a whitelist to filter resources yielded by the KTEA |


### Return Data

| Key         | Type                                                               | Notes                                                                     |
|-------------|--------------------------------------------------------------------|---------------------------------------------------------------------------|
| `res_descs` | `List[Dict]`  | List of Kubernetes resource descriptors in `Dict` form, e.g `[{"kind": "Pod", #...}]`














## The `PatchManifestVarsAction` Model

Used to patch the working manifest variables with a bundle of assignments.

### Example

```python title="examples/descriptors/actions/variables-actions.yaml"
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
| `values`       | `dict`                                  | The patch. Can be in "nested" or "flat" form, e.g `{"x.y": z'}` or `{'x': {'y': 'z'}`      |
| `ktea`      | **[`KteaDict`](/concepts/ktea-concept#how-kamas-interact-with-kteas)** | If non-empty, uses a KTEA with this configuration; otherwise uses the `ktea` entry in the **[kamafile](/concepts/kamafile-concept)** for the action's `config_space`                            |
| `target_key`   | `"user_vars"` \| `"vendor_injection_vars"` \| `"default_vars"` | The variable ownership-level the patch should be made to. Should be `"user"` in most cases |





## The `UnsetManifestVarsAction` Model

Used remove a variable assignment from the working set.


```yaml
kind: PatchManifestVarsAction
victim_keys: ["frontend.replicas"]

```


### Attributes


| Attribute      | Type                                     | Default  | Notes                                                                                      |
|----------------|------------------------------------------|----------|--------------------------------------------------------------------------------------------|
| `victim_keys`  | List of `string`                         | `[]`     | List of nested variable keys that should be unset                                          |
| `target_key`   | `"user"` \| `"injection"` \| `"default"` | `"user"` | The variable ownership-level the unset should be made to. Should be `"user"` in most cases |
| `config_space` | `string`                                 | `"app"`  | ID of the KAMA-space the unset should be made to, i.e the main app or a plugin             |



## The `WriteManifestVarsAction` Model

Replaces the entire working set of variables with a `dict`; should rarely be used.


```yaml
kind: WriteManifestVarsAction
values:
  frontend:
  	service_type: Replicas
    replicas: 1

```


### Attributes


| Attribute      | Type                                     | Default  | Notes                                                                                      |
|----------------|------------------------------------------|----------|--------------------------------------------------------------------------------------------|
| `values`       | `dict`                                   | `{}`     | The replacement. Can be in "nested" or "flat" form, e.g `{"x.y": z'}` or `{'x': {'y': 'z'}`      |
| `target_key`   | `"user"` \| `"injection"` \| `"default"` | `"user"` | The variable ownership-level the write should be made to. Should be `"user"` in most cases |
| `config_space` | `string`                                 | `"app"`  | ID of the KAMA-space the write should be made to, i.e the main app or a plugin             |
