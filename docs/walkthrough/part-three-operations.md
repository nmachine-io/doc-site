---
sidebar_position: 3
sidebar_label: Operations
---

# Part III. Operations

We haven't actually opened the app until now. Let's do that. Run a port-forward
to port `3000` on the `monolith` service:

```bash
kubectl port-forward svc/monolith 3000:3000 -n ice-kream
```

Now open **[http://localhost:3000/admin](http://localhost:3000/admin)** and you should be greeted
by an auth wall:

![](/img/walkthrough/no-admin.png)







## 1. Before the Operation: the `Action`

We need to create an admin user. In a real scenario, this would be your app, and 
you would know how to do this. In our case, 
[Ice Kream 🍦](https://github.com/nmachine-io/mono/tree/master/ice-kream)
is built with Ruby on Rails - source code on 
[GitHub](https://github.com/nmachine-io/mono/tree/master/ice-kream/ice-kream-app) - 
which you'll have to pretend you wrote.



### Running `seed:admin` in a Pod 

Like most Rails apps, Ice Kream has a command-line interface
for admin-level actions powered by [rake](https://guides.rubyonrails.org/v4.2/command_line.html).
 We're interested in the `seed:admin` rake task in 
[`/lib/tasks/seeding_tasks.rake`](https://github.com/nmachine-io/mono/blob/master/ice-kream/ice-kream-app/lib/tasks/seeding_tasks.rake)
that works as follows:

```bash
bundle exec rake seed:admin[<email>,<password>]
```

:::note This is only one example
Our Ice Kream app just happens to use rake tasks for admin work. Maybe your app uses a JSON API.
In that case you would do something different, like POST data with an 
**[`HttpDataSupplier`](/nope)**.
:::


You can (optionally) try this out for yourself opening 
[an interactive pod container shell](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#interacting-with-running-pods) 
and running the command inside:

```bash title="$"
$ kubectl exec --stdin --tty monolith-<YOUR-POD> -n ice-kream  -- /bin/sh
$ pwd
/app
$ bundle exec rake seed:admin[hello@example.com,password]
D, [2021-08-22T20:58:05.497043 #25] DEBUG -- :    (0.3ms)  BEGIN
D, [2021-08-22T20:58:05.503112 #25] DEBUG -- :   AdminUser Exists (1.1ms)  SELECT  1 AS one FROM "admin_users" WHERE "admin_users"."email" = $1 LIMIT $2  [["email", "hello@example.com"], ["LIMIT", 1]]
D, [2021-08-22T20:58:05.638895 #25] DEBUG -- :   AdminUser Create (134.2ms)  INSERT INTO "admin_users" ("email", "encrypted_password", "created_at", "updated_at") VALUES ($1, $2, $3, $4) RETURNING "id"  [["email", "hello@example.com"], ["encrypted_password", "$2a$11$yT290E9K32FG22.TST6CLeJjNvWs2alaUNSXFR598d//5SP3QfAIa"], ["created_at", "2021-08-22 20:58:05.503942"], ["updated_at", "2021-08-22 20:58:05.503942"]]
D, [2021-08-22T20:58:05.643699 #25] DEBUG -- :    (3.9ms)  COMMIT
```

Finally, we can make sure this works with `KatPod`'s `shell_exec`:

```python title="$ python main.py console"
>>> dep = KatDep.find("monolith", "ice-kream")
>>> pod = dep.pods()[0]
>>> result = pod.shell_exec("bundle exec rake seed:admin[hello@example.com,password]")
>>> print(result)
D, [2021-08-23T08:19:02.664787 #36] DEBUG -- :    (0.3ms)  BEGIN
D, [2021-08-23T08:19:02.669519 #36] DEBUG -- :   AdminUser Exists (1.2ms)  SELECT  1 AS one FROM "admin_users" WHERE "admin_users"."email" = $1 LIMIT $2  [["email", "hello@example.com"], ["LIMIT", 1]]
D, [2021-08-23T08:19:02.671087 #36] DEBUG -- :    (0.2ms)  ROLLBACK
```





### Invoking a Shell Exec in the KAMA 

Now that we're comfortable invoking the rake task, it's time to take our first KAMA-side
step by writing a simple, non-interactive `Action` that invokes the command with the email/password
hardcoded.

Looking through the **[Prebuilt Models](/prebuilt-models)**, we find the 
**[`PodShellExecAction`](/nope)**, which expects a `command: str` and a `pod: KatPod` attribute. We agreed
to hardcode `command` for now, so that's take care of. For `pod`, we'll supply a `KatPod` 
instance using **[`ResourceSelector`](/nope)**. This gives us the following descriptor:

```yaml title="descriptors/operations/seed_admin/shell_action.yaml"
kind: PodShellExecAction
id: "app.action.seed_admin_shell_exec"
command: "bundle exec rake seed:admin[hello@example.com,password]"
pod:
  kind: ResourcesSupplier
  many: false
  serializer: "native"
  selector:
    kind: ResourceSelector
    res_kind: "Pod"
    label_selector:
      microservice: "monolith"
```

Running the action yields the same result as before, which is what we expected:

 ```python title="$ python main.py console"
>>> action = PodShellExecAction.inflate("app.action.seed_admin_shell_exec")
>>> result = action.run()
>>> print(result['output'])
D, [2021-08-23T08:38:57.254183 #65] DEBUG -- :    (0.3ms)  BEGIN
D, [2021-08-23T08:38:57.259162 #65] DEBUG -- :   AdminUser Exists (1.1ms)  SELECT  1 AS one FROM "admin_users" WHERE "admin_users"."email" = $1 LIMIT $2  [["email", "hello@example.com"], ["LIMIT", 1]]
D, [2021-08-23T08:38:57.260731 #65] DEBUG -- :    (0.2ms)  ROLLBACK
 ```








## 2. Make it Interactive with `Operation`

We could call it a day by adding our new Action to the Actions page, but it would
be better if the user could choose an email/password combo. For this, we turn to
**[Operations](/prebuilt-models/operations/operations)**. 

Let's start with a descriptor that gets things on the screen. The following makes use of the 
following models:
1. **[`Operation`](/prebuilt-models/operations/operation)**. The outmost container model.
1. **[`Stage`](/prebuilt-models/operations/operation)**. A set of logically related steps in the operation
1. **[`Step`](/prebuilt-models/operations/operation)**. A single screen containing input fields that get submitted together.
1. **[`Field`](/prebuilt-models/operations/operation)**. A user input.

You'll also notice our first usage of `assets::` in `synopsis: "assets::seed-admin-synopsis.md"`; this is 
for loading files in the `/assets` directory, explained in the
 **[Startup Sequence Tutorial](/tutorials/startup-sequence-tutorial)**.

```yaml title="descriptors/operations/seed_admin/operation.yaml"
kind: Operation
id: "app.op.seed_admin"
title: "Seed Admin User"
synopsis: "assets::seed-admin-synopsis.md"
info: "Add a credentialed Admin user to the database."
tags: ["Seeding"]
labels:
  searchable: true
stages:
  - kind: Stage
    id: "app.stage.seed_admin.main"
    title: "Credentials"
    steps:
      - kind: Step
        title: "Set Admin Credentials"
        info: "Choose an email and password for the principal admin."
        id: "app.step.seed_admin.main.main"
        synopsis: "assets::seed-admin-synopsis.md"
        fields:
          - kind: Field
            id: "email"
            title: "Admin Email"
            validators:
              - kind: FormatPredicate
                check_against: "email"

          - kind: Field
            id: "password"
            title: "Admin Password"
            info: "This password will be encrypted in the application database; it will not be saved by NMachine; you are responsible for it."
            validators:
              - kind: FormatPredicate
                check_against: "password"
```

This gets us 90% of the way there with content and input validation:

![](/img/walkthrough/operation-one.png)







## 3. Putting it all Together

We have the action, and we have the operation, but they're not yet talking to each other. 
We want the `email` and `password` fields to be passed to our `app.action.seed_admin_shell_exec`
action when the user clicks Submit. 

Turning to the **[`Field` reference](/nope)**, we see that **the `target` attribute is relevant** to us.
We **don't** want to treat `admin` or `password` as manifest variables; we just want to keep them in 
memory. As such, let's add one line to each field:

```yaml title="descriptors/operations/seed_admin/operation.yaml"
# operation.stages[0].steps[0]
kind: Operation
#...
stages:
  - kind: Stage
    #...
    steps:
      - kind: Step
        #...
        fields:
          - kind: Field
            id: "email"
            target: "state"
            #...
          - kind: Field
            id: "password"
            target: "state"
``` 

We can now safely access the **`op_state`** attribute in our descriptors, which
holds assignments made to date, as explained 
the **[Operation Docs](/prebuilt-models/operations/operations-overview)**. Let's 
point to our action and have it be inflated with `email` and `password`:


```yaml title="descriptors/operations/seed_admin/operation.yaml"
# operation.stages[0].steps[0]
kind: Operation
#...
stages:
  - kind: Stage
    #...
    steps:
      - kind: Step
        #...
        action:
          inherit: "app.action.seed_admin_shell_exec"
          email: "get::self>>op_state->.email"
          password: "get::self>>op_state->.password"
``` 

Finally, let's update our Action to read these variables:

```yaml title="descriptors/operations/seed_admin/shell_action.yaml"
kind: PodShellExecAction
id: "app.action.seed_admin_shell_exec"
params: "${get::self>>email},${get::self>>password}"
command: "bundle exec rake seed:admin[${get::self>>params}]"
#...
```

## 4. Have some Ice Kream

You should now be able to access the application. You'll notice that the final
[Ice Kream 🍦](https://github.com/nmachine-io/mono/tree/master/ice-kream) NMachine 
has additional Operations. You can find their source code on
[GitHub](https://github.com/nmachine-io/mono/tree/master/ice-kream/ice-kream-kama/descriptors/operations).

![](/img/walkthrough/signed-in.png)

