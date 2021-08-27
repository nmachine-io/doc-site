---
sidebar_label: Predicates
sidebar_position: 1
---

# Predicate

## The `Predicate` Model

A `Predicate` models a boolean function - one that usually compares two operands - 
given by the attributes `challenge` and `check_against`. An example predicate that checks 
whether `5 > 4`:

```yaml title="examples/descriptors/computers/predicates.yaml"
kind: Predicate
id: "greater-than-four"
operator: ">"
check_against: 4
```  

Result:

```python title="$ python main.py console"
>>> predicate = Predicate.inflate("greater-than-four", patch={'challenge': 5})
>>> predicate.resolve()
True

>>> predicate = Predicate.inflate("greater-than-four", patch={'challenge': 3})
>>> predicate.resolve()
False
```


### Attributes Table

| Key                      | Type    | Notes                                                                  |
|--------------------------|--------|---------|----------|------------------------------------------------------------------------|
| `challenge` **required** | `Any`  | Left operand if a binary operation, or sole operand if unary operation |
| `check_against`          | `Any`  | Right operand if a binary operation, ignored otherwise                 |
| `operator`               | `str`  | Logical operator. See list for supported operator                      |
| `negate`                 | `bool` | If true, flips the original computation's result                        |
| `reason`                 | `str`  | Message to be displayed to the user if evaluates to false              |
| `fatal` (`True`)         | `bool` | Used by called to determine what happens if evaluates to false         |




### Operators

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

| `operator` (aliases) | `challenge`    | `check_against`    | True Examples                                                         |
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











## The `MultiPredicate` Model

Use the `MultiPredicate` subclass to perform AND/OR operations on other predicates.


### Example:

```yaml title="examples/descriptors/computers/predicates.yaml"
kind: MultiPredicate
id: "true-and-false"
operator: and
predicates:

  - kind: Predicate
    challenge: "foo"
    check_against: "foo"

  - kind: Predicate
    challenge: "bar"
    check_against: "baz
```

Result:

```python title="$ python main.py console"
>>> predicate = Predicate.inflate("true-and-false")
>>> predicate.resolve()
False
```

The legal operator values are `and` and `or` in lower case. Anything else
returns `False` automatically.






## The `FormatPredicate` Model

Use the `FormatPredicate` to check various properties of strings:

| `check_against`   | True Examples             | False Examples         |
|-------------------|---------------------------|-----------------------|
| `number`          | `0`, `-1.0`, `".3"`, `2e10`     | `"1x"`, `False`, `[]` |
| `positive-number` | `1`, `"2"`                | `0`, `"-1"`           |
| `email`           | `info@nmachine.io`        | `foo`, `1`            |
| `boolean`         | `True`, `"False"`, `true` | `1`, `"yes"`            |
| `domain`          | `"foo.bar"`               | `"foo dot bar"`       |
| `path`            | `"/foo/bar.baz"`          | `"foo/bar"`           |

Note that the `operator` attribute is **ignored**.








## Writing Custom Predicates

### Overriding `perform_comparison()`

Creating your own predicate is easy: create a `Predicate`
subclass and implement `perform_comparison()`. An example custom predicate 
that checks whether one number is a multiple of another:


```python title="models/predicates/arithmetic_predicates.py"
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
  def get_challenge() -> Dict:
    raw = super(JsonChallengePredicate, self).check_against()
    return json.loads(raw)
```
