---
sidebar_label: Spaces
sidebar_position: 4
---

# The Spaces System in the KAMA SDK

The KAMA supports Plugins, which are like mini-KAMAs that you as a publisher 
can include in your own KAMA.
Like the main KAMA, these mini-KAMAs also need to have their own [state](/concepts/state-concept)
tracked.  



## The `space` attribute

Every Model instance in NMachine has a `space` attribute.
If the model comes from the 
main application, **its `space` should be `"app"`**, otherwise, it will
be the plugin's self-declared ID, e.g `"foo-org.bar-plugin"`. 

### Default `space: app` Behavior 

When writing out your models in YAML, you don't have to set `space: app` 
manually for every model. As long as you do the following on startup,
your models will automatically get patched with `space: app`.

```python title="/kama.py"
model_dicts = yamls_in_dir("./models")
models_man.add_descriptors(model_dicts)
```

If you need to give model descriptor an explicit `space`, for
example to override a plugin's behavior, simply set `space: <plugin-id>`
in your descriptor's YAML.



### Using `space` in Model Queries

By default, the value of a `space` attribute has no effect on the KAMA's behavior; 
it is primarily used to inform the user where a particular resource is coming from; see image below.

![](/img/concepts/many-spaces.png)

You can, however, use `space` when querying models. Below, 
we want to give `foo` and `bar` as  `sub_actions` our `MultiAction`, but only 
if `foo` and `bar` from the space `app`:

```yaml
kind: MultiAction
sub_actions:
  space: app
  id: [foo, bar]
```

If you're writing a custom Model, you would pass space in the query dict `q`
in `Model.inflate_children`:

```python
class MyCustomModel(Model):
  def children_in_app_space(self):
    return self.inflate_children(
      ChildModel, 
      kod='children',
      q={space: 'app'}
    )
``` 


## The `config_space` attribute

The `config_space` Model attribute, on the other hand, does affect the KAMA's behavior 
by default. Any Model that makes use of the [Master ConfigMap](/concepts/state-concept)
or the [KTEA client](/concepts/ktea-concept) will read its `config_space` attribute and 
use the value to carry out the computation. 

There are two key things to know about to `config_space` is resolved for a model:
1. If it is `nil` the value is read from the model's `parent` recursively until not `nil`
1. If it is `nil` and has no parents, its value is set to the value of `space`

The Models that ship the with SDK that make use of `config_space` are:
1. `MergedVariablesSupplier`
1. `DefaultVarialesSupplier`
1. `ConfigSupplier`
1. `PresetAssignmentsSupplier`
1. `FreshDefaultsSupplier`
1. `TemplateManifestAction`
1. `PatchManifestVarsAction`
1. `UnsetManifestVarsAction`
1. `WriteManifestVarsAction`

# Plugins

## Why not just use Python imports?

In many cases, Python imports make more sense. After all, your KAMA
is ultimately just behavior expressed in Python and YAML, 
both of which can by packaged with `pypi` and imported natively. 

There are two use-cases when Plugins are preferable:
- The extra functionality involves managing dedicated Kubernetes resources
- The developer wants to take advantage of NMachine distribution features (payment, telemetry, etc...)

