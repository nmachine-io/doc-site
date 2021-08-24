---
sidebar_position: 6
sidebar_label: Principles
---

# Design Principles & Philosophy


## Stack Pollution


## Native Programmatic Interface


## CRDs: Automation or Knowledge?

In my experience, the CRD/Operator model can, as it is at least in part intended, increase Kubernetes application 
people-portability but only after a non-negligible learning investment on the part of the inheritor.




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

