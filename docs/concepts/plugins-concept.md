---
sidebar_label: Plugins
---

# KAMA Plugins

Plugins let you extend your KAMA with code from community to create a 
better platform for end users. In NMachine, a Plugin is like a mini-KAMA
that your main KAMA can use.

## Why not just use Python imports?

In many cases, Python imports make more sense. After all, your KAMA
is ultimately just behavior expressed in Python and YAML, 
both of which can by packaged with `pypi` and imported natively. 

There are two use-cases when Plugins are preferable:
- The extra functionality involves managing dedicated Kubernetes resources
- The developer wants to take advantage of NMachine distribution features (payment, telemetry, etc...)




# The Spaces System