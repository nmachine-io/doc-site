---
sidebar_label: Overview
sidebar_position: 0
---

# Model Descriptor Mechanics

The biggest difference between descriptors in Kubernetes and KAMA is templating.
In Kubernetes, templating is both external and optional. External because you
outsource it to other tools like Helm; **what you see is what you get** from `kubectl apply -f` onward. 
Optional because you can chose to write your manifests entirely by hand.

The KAMA SDK is different. Templating is both internal and mandatory. Internal because
you write certain idioms in your YAML descriptors that the KAMA engine interpret at runtime;
**what you see is <u>not</u> what you get** from `register_descriptors()` onward. Mandatory because many 
descriptors are expected to act as callbacks with inputs and outputs, and logic in between.  











## Limitations & Planned Improvements

### Schema

### Efficient Listing

### Lego-Style GUI

