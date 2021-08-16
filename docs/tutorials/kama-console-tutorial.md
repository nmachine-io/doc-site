---
sidebar_label: Running the Console
sidebar_position: 0
---

# The KAMA Interactive Python Console

## Meet your Wingman

During development, the KAMA Interactive Python Console will be your wingman. 
Conceptually, it's identical to the likes of Rails' `rails c` and Django's `manage.py`.

Inside the console, you can access the entire SDK as well as your registered descriptors and custom
classes. You should use the console as first point of contact for evaluating your work. It's 
much faster to debug and introspect your models through the console than through the desktop client. 




## Starting the Console

From your project root, run:

```shell script
$ python main.py console
```

From there, you can inflate any model and use most module without having to import them:

```python title="$ python main.py console"
instance = Model.inflate({'title': "Hello Console!"})
print(instance.get_title())
# => Hello Console!
```

That's it!

## Preloaded Local Variables

The variables are pre-loaded into the console, meaning they are immediately 
available for use.

{@import ./../../partials/console-variables-table.md}
