---
sidebar_position: 1
sidebar_label: Variables Page
---

# Part 1: The Manifest Variables Page 

The importance of manifest variables cannot be overstated for chart-based Kubernetes apps.
Let's make Ice Kream's manifest variables a no-brainer to configure for our NMachine's end user. 
We will model **five manifest variables** with a mix of:
1. **Inputs** validations
1. **Dependency** relations
1. **Health checks**
1. **Error remediations**

Before continuing, you need to understand how the KAMA thinks about manifest variables; 
read the [KTEA Concept Overview](/concepts/ktea-concept) if you haven't already. Also,
to make things more concrete, take a look at the _actual_ manifest variables we will be working with:

```bash
curl https://api.nmachine.io/ktea/nmachine/ice-kream-ktea/1.0.1/values | jq
```

If you are curious about the templating engine itself, it is 
[kerbi mixer](https://nmachine-io.github.io/kerbi), not a Helm chart; 
source code [on GitHub](https://github.com/nmachine-io/mono/tree/master/ice-kream/ice-kream-ktea).





## 1. Bare Minimum `ManifestVariable`

Like any good Kubernetes tutorial we'll start with replicas. Let's create the
 bare minimum **[ManifestVariable](/models/variables/manifest-variables)** descriptor:

```yaml title="descriptors/variables/deployment"
kind: ManifestVariable
id: "monolith.deployment.replicas"
```

The [`ManifestVariable`](/nope) uses the `flat_key` attribute to find actual manifest variable 
in the [Master ConfigMap](/nope). If `flat_key` is missing, `id` is used instead. 
We can start building an intuition for `ManifestVariable`:

```python title="$ python main.py console"
replicas_var = ManifestVariable.inflate("monolith.deployment.replicas")
replicas_var.get_default_value()
# => 1
replicas_var.get_current_value()
# => 1
config_man.patch_user_vars({"monolith.deployment.replicas": 3})
replicas_var.get_current_value()
# => 3
replicas_var.get_default_value()
# => 1
```


## 2. Adding Metadata

Having validated that our model is correctly interfacing with the Master ConfigMap's reality,
we can add basic metadata, which is very easy to do. Let's update our model:

```yaml title="descriptors/variables/deployment"
kind: ManifestVariable
id: "monolith.deployment.replicas"
title: "Application fixed replica count"
```



## Adding User Input

