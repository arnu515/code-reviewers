# Code Reviewers

A website for developers to upload and review code. [Check it out](https://codereviewers.gq)!

## Quickstart

> **Make sure to have deployed/ran the [backend](https://github.com/arnu515/code-reviewers-backend) first**

### Deploy with DigitalOcean

[![Deploy to DO](https://mp-assets1.sfo2.digitaloceanspaces.com/deploy-to-do/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/arnu515/code-reviewers/tree/master)

You will also need a Redis Database, which is available on DigitalOcean. Create a DigitalOcean Database and add it to your app as a component. Then, create an environment variable called REDIS_URL and set it to the connection string of your database. Format of a connection string should be:

```
redis://user:password@url:port/databasenumber
```

### Manually deploy

Set your environment variables:
```
API_URL=url_of_the_backend_you_deployed_earlier
REDIS_URL=url_of_the_redis_instance
SECRET=a_secret_key_used_to_encrypt_the_user_session
```

#### Deploy with docker

To make deployment easier, there's Docker support. Make sure that `docker` and `docker-compose` are installed on your system.

```sh
$ docker --version
Docker version XX.XX.X, build XXXXXXX
$ docker-compose --version
docker-compose version X.XX.X, build XXXXXXXX
```

Then, use `docker-compose` to run the app.

```sh
$ git clone https://github.com/arnu515/code-reviewers.git code-reviewers
$ cd code-reviewers
$ docker-compose up
```

> You can also use the normal Dockerfile, but you'll need a redis instance available to you

Visit the app at [localhost:3000](http://localhost:3000)

#### "Traditional" method

> You will need to have redis and nodejs with npm installed for this.

1. Clone the repo
```
$ git clone https://github.com/arnu515/code-reviewers.git code-reviewers
$ cd code-reviewers
```

2. Install dependencies
```
$ npm install
```

3. Build and run the app
```
$ npm run build
$ npm start
```

4. Visit your app at [localhost:3000](http://localhost:3000)
