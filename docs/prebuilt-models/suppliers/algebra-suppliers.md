---
sidebar_label: Algebra  
sidebar_position: 1
---

# Prebuilt Algebra Suppliers

The following `Supplier` subclasses perform boilerplate algebraic computations 
found in functional programming languages.




## The `MergeSupplier` Model

Deep-merges the list of `Dict` it receives as input. Example:

### Example

```yaml title="suppliers/algebraic-suppliers.yaml"
kind: MergeSupplier
id: "merge-supplier"
source:
  - foo: "weak_foo"
    bar: "bar"
  - foo: "strong_foo"
```

Result:

```python title="$ python main.py console"
>>> supplier = Supplier.inflate("merge-supplier")
>>> supplier.resolve()
{'foo': 'strong_foo', 'bar': 'bar'}
```


### Attributes Table

| Key      | Type         | Lookback | Notes                                                                   |
|----------|--------------|----------|-------------------------------------------------------------------------|
| `source` **required** | `List[Dict]` | No       | List of dictionaries to be merged. First is weakest, last is strongest. |






## The `UnsetSupplier` Model

Given a `dict` and a list of victim keys, returns the original dict without the victim keys:

### Example

```yaml title="suppliers/algebraic-suppliers.yaml"
kind: UnsetSupplier
id: "my-supplier"
source:
  foo: {bar: "victim"}
  baz: "survivor"
victim_keys: 
  - "foo.bar"
```

Result:

```python title="$ python main.py console"
>>> supplier = Supplier.inflate("unset-supplier")
>>> supplier.resolve()
{'baz': 'survivor'}
```


### Attributes Table

| Key                        | Type        |  Notes                                                   |
|----------------------------|-------------|----------------------------------------------------------|
| `source`       | `Dict`  **required**    |  Deep or flat dictionary from which keys will be unset   |
| `victim_keys` | `List[str]`  **required** |  List of deep keys to unset from the `source` dictionary |






## The `IfThenElseSupplier` Model

Conditionally returns one value or another depending on the _truthiness_ of `source`:

### Example

```yaml title="suppliers/algebraic-suppliers.yaml"
kind: IfThenElseSupplier
id: "my-supplier"
on_true: "true is true"
on_false: "true is false"
predicate: "kind::TruePredicate"
```

Result:

```python title="$ python main.py console"
>>> supplier = Supplier.inflate("ifte-supplier")
>>> supplier.resolve()
'true is true'
```

### Attributes Table

| Key                   | Type   |  Notes                                                                    |
|-----------------------|--------|---------------------------------------------------------------------------|
| `predicate`  | `Predicate` **required** |  The `Predicate` that will be inflated and resolved  |
| `on_true`             | `Any`  |  What to return if `predicate` evaluates to a truthy value                   |
| `on_false`            | `Any`  | What to return if `predicate` evaluates to a falsy value                    |








## The `ListFilterSupplier` Model

Conceptually identical to `filter` in popular functional programming languages. 
Iterates over the list given `source`, and for each item, checks if the `predicate` resolves to True when:
- **[Strong Patched](/asd)** with `value := <item>`
- **[Weak Patched](/asd)** with `challenge := <item>` 
. A new list is returned containing only the items that made the predicate resolve to True.



### Example

```yaml
kind: ListFilterSupplier
id: "filter-supplier"
source: [1, 2, 3]
predicate:
  check_against: 1
  operator: ">"
```

Result:

```python title="$ python main.py console"
>>> supplier = Supplier.inflate("filter-supplier")
>>> supplier.resolve()
[2, 3]
```


### Attributes Table

| Key                   | Type        | Notes |
|-----------------------|-------------|---------|
| `source` **required** | `List`      |  Any list                                                                                                                     |
| `predicate`           | `Predicate` |  Reference to the `Predicate` that will act as the filter on each item in `source`. Will be inflated `subject` set to the current item. |

