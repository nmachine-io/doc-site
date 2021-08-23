---
sidebar_position: 2
sidebar_label: "Health Checks"
---

# Part II. Health Checks

Letting the user know what is and isn't working is the greatest form of empathy
we can offer them. This section part of the tutorial.



## 1. Application Status Computer

You probably noticed client that NMachine has an "ERROR" label. This 
is because we have not yet defined our **Application Status Computer**. 


### Concept
An Application Status Computer is simply a 
**[`Predicate`](/prebuilt-models/predicates/overview)** which, when `True` gives
the app a "running" status, when `False` a "broken" status, and when missing/raising 
an "error" status. This status is seen by the user, but is also relayed back to you, the publisher, as
telemetry in the **[publisher dashboard](https://www.publish.nmachine.io)**.

It's up to you to decide what constitues "running" versus "broken", which can admittedly 
be ambiguous in a microservice system, but it should ultimately come down to whether the app
is safely accessible or not.


### Execution

For our **[Ice Kream 🍦](https://github.com/nmachine-io/mono/tree/master/ice-kream)**, 
we'll consider the app to be "running" if and only if the website and 
postgres Deployments are running. Let us begin by getting acquainted with the central 
actor - the **[ResourceSelector](/nope)**:

```yaml title="temporary.yaml"
kind: ResourcesSupplier
id: "test-get-deployments"
selector:
  res_kind: "Deployment"
  label_selector:
    microservice: ["monolith", "postgres"]
``` 

You should get back two **[KatDep](/assd)** objects:

```python
>>> res_supplier = ResourcesSupplier.inflate("test-get-deployments")
>>> resources = res_supplier.resolve()
>>> [type(r) for r in resources]
[<class 'k8kat.res.dep.kat_dep.KatDep'>, <class 'k8kat.res.dep.kat_dep.KatDep'>]
>>> [(r.kind, r.name, r.ternary_status()) for r in resources]
[('Deployment', 'monolith', 'positive'), ('Deployment', 'postgres', 'positive')]
```

All **[KatRes](/assd)** subclasses have a `ternary_status` an instance method that returns 
`"pending"`, `"positive"`, or `"negative"`, according to the status of their underlying 
resource. We can implement our check by verifying that both resources are `"positive"`. 
We'll get rid of the `test-get-deployments` descriptor and inline it into our predicate:

```yaml title="/descriptors/health/status-computer.yaml"
kind: Predicate
id: "app.predicate.deployments-running"
check_against: ["positive", "positive"]
labels:
  status_computer: true
challenge:
  kind: ResourcesSupplier
  serializer: "native"
  output: "ternary_status"
  selector:
    res_kind: "Deployment"
    label_selector:
      microservice: ["monolith", "postgres"]
```

Read up on 
**[`Supplier` output transformation](/prebuilt-models/suppliers/supplier-overview#transforming-the-original-output)** 
to learn why `output: ternary_status` gives us the following:

```python title="$ python main.py console"
>>> predicate = Predicate.inflate("app.predicate.deployments-running")
>>> predicate.get_challenge()
['positive', 'positive']
>>> predicate.resolve()
True
```

Notice this `status_computer: true` in our predicate. Labels in KAMA serve the same purpose as they 
do in Kubernetes: **[querying](/model-mechanics/model-querying)**. `"status_computer"` is a special
label tells the SDK that _this_ is the predicate that computes the global application status. Open 
the desktop client to test it out:

![](/img/walkthrough/status-running.png) 







## General Health Checks

You can, and should, define additional health checks that the user can run at will. To 
do this, simply create `Predicate` descriptors with the label `searchable: true`. 

Let's make the `Predicate` we just created (`app.predicate.deployments-running`) available
as a general health check:

```yaml
kind: Predicate
id: "app.predicate.deployments-running"
title: "Application deployments running"
info: "Ensures the website and database workloads are running"
reason: "Got statuses ${get::self>>resolved_challenge}"
check_against: ["positive", "positive"]
labels:
  status_computer: true
  searchable: true
challenge:
  kind: ResourcesSupplier
  serializer: "native"
  output: "ternary_status"
  selector:
    res_kind: "Deployment"
    label_selector:
      microservice: ["monolith", "postgres"]
```

All we did was 1) add the `searchable` label, 2) add metadata attributes `title` and `info`,
and 3) add a dynamic `reason`.

The predicate now appears in the client's "Health Checks" tab under Actions:

![](/img/walkthrough/health-checks-index.png)
