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


## 1. Before the Operation: the Action

We need to create an admin user. In a real scenario, this would be your app, and 
you would know how to do this. In our case, 
[Ice Kream 🍦](https://github.com/nmachine-io/mono/tree/master/ice-kream)
is built with Ruby on Rails - source code on 
[GitHub](https://github.com/nmachine-io/mono/tree/master/ice-kream/ice-kream-app).



### Running `seed:admin` in a Pod 

Like most Rails apps, Ice Kream has command-line interface
for admin-level actions. We're interested in the `seed:admin` rake task in 
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
# pwd
/app
# bundle exec rake seed:admin[hello@example.com,password]
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
instance using **[`ResourcesSelector`](/nope)**. This gives us the following descriptor:

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








## 2. Make it Interactive with Operation

We could call it a day by adding our new Action to the Actions page, but it would
be better if the user could choose an email/password combo. For this, we turn to
**[Operations](/prebuilt-models/operations/operations)**.



