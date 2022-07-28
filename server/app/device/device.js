require("dotenv").config();
const RouterOSClient = require("routeros-client").RouterOSClient;
const {
  updateRouterLastWifiActiveDate,
  updateRouterWifiActiveStateOff,
  updateDbDeviceStatus,
  updateDbDeviceWifiStatus,
  getAciveRouters,
  getDeviceOnSchedules,
  getDeviceOffSchedules,
  updateDbDeviceWifiForceOnStatus
} = require("../database/queries");
const { getDiffDateTime } = require("../helpers/Date");

/**
 * Connect to ROS device
 * @param {*} ipAddr
 */
const routerConnection = ipAddr => {
  const ros = new RouterOSClient({
    host: ipAddr,
    user: process.env.ROUTER_API_USER,
    password: process.env.ROUTER_API_PASS,
    timeout: 2,
    keepalive: true
  });

  ros.on("error", err => {
    console.log(err);
  });

  return ros;
};

/**
 * Update wifi status in database
 * @param {*} status
 * @param {*} routerId
 */
const updateDbWifiStatus = (status, routerId) => {
  if (status === false) {
    updateRouterLastWifiActiveDate(routerId);
  } else {
    updateRouterWifiActiveStateOff(routerId);
  }
};

/**
 * Ping device and update status in database to sync current status
 * @param {*} device
 */
const pingDevice = device => {
  deviceIdentity(device)
    .then(result => {
      updateDbDeviceStatus(device.id, result.name === device.title);
      if (result.name === device.title) {
        wifiStatus(device)
          .then(wifiStatusResult => {
            updateDbDeviceWifiStatus(
              device.id,
              wifiStatusResult.wifiStatus === "on"
            );
          })
          .catch(err => {
            console.log(err);
          });
      }
    })
    .catch(err => {
      console.log(err);
    });
};

/**
 * Switch off wifi for the device
 * @param {*} device
 */
const switchWifiOff = device => {
  if (device.wifi_force_on === 1) {
    return;
  }

  if (device.last_wifi_active === null) {
    return;
  }

  const minutesSinceLastWifiActive = Math.floor(
    getDiffDateTime(new Date(), new Date(device.last_wifi_active)) / 60
  );

  // turn off wifi only when time interval met
  if (minutesSinceLastWifiActive <= +process.env.WIFI_ON_INTERVAL) {
    return;
  }

  wifiStatus(device)
    .then(result => {
      if (result.wifiStatus === "on") {
        // turn off only device which has wifi on
        wifiOnOff(device)
          .then(result => {
            if (result.wifiStatus === "off") {
              console.log(`Wifi switched off for device: ${device.title}`);
            }
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => {
      console.log(err);
    });
};

/**
 * Turn RouterOS device WIFI ON/OFF
 * @param {*} device
 */
const wifiOnOff = device => {
  const deviceIpAddr = device.ip_addr;
  const ros = routerConnection(deviceIpAddr);
  return ros
    .connect()
    .then(client => {
      const wirelessMenu = client.menu("/interface wireless");
      return wirelessMenu
        .where("name", "ap-skola-ipad")
        .getOnly()
        .then(response => {
          const status = response.disabled;
          return wirelessMenu.where("id", response.id).update({
            disabled: !status
          });
        });
    })
    .then(result => {
      // update mysql database
      updateDbWifiStatus(result.disabled, device.id);
      ros.close();
      return { wifiStatus: result.disabled === false ? "on" : "off" };
    })
    .catch(err => {
      console.log(err);
      return { error: err };
    });
};

/**
 * Get RouterOS device WIFI status
 * @param {*} device
 */
const wifiStatus = device => {
  const deviceIpAddr = device.ip_addr;
  const ros = routerConnection(deviceIpAddr);
  return ros
    .connect()
    .then(client => {
      return client
        .menu("/interface wireless")
        .where("name", "ap-skola-ipad")
        .getOnly();
    })
    .then(result => {
      ros.close();
      return { wifiStatus: result.disabled === false ? "on" : "off" };
    })
    .catch(err => {
      console.log(err);
      return { error: err };
    });
};

/**
 * Get Active connections list from WIFI device
 * @param {*} device
 */
const wifiActiveConnections = device => {
  const deviceIpAddr = device.ip_addr;
  const ros = routerConnection(deviceIpAddr);
  return ros
    .connect()
    .then(client => {
      return client
        .menu("/interface wireless registration-table")
        .where("interface", "ap-skola-ipad")
        .get();
    })
    .then(result => {
      ros.close();
      return [...result];
    })
    .catch(err => {
      console.log(err);
      return { error: err };
    });
};

/**
 * Get RouterOS device Identity
 * @param {*} device
 */
const deviceIdentity = device => {
  const deviceIpAddr = device.ip_addr;
  const ros = routerConnection(deviceIpAddr);
  return ros
    .connect()
    .then(client => {
      return client.menu("/system identity").getOnly();
    })
    .then(result => {
      ros.close();
      return { name: result.name };
    })
    .catch(err => {
      console.log(err);
      return { error: err };
    });
};

/**
 * Monitor all devices
 */
const monitorDeviceStatus = () => {
  getAciveRouters()
    .then(rows => {
      rows.map(device => {
        pingDevice(device);
        switchWifiOff(device);
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const deviceOnOffScheduler = async () => {
  const turnOnWifi = await getDeviceOnSchedules();
  turnOnWifi.map(device => {
    updateDbDeviceWifiForceOnStatus(device.router_id, 1);
    wifiOnOff({ id: device.router_id, ip_addr: device.ip_addr });
  });

  const turnOffWifi = await getDeviceOffSchedules();
  turnOffWifi.map(device => {
    updateDbDeviceWifiForceOnStatus(device.router_id, 0);
    wifiOnOff({ id: device.router_id, ip_addr: device.ip_addr });
  });
};

module.exports = {
  wifiStatus,
  wifiOnOff,
  monitorDeviceStatus,
  wifiActiveConnections,
  deviceOnOffScheduler
};
