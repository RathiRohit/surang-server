<p align="center">
  <img width="40%" src="surang.png" alt="Surang logo"/>
</p>

<p align="center">
  A self-hostable WebSocket based tunneling solution to expose your localhost. 🚀
</p>

---

<br/>

> This is Surang server repository.
> Check out [surang](https://github.com/RathiRohit/surang) for client installation.

Surang allows you to expose your localhost server to the world through WebSocket based
one-to-one tunnel. Surang is created to be easy to host on most of the hosting
platforms that support NodeJS (read more at [How is Surang different from localtunnel?]()).

#### Server requirements:
- Surang uses WebSocket connection to tunnel the traffic, hence hosting platform needs to
  support WebSocket communication with NodeJS.
- Though not mandatory, having `https` & `wss` support is recommended.
  (if not possible, Surang client can be configured to use `http` & `ws`.)

# Steps to host your Surang server:

- Clone or Download the server code from this repository.

- Follow NodeJS server hosting instructions for your respective cloud platforms.
- Surang server uses `PORT` & `AUTH_KEY` environment variables, you will need to
  set these on your server dashboard.
  - `PORT`: This port will be used to listen with express server on it. Most cloud
    platforms like Heroku configure this variable by default to proper TCP port.
    
    *If not defined, server will use 7000 port by default.*
    
  - `AUTH_KEY`: You can set this to be any secret string. This will be used by server
    to authenticate incoming client connection. Once defined on server environment,
    you will also need to configure the same secret key on your Surang client as
    mentioned [here](https://github.com/RathiRohit/surang#cli-usage).
    AUTH_KEY is essential to prevent someone else from using your Surang server.
    
    *If not defined, server will treat all clients as unauthorized. This is
    intentionally done so, to avoid skipping AUTH_KEY setup.*

---

Once server is up, install and configure your
[Surang client](https://github.com/RathiRohit/surang) to match server configuration
as instructed in client's README.

---

## Running server on local machine:
Install all dependencies with `yarn install` and then run:

```
yarn start
```

This starts server on PORT defined in environment variable or 7000.

You need to configure AUTH_KEY in your local environment variables.

(You can also create `.env` file in root directory of server to define PORT & AUTH_KEY as
per dotenv standard.)

---

#### How is Surang different from [localtunnel](https://github.com/localtunnel/localtunnel)?

'localtunnel' is great. It's open-source, free, supports multiple clients at once, and
you can host your own localtunnel server too. Unfortunately, localtunnel uses
TCP connections over non-root TCP ports. This can be troublesome if you want to
host your own server, as most of the cloud platforms with free tiers don't give this much
freedom to us (and our servers). On the other hand WebSockets are now widely supported on
cloud hosting platforms.

(PS: I got inspired to write this library, when I realised that [localtunnel can not be
hosted on Heroku's free tier](https://github.com/localtunnel/server/issues/88).)

  - `localtunnel` uses TCP connections, `surang` uses WebSocket connection to do the trick.
  - `localtunnel` cannot be hosted on platforms which don't support it's
    [requirements](https://github.com/localtunnel/server#overview), `surang` should be
    easier to host as WebSockets are widely supported nowadays.
  - `localtunnel` allows multiple client connections with single server, `surang` doesn't (yet).
    Everyone is supposed to host their own surang-server.
  - `localtunnel` is mature and has great community, `surang` is in early phase and might not
    work for all types of requests yet.
