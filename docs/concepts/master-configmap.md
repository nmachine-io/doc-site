---
sidebar_label: State
---

# State with the Master ConfigMap

When the NMachine client installs an application for a user, 
it will start by creating a `ConfigMap` called `master` in the application's
namespace. This is where the application's identity and "state" are stored. 



The KAMA SDK
provides a programmatic interface to deal with it: a singleton instance of 
`ConfigMan`. 