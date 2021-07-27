---
sidebar_label: Utility Suppliers  
sidebar_position: 1
---

# Utility Suppliers

We label the `Supplier` subclasses below as "utilities" as they perform
generic computations unspecific to Kubernetes or NMachine. 

## MergeSupplier

Merges the list of `dict` it receives as input:

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

```python title="$ python3 main.py -m shell"
supplier = MergeSupplier.inflate("my-supplier")
print(supplier.resolve())
# => {'foo': 'strong_foo', 'bar': 'bar'} 
```

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

```python title="$ python3 main.py -m shell"
supplier = MergeSupplier.inflate("my-supplier")
print(supplier.resolve())
# => {'foo': {'baz': 'survivor'} } 
```


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

```python title="$ python3 main.py -m shell"
supplier = IfThenElseSupplier.inflate("my-supplier")
print(supplier.resolve())
# => "true is true" 
```

## ListFilterSupplier

Conceptually identical to `filter` in popular functional programming languages. Given 
a `Predicate` and a list, returns the list filtered by items
who made the `Predicate` evaluate to `true`. 

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

```python title="$ python3 main.py -m shell"
supplier = IfThenElseSupplier.inflate("my-supplier")
print(supplier.resolve())
# => [2, 3] 
```


## JoinSupplier

