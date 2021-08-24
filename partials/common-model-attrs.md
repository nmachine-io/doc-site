| Key            | Type   | Info                                                                                                               |
|----------------|--------|--------------------------------------------------------------------------------------------------------------------|
| `kind`         | string **required** | name of the `Model` subclass that should load this descriptor                                                      |
| `id`           | string **required** | id used for referencing. should be unique within `kind`. should be descriptive e.g `"operation.restore-datatbase"` |
| `space`        | string | [space](/concepts/spaces-concept) this model belongs to                                                            |
| `config_space` | string | used by subclasses that make use of the [Kamafile](/concepts/kamafile-concept), ignored otherwise             |
| `title`        | string | rendered in the NMachine client for some models                                                                    |
| `info`         | string | rendered in the NMachine client for some models                                                                    |
| `labels`       | dict   | for you (the publisher) to query your own models; identical to Kubernetes resources                                |
| `synopsis`     | string | rendered in the NMachine client for some models                                                                    |
| `cached`       | dict   | explained later                                                                                                    |
