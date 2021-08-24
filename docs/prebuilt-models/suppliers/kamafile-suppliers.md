---
sidebar_position: 2
sidebar_label: Kamafile
---

# Kamafile Suppliers

The following `Supplier` subclasses supply data from the 
[Kamafile](/concepts/kamafile-concept). Note that, because the Kamafile
is partitioned into [Spaces](/concepts/spaces-concept), each
subclass below reads its `config_space` attribute; you'll need to think about this
when you start customizing plugins, as [explained here](#dealing-with-config_space).
   
:::note Several Kamafile Suppliers are Singletons
A Supplier is considered a singleton when it can be used without any configuration,
i.e without a descriptor. The models that invoke such suppliers use 
**[the `get::kind::` shorthand](/)** in conjunction with the
**[the `->` shorthand](/model-mechanics/computation#the-get-shorthands----)**. 
:::


## The `MergedVariablesSupplier` Model

Returns a left-to-right deep-merge of the 
[three levels of variables](/concepts/kamafile-concept#manifest-variables) stored
in the Kamafile, where left is the `default_vars` and right is the `user_vars`. 
Often used to assemble the final set of variables to feed to the
 [KTEA](/concepts/ktea-concept) for templating.

Example:

```yaml title="examples/descriptors/suppliers/kamafile-suppliers.yaml"
kind: Model
id: "merged-vars-printer"
variables: get::kind::MergedVariablesSupplier
```

Result:

```python title="$ python main.py console"
>>> config_man.write_user_vars({"x": "y"})
>>> config_man.write_default_vars({"x": "x", "y": "y"})
>>> model = Model.inflate("merged-vars-printer")
>>> model.get_attr("variables")
{'y': 'y', 'x': 'y'}
```


### Attributes Table

{@import ./../../../partials/config_space-table-attr.md}

## ConfigSupplier


## Dealing with `config_space`

. By default
