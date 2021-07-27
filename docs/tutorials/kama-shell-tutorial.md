---
sidebar_label: KAMA Shell
sidebar_position: 0
---

# Your Wingman: the KAMA Shell

The final expression of your KAMA's behavior is observable only in the NMachine client. Before
you get there though, you can greatly speed up development and debugging by working in the 
KAMA shell. Conceptually, it's identical to the likes of Rails' `rails c` and Django's `manage.py`.

In a KAMA shell, you can access the entire SDK as well as your registered descriptors and custom
classes. This is useful for efficiently introspecting your models, testing your 
[Suppliers](/models/suppliers/supplier-overview) / 
[Predicates](/models/predicates/predicates-base) / 
[Actions](/models/actions/action-base),
and just generally getting comfortable with the KAMA SDK. 

## Starting the Shell

From your project root, run:

```shell script
python3 main.py -m shell
```

From there, you can inflate any model and use most module without having to import them:

```python title="python3 main.py -m shell"
instance = Model.inflate({'title': "Hello Shell!"})
print(instance.get_title())
# => "Hello Shell!"
```

That's it!

## Preloaded Local Variables

The variables are pre-loaded into the shell, meaning they are immediately 
available for use.

{@import ./../../partials/shell-variables-table.md}
