---
sidebar_label: Running the Shell
sidebar_position: 0
---

# The KAMA Interactive Python Shell

## Meet your Wingman

During development, the KAMA Interactive Python Shell will be your wingman. 
Conceptually, it's identical to the likes of Rails' `rails c` and Django's `manage.py`.

Inside the shell, you can access the entire SDK as well as your registered descriptors and custom
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
# => Hello Shell!
```

That's it!

## Preloaded Local Variables

The variables are pre-loaded into the shell, meaning they are immediately 
available for use.

{@import ./../../partials/shell-variables-table.md}
