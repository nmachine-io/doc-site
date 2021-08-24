---
sidebar_position: 2
---

# Kubernetes Actions

The prebuilt actions below are _logically related_ only; they bear no common superclass other than `Action`.

## The `KubectlApplyAction` Model

Akin to running `kubectl apply -f <filename>` in the command line, with some important differences:
1. You pass a list of Kubernetes resource descriptors in `Dict` form with the `res_descs` attribute, instead of a file.
1. You **cannot** give a "--namespace"-style argument; all resource descriptors must have `metadata.namespace` defined.
1. The output is a structured datatype - a list of **[`KAO`](/nope)** (kubectl apply outcome) instead of text.

Example:

```yaml title="examples/descriptors/actions/kubernetes-actions.yaml"
kind: KubectlApplyAction
id: "kubectl-apply-example"
res_descs:
  - kind: ConfigMap
    apiVersion: v1
    metadata:
      namespace: "default"
      name: "hello-docs"
    data:
      hello: "docs"
```

Result:

```python title="$ python main.py console"
>>> action = Action.inflate("kubectl-apply-example")
>>> action.run()
{'kaos': [{'api_group': '', 'kind': 'configmap', 'name': 'hello-docs', 'verb': 'created', 'error': None}]}

>>> KatMap.find("hello-docs", "default")
<k8kat.res.config_map.kat_map.KatMap object at 0x7f99c82fe9d0>
```

Typically, you would use this action after a templating action of some sort 
(i.e **[`TemplateManifestAction`](/prebuilt-models/actions/manifest-actions#the-templatemanifestaction-model)**)
and define `res_descs` dynamically (e.g `res_descs: get::parent>>res_descs`), but for the sake
of simplicity, the example above hardcodes `res_descs`.


### Attributes

| Key                   | Type          | Notes                                                                                               |
|-----------------------|---------------|-----------------------------------------------------------------------------------------------------|
| `res_descs`           | `List[Dict]` **required** | Short for "resource descriptors". Compiled into temporary file for `kubectl apply -f file.yaml`     |


### Return Data

| Key                   | Type          | Notes                                                                                               |
|-----------------------|---------------|-----------------------------------------------------------------------------------------------------|
| `kaos`           | `List[KAO]` | Short for "resource descriptors". Compiled into temporary file for `kubectl apply -f file.yaml`     |










## The `AwaitKaosSettledAction` Model

At a high level, `AwaitKaosSettledAction` is used to wait for Kubernetes resources to settle. For 
example, if you submitted a `Pod` to Kubernetes, you would wait until the Pod transitiioned from 
a pending state (e.g pulling image, container creating) to either a positive state (running, available) 
, or a negative state (crash loop, failed to schedule, shut down, etc...). 
What constitutes a pending, positive, and negative state comes from 
**[`KatRes#ternary_status`](/nope)**. 


The `AwaitKaosSettledAction` is a subclass of 
**[`MultiAction`](/prebuilt-models/actions/actions-overview#the-multiaction-model)**, not `Action`. Given a list
of **[`KAO`](/nope)** (kubectl apply outcome), it synthesizes its own sub-actions (one per `KAO`)
such that each sub-action polls the Kubernetes resource corresponding to one `KAO`. 

Each sub-actions's states behave according to the following rules: 
- **`running`** if the resource's `ternary_status` is `"pending"` 
- **`negative`** if the resource's `ternary_status` is `"negative"` or the resource is not found
- **`positive`** if the resource's `ternary_status` is `"positive"`


```yaml title="examples/descriptors/actions/kubernetes-actions.yaml"
kind: AwaitKaosSettledAction
id: "await-kaos-example"
kaos:
  - api_group: ''
    error: null
    kind: configmap
    name: hello-docs
    verb: created
```

Result:

```python title="$ python main.py console"
>>> action = Action.inflate("await-kaos-example")
>>> action.run()
>>> action.get_status()
'positive'

>>> sub_actions = action.get_final_sub_actions()
>>> [(s.get_id(), s.get_status()) for s in sub_actions]
[('configmap/hello-docs-positive', 'positive')]

>>> underlying_predicates = action.get_predicates()
>>> [(p.get_id(), p.get_challenge()) for p in underlying_predicates]
[('configmap/hello-docs-positive', ['positive']), ('configmap/hello-docs-negative', ['positive'])]
```

Typically, you would use this action after 
**[`KubectlApplyAction`](#the-kubectlapplyaction-model)**
and define `kaos` dynamically (e.g `kaos: get::parent>>kaos`), but for the sake
of simplicity, the example above hardcodes `res_descs`.

### Attributes

| Key                   | Type          | Notes                                                                                               |
|-----------------------|---------------|-----------------------------------------------------------------------------------------------------|
| `kaos`           | `List[KAO]` **required** | List of kubectl apply outcomes to inform the action which Kubernetes resources should be polled    |










## The `PatchResourceAction` Model

Used to patch a Kubernetes resources. 

```yaml
kind: PatchResourceAction
selector:
  kind: ResourceSelector
  res_kind: Deployment
  label_selectors: {microservice: 'image-classifier'}
patch: 
  spec:
    replicas: 2
```

| Key        | Type                                                    | Notes                                                     |
|------------|---------------------------------------------------------|-----------------------------------------------------------|
| `patch`    | `Dict` **required**                                     | data to be merged onto the existing resource              |
| `selector` | [`ResourceSelector`](/models/misc/resource-selector.md) | used to query the cluster to find the target resource     |
| `kat_res`  | [`KatRes`](/concepts/k8kat.md)                          | the target resource; overrides `selector` if both present |









## The `DeleteResourcesAction` Model

Given a list of resource selectors, delete all resource found by selectors.

```yaml title="delete-all-image-classifier-pods.yaml"
kind: DeleteResourcesAction
selectors:
  - kind: ResourceSelector
    res_kind: Pod
    label_selectors: {microservice: 'image-classifier'}
```

#### Attributes

| Key               | Type                                                                 | Notes                                                                                      |
|-------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `selectors` **required**       | [`ResourceSelector`](/models/misc/resource-selector.md) | used to query the cluster to find victim resources                                         |
| `wait_until_gone` | `bool`                                                               | if True, each sub-task waits for its target resource to no longer exist before terminating |
