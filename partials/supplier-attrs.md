| Key          | Type                           |  Notes                                                                                                                      |
|--------------|--------------------------------|-----------|----------------------------------------------------------------------------------------------------------------------------|
| `source`     | Any                            |  Often, but not always, the main input. Also the output of a base (non-subclassed) `Supplier`, discounting any `serializer`/`output` transformations.  |
| `serializer` | `jq` \| `native` \| `identity` |  Type of serializer that carries out any output formatting given by `output`                                                |
| `output`     | `str`                         |  Expression that defines a mapping function between original output and final output                                        |
| `many`       | `None` \| `True` \| `False`    |  Serializer-specific but generally sets behavior for handling lists outputs                                                 |
