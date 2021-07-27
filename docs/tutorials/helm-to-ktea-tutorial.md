---
sidebar_position: 2
sidebar_label: Helm to KTEA
---

# Serve a Helm Chart as a KTEA Server

## Synopsis

**Objective**. We have a working Helm chart that we want to turn into a 
[KTEA](concepts/ktea-concept.md) server.
That is, we want to invoke our chart's templating logic over HTTP, going from 
`resources=$(helm template foo .)` to `resources=$(curl -X POST localhost:5005/template)`.

**Prerequisites**. You must have a working Helm v3 chart. Make sure that the two following
commands output the expected text:

```shell script
helm template foo .
helm show values
``` 

**Overview**. Fortunately, this process is made simple thanks to a pre-built 
script that routes HTTP request to the local Helm executable. All you have to do
is create a Docker container that holds both your Helm code and the script
we mentioned.

## Step 1: Add the Dockerfile 

In your chart's home directory, create a Dockerfile with:

```dockerfile title="/your-helm-project-root"
FROM us-central1-docker.pkg.dev/nectar-bazaar/public/helm2api:1.0.1
WORKDIR /app
ADD . .
CMD ["server"]
```

That's it! Now to use it: 

```shell title="/your-helm-project-root"
docker build . -t ktea
docker run -p 5005:5005 ktea
curl -X POST localhost:5005/template
```

If you want an under-the-hood view of how this works, read the 
[Any to KTEA](/tutorials/any-to-ktea.md) tutorial.
