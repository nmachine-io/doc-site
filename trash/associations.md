### Method 1: Inline Definition

The most straightforward but least scalable approach is just to
declare child models inline:

```yaml descriptors/inline-definition-demo.yaml
kind: DeleteResourcesAction
id: "parent"
selectors:
  - kind: ResourceSelector
    id: "child-one"
    res_kind: ConfigMap
``` 

Running it:

```python title="$ python main.py console"
parent = DeleteResourcesAction.inflate("parent")
inflated_children = parent.get_selectors()
[child.get_id() for child in inflated_children]
# => ['child-one', 'child-two']
```

**NB One**: `child-one` and `child-two` are defined inline and are therefore <u>not</u> top-level. 
This means that when the KAMA queries `ResourceSelector` outside of the scope above,
**it will not see `child-one` and `child-two`.** 

**NB Two**: `DeleteResourcesAction` knows it's looking for `ResourceSelector`s, so any 
inline definitions can technically omit their `kind`, although this can hurt readability
in some cases.





### Method 2: Id References with `id::`

The second technique is to refer to another top-level model by its ID
using the special syntax `id::<model-id>`, e.g `id::child-one` below. It does
not matter whether the descriptor of the being referenced comes before or
after in the YAML.  

```yaml models/inline-definition-demo.yaml {15-18}
kind: ResourceSelector
id: "child-one"
res_kind: ConfigMap

---

kind: ResourceSelector
id: "child-two"
res_kind: Secret

---

kind: DeleteResourcesAction
id: "parent"
selectors:
  - "id::child-one"
  - "id::child-two"
``` 

### Method 3: Singleton References with `kind::`

Some models are conceptually singletons because they don't read any attributes therefore
cannot be customized by descriptors. For these, with can just refer to them by class name with 
the `kind::<class-name>` e.g `kind::TruePredicate` as below.

```yaml {3-4}
kind: DeleteResourcesAction
id: parent
selectors:
  - "kind::UnschedulablePodsSelector"
```

### Method 4: Attribute Query

By passing a dict instead of a list, your value will be 
[Attribute Query](/tutorials/attribute-query-tutorial), which is very
much like a [Label Selector](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) 
but for Models. An example with the [`ActionsPanelAdapter`](/nope) that expects `operations` to be a
`List[Operation]`.

```yaml title="descriptors/demo.yaml" {3-7}
kind: ActionsPanelAdapter
id: "parent"
operations:
  id: "operation.backend.*"
  labels:
    concerning: "database"
```

This is most useful when you  need to be e
