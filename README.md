### Simple Wep API for exporting zipping and sending LabArchives Notebooks

This is a prototype for a labarchives microservice exporter


### How to use

```shell
npm install
```

Create a file in config directory. Use config/config.development.json as example

set environment variable it will get used as config file

example:

`NODE_ENV=test` will use `config/config.test.json`

you can also specify the config file

`node ./bin/www configuration.file.json`

#### Docker compose

If NODE_ENV = test, create file:

`config/config.test.json`

Build and up

```shell
NODE_ENV=test;docker-compose -f docker-compose.yml up --build
``` 

# TODOs

- Add logger
- Improve header sec
