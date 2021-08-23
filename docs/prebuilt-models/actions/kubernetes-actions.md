---
sidebar_position: 2
---

# Kubernetes Actions

Actions that talk to the user's cluster, either with `k8kat` or `kubectl`.

## Atomic Actions

### The `KubectlApplyAction` Model

Used to run `kubectl apply` for a list of `dict`s. 

```yaml title="my-actions.yaml"
kind: KubectlApplyAction
res_descs:
  - kind: Secret
    apiVersion: v1
    metadata:
      name: example
    data: {}
```

#### Attributes

| Key                   | Type          | Notes                                                                                               |
|-----------------------|---------------|-----------------------------------------------------------------------------------------------------|
| `res_descs`           | `List[Dict]` | Short for "resource descriptors". Compiled into temporary file for `kubectl apply -f file.yaml`     |


### The `AwaitKaosSettledAction` Model

For each `KubectlApplyOutcome` given in the attributes, create a sub-action that polls the resource's status,
terminating according to the following:
The sub-actions either succeed if the resource settles successfully or raise an `ActionError`
if the resource is in a `negative` state.   


### The `PatchResourceAction` Model

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


### The `DeleteResourcesAction` Model

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
