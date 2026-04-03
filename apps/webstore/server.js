const fs = require("fs");
const { createServer: createHttpServer } = require("http");
const { createServer: createHttpsServer } = require("https");
const next = require("next");

const dev = false;
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT, 10) || 3000;
const isIngressEnabled = process.env.IS_INGRESS_ENABLED === "true";

const app = next({ dev, dir: "apps/webstore" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const serverCallback = (req, res) => handle(req, res);

  if (isIngressEnabled) {
    // Use HTTP (no SSL)
    createHttpServer(serverCallback).listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`> HTTP Server ready on http://${hostname}:${port}`);
    });
  } else {
    // Use HTTPS with SSL cert
    const sslOptions = {
      key: fs.readFileSync("./ssl/amla.io.key"),
      cert: fs.readFileSync("./ssl/amla.io.crt"),
    };

    createHttpsServer(sslOptions, serverCallback).listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`> HTTPS Server ready on https://${hostname}:${port}`);
    });
  }
});
