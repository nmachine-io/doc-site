---
sidebar_position: 1
sidebar_label: Variables Page
---






# Part 1: The Manifest Variables Page 

The importance of manifest variables cannot be overstated for chart-based Kubernetes apps.
Let's make Ice Kream's manifest variables a no-brainer to configure for our NMachine's end user. 


We will fully model one variable - `monolith.deployment.replicas` - to cover the principles
you'll need to model your own variables. Find all final variables descriptors for 
[Ice Kream 🍦](https://github.com/nmachine-io/mono/tree/master/ice-kream) in the 
[Github repo](https://github.com/nmachine-io/mono/tree/master/ice-kream/ice-kream-kama/descriptors/variables).

Make sure you understand how the KAMA thinks about manifest variables
by reading the [KTEA Concept Overview](/concepts/ktea-concept). Additionally,
have a look at the values our 
[templating engine](https://github.com/nmachine-io/mono/tree/master/ice-kream/ice-kream-ktea)
produces:

```bash
curl https://api.nmachine.io/ktea/nmachine/ice-kream-ktea/1.0.1/values | jq
```

If you are curious about the templating engine itself, it is 
[kerbi mixer](https://nmachine-io.github.io/kerbi), not a Helm chart; 
source code [on GitHub](https://github.com/nmachine-io/mono/tree/master/ice-kream/ice-kream-ktea).







## 1. Bare Minimum `ManifestVariable`

Like any good Kubernetes tutorial, we'll start with replicas. Let's create the
 bare minimum **[ManifestVariable](/models/variables/manifest-variables)** descriptor:

```yaml title="descriptors/variables/deployment"
kind: ManifestVariable
id: "monolith.deployment.replicas"
```

The [`ManifestVariable`](/nope) uses the `flat_key` attribute to find actual manifest variable 
in the [Kamafile](/nope). If `flat_key` is missing, `id` is used instead. 
We can start building an intuition for `ManifestVariable`:

```python title="$ python main.py console"
>>> replicas_var = ManifestVariable.inflate("monolith.deployment.replicas")
>>> replicas_var.get_default_value()
1
>>> replicas_var.get_current_value()
1
>>> config_man.patch_user_vars({"monolith.deployment.replicas": 3})
>>> replicas_var.get_current_value()
3
>>> replicas_var.get_default_value()
1
>>> 
```







## 2. Adding Metadata

Having validated that our model is correctly interfacing with the Kamafile's reality,
we can add basic metadata, which is very easy to do. Let's update our model:

```yaml title="descriptors/variables/deployment"
kind: ManifestVariable
id: "monolith.deployment.replicas"
category: "id::sdk.variable-category.compute"
title: "Website Replica Count"
info: "Number of Kubernetes Pod replicas the Ice-Kream store should have. Each replica can cost up to 80Mb of memory and 200 CPU millicores. One replica is enough for ~200 concurrent users. If you expect traffic to fluctuate, you may want to consider enabling the Pod AutoScaler."
```

Let's look at our variable in the desktop client:

![](/img/walkthrough/var-one.png)

What happened here is fairly obvious except for `id::sdk.variable-category.compute` - our first 
**[model association](/models/models-overview#expressing-model-associations-in-descriptors)**, 
which is to [VariableCategory](/models/variables/variable-category.md).



## 3. Adding User Input

We can make one last usability improvement for users by adding a more atuned
input type for the variable. Discover the supported input types in the 
**[Inputs Guide](/models/variables/input)**. We'll use a 
[`SliderInput`](/nope) that goes from 0 to 15:

```yaml title="descriptors/variables/deployment"
kind: ManifestVariable
id: "monolith.deployment.replicas"
category: "id::sdk.variable-category.compute"
title: "Website Replica Count"
info: "Number of Kubernetes Pod replicas the Ice-Kream store should have. Each replica can cost up to 80Mb of memory and 200 CPU millicores. One replica is enough for ~200 concurrent users. If you expect traffic to fluctuate, you may want to consider enabling the Pod AutoScaler."
input:
  kind: SliderInput
  min: 0
  max: 15
```

Our desktop client shows now shows a slider:

![](/img/walkthrough/var-two.png)






## 4. Validating User Input

As part of our effort to digitize operational knowledge, we should prevent user errors before they happen. 
Let's warn the user of suspicious values for `monolith.deployment.replicas`.
To do this, we turn to a new Model - the **[`Predicate`](/models/predicates/predicates-base)**. Our first
predicate will make sure that `replicas > 0`:

```yaml title="descriptors/variables/helpers"
kind: Predicate
id: app.predicate.mono-replicas-non-zero
reason: "Zero replicas will take the website down. Make sure this is temporary."
operator: "greater-than"
challenge: get::self>>value
check_against: 0

```

Let's test our descriptor out by inflating and 
**[patching](/model-mechanics/inflating-models-tutorial#patching)** its `challenge` attribute:

```python
>>> pred = Predicate.inflate("app.predicate.mono-replicas-non-zero")
>>> pred.patch({'value': 4}).resolve()
True
>>> pred.patch({'value': 0}).resolve()
False
```

Now, let's point our variable to our new predicate: 

```yaml title="descriptors/variables/deployment"
kind: ManifestVariable
id: "monolith.deployment.replicas"
# ...
validators:
  - "id::app.predicate.mono-replicas-non-zero"
```

What's happening here? Every time the user moves the slider, 
your `monolith.deployment.replicas` model gets inflated, then its
child `validators` get inflated and 
[patched](/model-mechanics/inflating-models-tutorial#patching) with `value: <value from user input>`.

We can see this in action with the incoming HTTP requests:

![](/img/walkthrough/validation.gif)






## 5. Modelling a Dependency 

Manifest variables are often related to one another, and failing to understand these relationships
can be a source of problems. The KAMA lets you express variable-to-variable relationships with the the 
**[`ManifestVariableDependency` model](/models/variables/manifest-variable-dependency)**.

Let us model the following common dependency: _a deployment's hardcoded `replcas` amount is ignored
when an associated HPA 
([HorizontalPodAutoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/))
is present_.

First, we have to create the new HPA variable:

```yaml
kind: ManifestVariable
id: "monolith.deployment.hpa.enabled"
#...
```

Next, let's write the dependency:

```yaml
kind: ManifestVariableDependency
id: "app.variable-dep.hpa_true_prevents_read_replicas"
title: "Your hardcoded website's pod replica count is ignored because your HPA (Horizontal Pod Auto-scaler) is enabled."
from: ["id::monolith.deployment.hpa.enabled"]
to: ["id::monolith.deployment.replicas"]
effect: "prevents_read"
active_condition:
  kind: Predicate
  challenge: "get::self>>from_variable>>current_value"
  operator: true
```

Now, to test it in the console:

```python
>>> config_man.patch_user_vars({"monolith.deployment.hpa.enabled": False})
>>> replicas_var = ManifestVariable.inflate("monolith.deployment.replicas")
>>> replicas_var.effects_felt()
[]
>>> config_man.patch_user_vars({"monolith.deployment.hpa.enabled": True})
>>> replicas_var.effects_felt()
['prevents_read']
```

Checking the desktop client, you'll notice this has several manifestations, one of
which is that our `monolith.deployment.replicas` variable is now crossed out:

![](/img/walkthrough/var-barred.png)










## 6. Adding Permanent Health Checks

We can give our manifest variable new validations that run anytime,
not just on [user input](#4-validating-user-input) requests. These validations are
called Health Checks, and are modelled with just ordinary 
[Predicate models](/models/predicates/predicates-base) at the `health_predicates` attribute.


Let's re-use our `"monolith.deployment.replicas > 0"` predicate 
from [Step 4](#4-validating-user-input). Upon inflation, every `Predicate` in `health_predicates` 
also gets patched with `value: <current variable value>`, so we can list our 
  `app.predicate.mono-replicas-non-zero` without any changes:


```yaml title="descriptors/variables/deployment"
kind: ManifestVariable
id: "monolith.deployment.replicas"
# ...
health_predicates:
  - "id::app.predicate.mono-replicas-non-zero"
```

Putting it to the test:

```python
>>> replicas_var = ManifestVariable.inflate("monolith.deployment.replicas")
>>> config_man.patch_user_vars({"monolith.deployment.replicas": 1})
>>> replicas_var.get_problems()
[]
>>> config_man.patch_user_vars({"monolith.deployment.replicas": 0})
>>> replicas_var.get_problems()
[<kama_sdk.model.predicate.predicate.Predicate object at 0x7facd46bce80>]
>>> 
```

Our variable gets stigmatized in the client app:

![](/img/walkthrough/unhealthy-var.png)



## 7. Commit Variables, Apply Manifest

**Time for action!** First, copy-paste the remaining variables from the finished 
**[Ice Cream KAMA repo](https://github.com/nmachine-io/mono/tree/master/ice-kream/ice-kream-kama/descriptors/variables)**.
You can just overwrite your entire `/descriptors/variables` subdirectory with the one from GitHub.

Then, from the desktop client, hit the Play button on the top right of the variables page.
