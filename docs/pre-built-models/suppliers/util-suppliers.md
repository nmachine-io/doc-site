---
sidebar_label: Utilities  
sidebar_position: 1
---

# Prebuilt Utility Suppliers

The following `Supplier` subclasses perform boilerplate computations
found in most functional programming languages.




## MergeSupplier

Merges the list of `dict` it receives as input. Example:

```yaml
kind: MergeSupplier
id: "my-supplier"
source:
  - {foo: "weak_foo", bar: "bar"}
  - foo: "strong_foo"
```

Yields `{'foo': 'strong_foo', 'bar': 'bar'}`.


### Attributes Table

| Key      | Type         | Lookback | Notes                                                                   |
|----------|--------------|----------|-------------------------------------------------------------------------|
| `source` **required** | `List[Dict]` | No       | List of dictionaries to be merged. First is weakest, last is strongest. |






## UnsetSupplier

Given a `dict` and a list of victim keys, returns the original dict without the victim keys:

```yaml
kind: UnsetSupplier
id: "my-supplier"
source:
  foo: {bar: "victim"}
  baz: "survivor"
victim_keys: 
  - "foo.bar"
```

Yields `{'foo': {'baz': 'survivor'}}`.


### Attributes Table

| Key                        | Type        | Cached? | Lookback | Notes                                                   |
|----------------------------|-------------|---------|----------|---------------------------------------------------------|
| `source` **required**      | `Dict`      | No      | No       | Deep or flat dictionary from which keys will be unset   |
| `victim_keys` **required** | `List[str]` | No      | No       | List of deep keys to unset from the `source` dictionary |






## IfThenElseSupplier

Conditionally returns one value or another depending on the _truthiness_ of `source`:

```yaml
kind: IfThenElseSupplier
id: "my-supplier"
on_true: "true is true"
on_false: "true is false"
predicate: kind::TruePredicate
```

Yields `"true is true"`.

### Attributes Table

| Key                   | Type   | Cached? | Lookback | Notes                                                                    |
|-----------------------|--------|---------|----------|--------------------------------------------------------------------------|
| `predicate` **required** | `Predicate` | No      | No       | The `Predicate` that will be inflated and resolved  |
| `on_true`             | `Any`  | No      | No       | What to return if `predicate` evaluates to a truthy value                   |
| `on_false`            | `Any`  | No      | No       | What to return if `predicate` evaluates to a falsy value                    |






## ListFilterSupplier

Conceptually identical to `filter` in popular functional programming languages. Given 
a `Predicate` and a list, returns only the list item for which the `predicate` 
resolved to a truthy value. 

The `ListFilterSupplier` works by iterating over the list, and for each item,
patching the `predicate` with a `subject` attribute that holds the value of the 
current item.

```yaml
kind: ListFilterSupplier
id: "my-supplier"
source: [1, 2, 3]
predicate:
  kind: Predicate
  challenge: "get::self>>subject"
  check_against: 1
  operator: ">"
```

Yields `[1, 2]`.


### Attributes Table

| Key                   | Type        | Cached? | Notes |
|-----------------------|-------------|---------|----------|----------------------------------------------------------------------------------------------------------------------------------------|
| `source` **required** | `List`      | No      | No       | Any list                                                                                                                     |
| `predicate`           | `Predicate` | N/A     | N/Aa     | Reference to the `Predicate` that will act as the filter on each item in `source`. Will be inflated `subject` set to the current item. |






## JoinSupplier

