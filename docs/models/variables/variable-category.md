---
sidebar_label: Variable Category
---

# Variable Category

Almost a trivial model, effectively a static asset to store metadata. Holds the title, info, and 
graphic of a manifest variable category, which can be associated with 
a manfiest variable to help categorize it.

The SDK ships with four pre-built descriptors, as shown in the sub-sections
below. 


## The `VariableCategory` Model

### Attributes Table

| Key            | Type  | Default  | Notes                                                                        |
|----------------|-------|----------|------------------------------------------------------------------------------|
| `graphic`      | `str` | `None`   | Name of [Google icon](https://fonts.google.com/icons) or public URL to image |
| `graphic_type` | `str` | `"icon"` | `"icon"` or `"image"`                                                        |


## Prebuilt Descriptors

### Networking - `sdk.variable-category.networking`

```yaml
kind: VariableCategory
id: "sdk.variable-category.networking"
title: "Networking"
info: "HTTP, HTTPS, DNS, SSH settings"
graphic: language
```

### Compute - `sdk.variable-category.networking`


```yaml
kind: VariableCategory
id: "sdk.variable-category.compute"
title: "Workloads"
info: "All things performance and functionality"
graphic: build

```

### Security - `sdk.variable-category.security`

```yaml
kind: VariableCategory
id: "sdk.variable-category.security"
title: Security
info: "Network policies, RBAC and admin access"
graphic: security
```

### Storage - `sdk.variable-category.storage`


```yaml
kind: VariableCategory
id: "sdk.variable-category.storage"
title: Storage
info: "PVCs, StorageClass, and backups"
graphic: save
```
