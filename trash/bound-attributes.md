## Bound Attributes

An attribute in a descriptor is **"bound"** if its descriptor's `Model` subclass reads it. You know
which attributes are bound by looking at the Bound Attributes Table in a Model's reference docs.

An attribute that is not read by the wrapping `Model` subclass is **free**. Why would you want
to write attributes that the model does not read? The answer is given
[later in the document](#self-referencing-with-getself).
 
### Universal Bound Attributes

The `Model` base class, and therefore all of its subclasses, 
reads the following attributes:

{@import ./../../partials/common-model-attrs.md}


**Example of a Free Attribute**. Now that we know what the bound attributes for 
a `Model` from the table above, we also know that for `Model` itself, 
_a free attribute is anything not on that list_, such as `"foo"`:
```yaml
kind: Model
id: "i-am-bound"
title: "Me too!"
foo: "I am free!"
```

