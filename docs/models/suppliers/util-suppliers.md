---
sidebar_label: Utilities  
sidebar_position: 1
---

# Utility Suppliers

The following `Supplier` subclasses perform boilerplate computations
found in most functional programming languages.




## MergeSupplier

Merges the list of `dict` it receives as input.

Example:

```yaml
kind: MergeSupplier
id: "my-supplier"
source:
  - foo: "weak_foo"
    bar: "bar"
  - foo: "strong_foo"
    bar: "bar"
```

Running it:

```python title="$ python main.py console"
supplier = MergeSupplier.inflate("my-supplier")
supplier.resolve()
# => {'foo': 'strong_foo', 'bar': 'bar'} 
```

### Attributes Table

| Key      | Type         | Lookback | Notes                                                                   |
|----------|--------------|----------|-------------------------------------------------------------------------|
| `source` **required** | `List[Dict]` | No       | List of dictionaries to be merged. First is weakest, last is strongest. |






## UnsetSupplier

Given a `dict` and a list of victim keys, returns the original dict 
without the victim keys:

```yaml
kind: UnsetSupplier
id: "my-supplier"
source:
  foo:
    bar: "victim"
    baz: "survivor"
victim_keys: 
  - "foo.bar"
```

Running it:

```python title="$ python main.py console"
supplier = MergeSupplier.inflate("my-supplier")
print(supplier.resolve())
# => {'foo': {'baz': 'survivor'} } 
```

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
if_true: "true is true"
if_false: "true is false"
source: get::kind::TruePredicate
```

Running it:

```python title="$ python main.py console"
supplier = IfThenElseSupplier.inflate("my-supplier")
print(supplier.resolve())
# => "true is true" 
```

### Attributes Table

| Key                   | Type   | Cached? | Lookback | Notes                                                                    |
|-----------------------|--------|---------|----------|--------------------------------------------------------------------------|
| `source` **required** | `bool` | No      | No       | The conditional. Most likely a an expression to resolve to a `Predicate` |
| `if_true`             | `Any`  | No      | No       | What to return if `source` evaluates to a truthy value                   |
| `if_false`            | `Any`  | No      | No       | What to return if `source` evaluates to a falsy value                    |






## ListFilterSupplier

Conceptually identical to `filter` in popular functional programming languages. Given 
a `Predicate` and a list, returns the list filtered by items
for which, when given as input to the predicate, made the predicate evaluate to true. 

This works by patching the `predicate` with a `subject` attribute that holds the value
of the item currently being looked at. 


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

Running it:

```python title="$ python main.py console"
supplier = IfThenElseSupplier.inflate("my-supplier")
print(supplier.resolve())
# => [2, 3] 
```

### Attributes Table

| Key                   | Type        | Cached? | Lookback | Notes                                                                                                                                  |
|-----------------------|-------------|---------|----------|----------------------------------------------------------------------------------------------------------------------------------------|
| `source` **required** | `List`      | No      | No       | A list of anything                                                                                                                     |
| `predicate`           | `Predicate` | N/A     | N/Aa     | Reference to the `Predicate` that will act as the filter on each item in `source`. Will be inflated `subject` set to the current item. |






## JoinSupplier

