---
sidebar_position: 2
sidebar_label: State
---

# State Suppliers

The following `Supplier` subclasses supply data from the 
[Kamafile](/concepts/state-concept). Note that, because the Kamafile
is partitioned into [Spaces](/concepts/spaces-concept), each
subclass below reads its `config_space` attribute; you'll need to think about this
when you start customizing plugins, as [explained here](#dealing-with-config_space).
   

## MergedVariablesSupplier

This `MergedVariablesSupplier` returns a deep-merge of the 
[three levels of variables](/concepts/state-concept#manifest-variables) stored
in the Kamafile. The obvious application here being to gather the
final set of variables so that they may be passed to
the [KTEA](/concepts/ktea-concept) for templating.







## ConfigSupplier


## Dealing with `config_space`

. By default
