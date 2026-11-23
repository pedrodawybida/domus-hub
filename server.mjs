// The legacy HTML contains the decks inline. Serve the authenticated Next app.
import next from "next";
import http from "node:http";

const port = Number(process.env.PORT || 3000);
const app = next({ dev: process.env.NODE_ENV !== "production", port });
await app.prepare();
http.createServer(app.getRequestHandler()).listen(port);
