| Key       | Type                                           | Note                                                                                                                            |
|-----------|------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `type`    | `server` \| `in_cluster` \| `local_executable` | interpreted by `ktea_provider` to determine which `KteaCient` subclass to use                                                   |
| `uri`     | string or nil                                  | URL or path depending on `type`, e.g or `https://foo.bar/my-ktea` , `https://api.nmachine.io/ktea/<stuff>`,  `~/workspace/my-script.sh` |
| `version` | string                                         | semantic version format e.g "1.93.4"                                                                                            |
