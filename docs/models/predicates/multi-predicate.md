---
sidebar_position: 2
sidebar_label: Subclasses
---

# Included Subclasses

## MultiPredicate

Use the `MultiPredicate` subclass to perform AND/OR operations
on other predicates:

```yaml
kind: MultiPredicate
operator: and
predicates:

  - kind: Predicate
    challenge: foo
    check_against: foo
  
  - kind: Predicate
    challenge: bar
    check_against: baz   
```

The legal operator values are `and` and `or` in lower case. Anything else
returns `False` automatically.


## FormatPredicate

Use the `FormatPredicate` to check various properties of strings:

| `check_against`   | True Examples             | False Examples         |
|-------------------|---------------------------|-----------------------|
| `number`          | `0`, `-1.0`, `".3"`, `2e10`     | `"1x"`, `False`, `[]` |
| `positive-number` | `1`, `"2"`                | `0`, `"-1"`           |
| `email`           | `info@nmachine.io`        | `foo`, `1`            |
| `boolean`         | `True`, `"False"`, `true` | `1`, `"yes"`            |
| `domain`          | `"foo.bar"`               | `"foo dot bar"`       |
| `path`            | `"/foo/bar.baz"`          | `"foo/bar"`           |

Note that the `operator` attribute is **ignored**.
