---
title: Predicates
sidebar_label: Overview
sidebar_position: 0
---

A `Predicate` is a special [`Supplier`](/models/suppliers/supplier-overview) 
that can only resolve to `True/False`. Most predicates work by comparing 
two values: `challenge` and `check_against`. A simple predicate check 
to whether `5` is more than `4` in YAML would be:

```yaml
kind: Predicate
id: trivial-predicate
operator: greater-than
challenge: 5
check_against: 4
```  

Every `Predicate` is a subclass of `Supplier`, so the above would return `True` 
when resolved:

```python
predicate = Predicate.inflate('trivial-predicate')
print(f"5 > 4: {predicate.resolve()}")
>> 5 > 4: True
```

## Operators

The value of `challenge` will be interpreted as the **left hand operand** in the 
comparison, and `check_against` will be the **right hand operand**. Thus, the following
config is **not** equivalent to one where `challenge` and `check_against` 
are swapped around:

```yaml
operator: ">"
challenge: 2
check_against 1
# True now but False if challenge/check_against swapped values
``` 

Any `Predicate` or its subclass can perform the following:

| `operator` (aliases) | `challenge`    | `predicate`    | True if                                                         |
|----------------------|----------------|----------------|-----------------------------------------------------------------|
| `equals` (`==`)          | Any            | Any            | `"foo" == "foo"'`, `1 == 1`, `3 == "3"`, `None == None`         |
| `not-equals` (`!=`, `=/=`) | Any            | Any            | Opposite of `equals`                                            |
| `greater-than` (`>`)     | Number         | Number         | `3 > 2`, `3.0 > "2"`                                            |
| `gte` (`>=`)             | Number         | Number         | `3 >= 2`, `3.0 >= "3"`                                          |
| `less-than` (`<`)        | Number         | Number         | self explanatory                                                |
| `lte` (`<=`)             | Number         | Number         | self explanatory                                                |
| `falsy` (`falsiness`, `nullish`)    | Any            | N/A            | `False`, `"false"`, `"null"`, empty strings/sets/dicts                    |
| `truthy` (`truthiness`)  | Any            | N/A            | Opposite of `falsy`                                             |
| is-in (`in`)           | Scalar         | List or string | `2 in [1, 2]` and `"i" in "hi"`                                 |
| `contains`             | List or string | Scalar         | `in` operator with `challenge` and `check_against` swapped      |
| `contains-only` (`only`) | List or string | List or scalar | `[2, 2] contains-only [2]` and `[2, 2, 2] contains-only [2, 2]` |

### Dealing with Lists

If the `challenge` is a list, the Predicate will behave according to the `many_policy` attribute
supplied. Explained by example:

| `many_policy`    | `operator` example | `challenge` example | `check_against` example | Result |
|--------------|--------------------|---------------------|-------------------------|--------|
| `each_true`  | `greater-than`     | [1, 2, 3]           | 0                       | True   |
| `each_false` | `greater-than`     | [1, 2, 3]           | 2                       | False  |
| `some_true`  | `truthy`           | [True, False]       |                         | True   |
| `some_false` | `in`               | ['a', 'b', 'c']     | "abc"                   | False  |  




## Writing Custom Predicates

### Overriding `perform_comparison()`

Creating your own predicate is very simple: simply create a `Predicate`
subclass and implement `perform_comparison()`. A custom predicate to check whether
one number is a multiple of another could be:


```python
from kama_sdk.model.supplier.predicate.predicate import Predicate

class MultiplicityPredicate(Predicate):
  def perform_comparison(self, operator, challenge, check_against, on_many):
    return int(challenge) % int(check_against) == 0

```

As with any custom `Supplier` subclass, you can make the final computation
as complex as necessary, but is important you do **not** override the 
`resolve` or `compute` instance methods directly. 


### Overriding `get_challenge()` and `get_check_against()`

A common requirement is to perform a standard unary/binary comparison 
provided by the base class, but to transform the challenge/check 
in a special way. Overriding the challenge/check_against getter methods
achieves this elegantly:

```python
import json
from kama_sdk.model.supplier.predicate.predicate import Predicate

class JsonChallengePredicate(Predicate):
  def challenge() -> Dict:
    raw = super(JsonChallengePredicate, self).check_against()
    return json.loads(raw)
```


## Attributes

#### `challenge` **required**
Left hand operand in any binary comparison (see [Operatorss](#operators)) 

#### `check_against`  | default: `None`
Right hand operand in any binary comparison (see [Operatorss](#operators)) 

#### `operator` | default: `"equals"`
Binary or unary operator to be used to on `challenge` and/or `check_against (see [Operatorss](#operators)). 


#### `negate` | default: `False`
Flip the original boolean result of the computation. The following would return True:
```yaml
kind: Predicate
operator: truthy
challenge: null
negate: true 
```

#### `early_true_if`, default: `None`
Provides a shorter alternative to writing nested predicates.
```yaml
kind: Predicate
early_true_if: get::id::another-predicate
# main logic
``` 

#### `early_false_if`
Self explanatory.


#### `reason` | default: `None`
Text to be displayed to the user if this predicate is user-facing.

#### `tone` | default: `error`
Signals to the user whether or not a negative result is "fatal" or not.
