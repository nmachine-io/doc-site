| Key          | Type                           | Lookback? | Notes                                                                                                                      |
|--------------|--------------------------------|-----------|----------------------------------------------------------------------------------------------------------------------------|
| `source`     | Any                            | No        | By convention, but not necessarily, the main param. Also returned as output if the subclass does not override `_compute()` |
| `serializer` | `jq` \| `native` \| `identity` | No        | Type of serializer that carries out any output formatting given by `output`                                                |
| `output`     | string                         | No        | Expression that defines a mapping function between original output and final output                                        |
| `many`       | `auto` \| `true` \| `false`    | No        | Serializer-specific but generally sets behavior for handling lists outputs                                                 |
