---
sidebar_label: Resources Selector
sidebar_position: 5
---

# Resource Selector 

Querying Kubernetes resources is an essential part of managing Kubernetes
application. In KAMA, the **[`ResourceSelector` Model](#the-ResourceSelector-model)**
and **[k8kat's `KatRes`](/as)** serve as your programmatic access interface to the cluster. 

You don't need a deep understanding of k8kat as long as you know that `KatRes`
and its subclasses are thin object wrappers around Kubernetes resource `Dict`s.
The **[`ResourceSelector` Model](#the-ResourceSelector-model)** is essentially
a store of cluster query parameters that get passed to `KatRes#list`.






## The `ResourceSelector` Model

The `ResourceSelector` is used to query the cluster. This model is **not a supplier**;
if you want to use it as a `Supplier`, you should wrap it with a 
**[`ResourcesSupplier`](/asd)** instead. 

We can still, however, test out the cluster query results in the console by calling the
`query_cluster` instance method:

```yaml title="examples/descriptors/kubernetes/resources-selector.yaml"
kind: ResourceSelector
id: "bad-pod-selector"
res_kind: "Pod"
namespace: "kube-system"
label_selector:
  k8s-app: ["event-exporter", "kube-dns"]
field_selector:
  "status.phase": "Failed"
```

Result:

```python title="$ python main.py console"
>>> res_selector = ResourceSelector.inflate("bad-pod-selector")

>>> res_selector.query_cluster()
[<k8kat.res.pod.kat_pod.KatPod object at 0x7f7d49625850>, <k8kat.res.pod.kat_pod.KatPod object at 0x7f7d49625760>, <k8kat.res.pod.kat_pod.KatPod object at 0x7f7d49625c10>]

>>> [(p.name, p.ternary_status()) for p in res_selector.query_cluster()]
[('event-exporter-gke-564fb97f9-fbbsv', 'negative'), ('kube-dns-6c7b8dc9f9-gl787', 'negative'), ('kube-dns-6c7b8dc9f9-pnkwc', 'negative')]
```

### Attributes Table

| Key              | Type                              | Notes                                                                                                                                                                                                                                                                                   |
|------------------|-----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `namespace`      | `str`                             | Kubernetes namepsace to query (ignored if resource type given by `res_kind` is not namespaced, e.g `Node`). If `None`, defaults to installation namespace.                                                                                                                              |
| `res_kind`       | `str` **required**                | Kubernetes resource `kind` to query. Will handle `name` and plural forms, e.g `pods` and `pod` become `Pod`.                                                                                                                                                                            |
| `res_name`       | `str`                             | Kubernetes resource name to match against. `*` means "all".                                                                                                                                                                                                                                          |
| `label_selector` | `Dict` | Kubernetes resource [labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) to match against. For equality, use `str: str` e.g `tier: "database"`. For set inclusion, use `str: List[str]`, e.g `tier: ["database", "memcache"]`.                            |
| `field_selector` | `Dict` | Kubernetes resource  [fields](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)  to match against. For equality, use  `str: str`  e.g  `metadata.name: "postgres"` . For set inclusion, use  `str: List[str]` , e.g  `metadata.name: ["database", "memcache"]`. |



### Special Inflation Shorthand

The `ResourceSelector` model supports the following **[special inflation shorthand](/nope)** syntax:

```yaml
expr::<res_kind>:<res_name>
```

For example:

```yaml
kind: DeleteResourcesAction
id: "delete-jobs"
resource_selectors:
  - "expr::Pod:nginx"
  - "expr::Job:*"
```
