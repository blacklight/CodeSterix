Change both conf.php and conf_secret.php to match your webserver/database/API configuration.

# IMPORTANT

If you are a collaborator, and you want to test/run the code using real credentials, run `git update-index --assume-unchanged conf_secret.php` so those changes won't be pushed.

# PHP configuration

Enable the following modules in your `php.ini`:

* `curl`
* `raphf`
* `http`
* `mysql`
* `mysqli`
* `pdo_mysql`
* `openssl`
* `phar`

## PHP third party dependencies

In order to install PHP dependencies (e.g. log4php) run:

```
$ php composer.phar install
```

# WebSocket server

The websocket server (needed for live changes in the current stream and for client heartbeats) is located under ws/server.js, and it requires Node.js to run. The default port is 8080, but it can be changed in the file itself.

You also need both websocket and jquery modules for node.js:

```
$ npm instal ws
$ npm instal jsdom
$ npm install jquery
$ npm install log4js
$ npm install xmlhttprequest
```

Then change the configuration in ws/config.js, and start the websocket server:

```
$ cd ws/
$ ./start_ws.sh
```

You can also stop it anytime with:

```
$ cd ws/
$ ./stop_ws.sh
```

