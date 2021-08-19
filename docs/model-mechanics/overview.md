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






## Idiomatic is not Difficult

While not technically a DSL, descriptor mechanics are **highly idiomatic**. The original SDK had no
 idioms or special mechanics; these things
emerged overtime as a means to scale the system.
There is no getting around some learning, but we argue that is a cheap and worthwhile investment, because:

1. **Familiarity and Intuition**. The idioms we introduce merely implement ideas that are second-nature
to every developer, like inheritance, functional components, entity associations, 
and reflection. If this is intuitive to you, you will have an easy time: 

    kind: Model
    title: "Familiar"
    info: "I am ${get::self>>title} and Intuitive" 
    cached:
      expensive: "get::kind::ManifestVariables->.persistence.storage_class"

1. **Direct Access in Python**. It is hard to overstate the productivity
gain you get from being able to _touch_ not just your descriptors but the 
entire SDK directly in Python via the **[interactive console](/tutorials/kama-console-tutorial)**. 
You can test a hypothesis in seconds:  

    >>> Supplier.inflate({"source": {"x": "y"}, "output": "x"}).resolve()
    [kama_sdk] JQ compile failed: jq: error: x/0 is not defined at <top-level>, line 1:
    # Darn! 
    >>> Supplier.inflate({"source": {"x": "y"}, "output": ".x"}).resolve()
    y
    # Got it!





## Limitations & Planned Improvements

### Schema

### Efficient Listing

### Lego-Style GUI

