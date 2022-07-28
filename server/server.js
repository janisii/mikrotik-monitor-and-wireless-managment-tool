require("dotenv").config();
const fs = require("fs");
const https = require("https");
const express = require("express");
const mysqlConnection = require("./app/database/connection");
const {
  monitorDeviceStatus,
  deviceOnOffScheduler
} = require("./app/device/device");
const {
  wifiStatusRoute,
  wifiOnOffRoute,
  wifiDevicesRoute,
  serverRunningRoute,
  wifiTimeResetRoute
} = require("./app/routes/routes");
const {
  setContentTypeJSON,
  allowOrigin
} = require("./app/middleware/middleware");

const server = express();
const port = process.env.APP_PORT;

server.use(allowOrigin);
server.use(setContentTypeJSON);

server.get("/", serverRunningRoute);
server.get("/wifi-devices/", wifiDevicesRoute);
server.get("/wifi-on-off/", wifiOnOffRoute);
server.get("/wifi-status/", wifiStatusRoute);
server.get("/wifi-device/time-reset/", wifiTimeResetRoute);

// Timer functions to check and update device status
setTimeout(
  monitorDeviceStatus,
  process.env.DEVICE_PING_INITIAL_INTERVAL * 1000
);

const monitorTimerInterval = setInterval(
  monitorDeviceStatus,
  process.env.DEVICE_PING_INTERVAL * 1000
);

const deviceSchedulerTimerInterval = setInterval(
  deviceOnOffScheduler,
  20 * 1000
);

// Starting server if mySQL connection is successful
mysqlConnection.connect(function(err) {
  if (err) {
    return console.error("Could not connect to MySQL server: " + err.message);
  }
  console.log("Connected to the MySQL server.");

  if (process.env.APP_HTTPS === "TRUE") {
    // start https server

    const privateKey = fs.readFileSync(process.env.APP_HTTPS_KEY, "utf8");
    const certificate = fs.readFileSync(process.env.APP_HTTPS_CERT, "utf8");
    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, server);
    httpsServer.listen(port, () => {
      console.log(`HTTPS server running on port ${port}`);
    });
  } else {
    // start http server
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
});
