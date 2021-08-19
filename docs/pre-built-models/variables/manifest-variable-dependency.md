---
sidebar_position: 1
sidebar_label: Manifest Variable Dependency
---

# Manifest Variable Dependency

Manifest variables are often related to one another. For instance, the 
presence or value of one variable may compel the presence of another. Or, again,
one variable's value might _shadow_ other variables, e.g prevent
them from being read.

The KAMA uses the `ManifestVariableDependency` to model such relationships among 
groups of [manifest variables](/models/variables/manifest-variables),
and uses the `ManifestVariableDependencyInstance` to capture the current state of a
relationship.


## The `ManifestVariableDependency` Model

The following descriptor can be translated to English as 
_ingress config variables (whose names match `[ingress.class, ingress.routes.*]`),
will have their values ignored when the variable `ingress.enabled` is false/nil/undefined_.


```yaml
kind: ManifestVariableDependency
id: "variable-dependency.when-ingress-is-disabled"
title: "Value ignored when ingress.enabled is false"
from: ["id::ingress.enabled"]
effect: "prevents_read"
to: 
  id: ["ingress.class", "ingress.routes.*"]
active_condition:
  kind: Predicate
  challenge: "get::self>>from_variable>>current_value"
  operator: "falsy"

```

**Designating the variables**. 
You can think of the model a 
[bipartite graph](https://en.wikipedia.org/wiki/Bipartite_graph)
where the nodes are `from` and the right node are `to`. Both `from` and `to` are
standard descriptor associations, whose values should resolve to lists of `ManifestVariable`.


**The effect and its activation**.
A dependency is characterized by its effect and the conditions that make it active. The KAMA
establishes which dependency is active by evaluating the `active_condition` Predicate 
on each `from`-`to` pair, e.g each edge the bipartite graph. For each check, the `active_condition` Predicate
is patched with `from_variable` and `to_variable`, which you should use to compute the result.


### Attributes Table

| Key                | Type                                       | Default           | Notes                                                                                                                                                     |
|--------------------|--------------------------------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `from`             | `List[ManifestVariable]`                   | `[]`              | The variables on which the `to` variables depend                                                                                                          |
| `to`               | `List[ManifestVariable]`                   | `[]`              | The variables that depend on the `from` variables                                                                                                         |
| `effect`           | `enum`: `prevents_read \| compels_defined` | `"prevents_read"` | The type of dependence that `to` variables have on `from` variables                                                                                       |
| `active_condition` | `Predicate` **required**                   | `None`            | Used to decide, for each variable in `from` if the `effect` on any variable in `to` is active. Patched at runtime with `from_variable` and `to_variable`. |