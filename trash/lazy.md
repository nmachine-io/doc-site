
:::info Suppliers are Lazily Resolved

Inflating a parent model with a Supplier somewhere in its attributes **does not inflate the supplier**; 
you need to actually read the attribute for any work to happen.

We can prove this by pointing to Supplier with a very noticable side-effect (raising an exception) 
and simply ignoring it:

```yaml
kind: Model
id: "parent"
title: "Safe!"
you_will_not_crash:
  kind: ExceptionSupplier
  id: "model-crasher"
```


Neither inflating `parent`, nor reading the `title` will cause an exception:

```python title="$ python main.py console"
parent = Model.inflate("parent")
parent.get_title()
#=> "Safe!"
```

:::
