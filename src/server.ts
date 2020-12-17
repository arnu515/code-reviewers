import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";

import session from "express-session";
import { json } from "body-parser";
import sessionFileStore from "session-file-store";
import redis from "redis";
import connectRedis from "connect-redis";

const { PORT, NODE_ENV, REDIS_URL, SECRET, API_URL } = process.env;
const dev = NODE_ENV === "development";

const FileStore = sessionFileStore(session);
const RedisStore = connectRedis(session);

const store = dev
    ? new FileStore({ path: ".sessions" })
    : new RedisStore({
          client: redis.createClient({
              url: REDIS_URL || "redis://localhost:6379/2",
          }),
      });

export default polka() // You can also use Express
    .use(
        json(),
        session({
            secret: SECRET || "nevergonnagiveyouup",
            resave: true,
            saveUninitialized: true,
            cookie: {
                maxAge: 31536000,
            },
            store,
        }),
        compression({ threshold: 0 }),
        sirv("static", { dev }),
        sapper.middleware({
            session: (req, res) => {
                return {
                    accessToken: req.session.accessToken,
                    apiUrl: API_URL || "http://localhost:5000",
                };
            },
        })
    )
    .listen(PORT, (err) => {
        if (err) console.log("error", err);
    });
