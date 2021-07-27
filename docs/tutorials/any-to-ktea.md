---
sidebar_position: 3
sidebar_label: Any to KTEA
---

# Serve anything as a KTEA Server

If you're using a templating engine other than Helm or Kerbi, you can 
still serve it as a [KTEA](/concepts/ktea-concept.md) without too much effort. You just need to build
your own request -> command args forwarder.

## Your Templating Engine

You need to have a script or a binary that you can invoke as a shell command. That 
script needs to perform the basic operations KTEA operations explained in the 
[Concepts](/concepts/ktea-concept.md). 

Let us say this script/binary is located at `$HOME/scripts/my-templater`. We will,
refer to the script/binary itself as `my-templater`.


## The `ktea-executable-server`

The `ktea-executable-server` is an 
[open-source](https://github.com/nmachine-io/ktea-executable-server) 
NMachine-maintained Flask app. It exposes an HTTP API with all the 
mandatory KTEA routes. On parsing a request (say `GET /values`), 
it will expect a local script/binary to exist at `$KTEA_EXECUTABLE`
and invoke it using the action and args from the request. The actual source
for `GET /values`:
```python
@app.route('/values')
def values():
  values_dict = exec_yaml_cmd(f"{executable} show values . {fmt_cmd_args()}")
  return jsonify(data=values_dict)
```

As you can see, it runs `{executable} show values . {fmt_cmd_args()}` as a shell 
command. Your job, if you want to support a new templating engine, is to 
make sure that the shell commands that `ktea-executable-server` runs map
onto your script/binary. 


## Setup

As mentioned above, the `ktea-executable-server` will format commands in a certain
way, and expect your executable to understand. Your work will be to go through
each command and manipulate the command strings as necessary. 


## Command Formats



### Show Values


### Do Template


### Show Presets (optional)


