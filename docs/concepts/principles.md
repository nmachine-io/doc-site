---
sidebar_position: 6
sidebar_label: Principles
---

# Guiding Principles

This page lays out some of the high level principles and ideas that informed the _why_'s, _what_'s, and 
_how_'s of NMachine. 


## Zero Tolerance for Stack Pollution 

Our single strongest conviction in designing NMachine was not to pollute the user's tech stack. 
That is, NMachine should never be _inside_ or _around_ any of the
user's core cloud native components. Instead, our software should live _next to_ them, 
such that: 
1. **Contracts Stay Intact.** Every existing inter and intra-component channel of communication must remain intact. No
interception or side effects that make future problems nearly impossible to troubleshoot.
2. **Front Doors remain Front Doors.** Resist the all-too-common temptation to replace the standard control
plane and _provide backdoor access_, as the reality is all too often that this new backdoor introduces variability.

In short: _complement and delight_, don't _"enhance" and frustrate_.   

![](/img/concepts/pollution.png)




## SDKs are best APIs

The original plan for the **[KAMA SDK](/concepts/kama-concept)** was to _hide_ Python as much
as possible, reasoning that we should not burden developers with _another concern_ on top 
of descriptors. However, as the SDK grew, we increasingly saw the direct Python interface _as an advantage_.
   







## Heroku for K8s: 1 is a Dream, N is a Possibility  








## CRDs: Automation or Knowledge?

In my experience, the CRD/Operator model can, as it is at least in part intended, increase Kubernetes application 
people-portability but only after a non-negligible learning investment on the part of the inheritor.

## "As-code" Always Wins

Even if it's low code.


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

