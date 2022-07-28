const {
  getAciveRouterById,
  getAciveRouters,
  updateRouterLastWifiActiveDate
} = require("../database/queries");
const {
  wifiStatus,
  wifiOnOff,
  wifiActiveConnections
} = require("../device/device");

const serverRunningRoute = (req, res) => {
  res.send(JSON.stringify({ status: "Server is running.." }));
};

const wifiTimeResetRoute = async (req, res) => {
  const { routerId } = req.query;
  try {
    await updateRouterLastWifiActiveDate(routerId);
    return res.send(JSON.stringify({ status: "Time reset done." }));
  } catch (err) {
    res.send(JSON.stringify({ error: err }));
    throw err;
  }
};

/**
 * Route for wifi status
 *
 * @param {*} req
 * @param {*} res
 */
const wifiStatusRoute = async (req, res) => {
  const { routerId } = req.query;

  try {
    const rows = await getAciveRouterById(routerId);

    if (rows.length === 0) {
      return res.send(JSON.stringify({ error: "Device is not found." }));
    }

    const device = rows[0];
    const status = await wifiStatus(device);
    return res.send(JSON.stringify(status));
  } catch (err) {
    res.send(JSON.stringify({ error: err }));
    throw err;
  }
};

/**
 * Route for turning wifi on/off
 * @param {*} req
 * @param {*} res
 */
const wifiOnOffRoute = async (req, res) => {
  const { routerId } = req.query;

  try {
    const rows = await getAciveRouterById(routerId);

    if (rows.length === 0) {
      return res.send(JSON.stringify({ error: "Device is not found." }));
    }

    const device = rows[0];
    const status = await wifiOnOff(device);
    return res.send(JSON.stringify(status));
  } catch (err) {
    res.send(JSON.stringify({ error: err }));
    throw err;
  }
};

/**
 * Route for fetching all devices with active connections
 * @param {*} req
 * @param {*} res
 */
const wifiDevicesRoute = async (req, res) => {
  try {
    let devices = await getAciveRouters();

    if (devices.length === 0) {
      return res.send(JSON.stringify({ error: "Devices not found." }));
    }

    devices = await loadWifiActiveConnections(devices);

    res.send(JSON.stringify({ devices }));
  } catch (err) {
    res.send(JSON.stringify({ error: err }));
    throw err;
  }
};

/**
 * Fetching active connections from devices in async/await mode
 * @param {*} devices
 */
const loadWifiActiveConnections = devices => {
  const promises = devices.map(async device => {
    device.activeConnections = [];
    if (device.device_status === 1) {
      device.activeConnections = await wifiActiveConnections(device);
    }
    return { device };
  });
  return Promise.all(promises);
};

module.exports = {
  wifiStatusRoute,
  wifiOnOffRoute,
  wifiDevicesRoute,
  serverRunningRoute,
  wifiTimeResetRoute
};
