---
sidebar_position: 1
sidebar_label: Variables Actions
---

# Variables Actions
 
The KAMA SDK ships with several actions pre-built actions related
to manifest variables manipulation.

## Atomic Actions

### PatchManifestVarsAction

Used to patch the working manifest variables with a bundle of assignments.


```yaml
kind: PatchManifestVarsAction
values:
  frontend:
  	replicas: 3

```

The action above would set or replace `frontend.replicas` to 3 in the master `ConfigMap` at app/user level:

```yaml title="<app namespace>/configmaps/master"
app:
  {
  	#...
  	"user_vars": {
  	 #...
  	  "frontend": {
  	  	"replicas": 3
  	  }
  	}
  }

```


#### Attributes

| Attribute      | Type                                     | Default  | Notes                                                                                      |
|----------------|------------------------------------------|----------|--------------------------------------------------------------------------------------------|
| `values`       | `dict`                                   | `{}`     | The patch. Can be in "nested" or "flat" form, e.g `{"x.y": z'}` or `{'x': {'y': 'z'}`      |
| `target_key`   | `"user"` \| `"injection"` \| `"default"` | `"user"` | The variable ownership-level the patch should be made to. Should be `"user"` in most cases |
| `config_space` | `string`                                 | `"app"`  | ID of the KAMA-space the patch should be made to, i.e the main app or a plugin             |





### UnsetManifestVarsAction

Used remove a variable assignment from the working set.


```yaml
kind: PatchManifestVarsAction
victim_keys: ["frontend.replicas"]

```


#### Attributes


| Attribute      | Type                                     | Default  | Notes                                                                                      |
|----------------|------------------------------------------|----------|--------------------------------------------------------------------------------------------|
| `victim_keys`  | List of `string`                         | `[]`     | List of nested variable keys that should be unset                                          |
| `target_key`   | `"user"` \| `"injection"` \| `"default"` | `"user"` | The variable ownership-level the unset should be made to. Should be `"user"` in most cases |
| `config_space` | `string`                                 | `"app"`  | ID of the KAMA-space the unset should be made to, i.e the main app or a plugin             |



### WriteManifestVarsAction

Replaces the entire working set of variables with a `dict`; should rarely be used.


```yaml
kind: WriteManifestVarsAction
values:
  frontend:
  	service_type: Replicas
    replicas: 1

```


#### Attributes


| Attribute      | Type                                     | Default  | Notes                                                                                      |
|----------------|------------------------------------------|----------|--------------------------------------------------------------------------------------------|
| `values`       | `dict`                                   | `{}`     | The replacement. Can be in "nested" or "flat" form, e.g `{"x.y": z'}` or `{'x': {'y': 'z'}`      |
| `target_key`   | `"user"` \| `"injection"` \| `"default"` | `"user"` | The variable ownership-level the write should be made to. Should be `"user"` in most cases |
| `config_space` | `string`                                 | `"app"`  | ID of the KAMA-space the write should be made to, i.e the main app or a plugin             |
