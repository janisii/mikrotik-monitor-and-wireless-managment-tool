import axios from "axios";

export function fetchDevices() {
  return axios
    .get(process.env.REACT_APP_API_ENDPOINT + "/wifi-devices/")
    .then(result => {
      return result.data.devices;
    })
    .catch(err => console.log(err));
}

export function triggerWifiOnOff(routerId) {
  return axios
    .get(
      process.env.REACT_APP_API_ENDPOINT + "/wifi-on-off/?routerId=" + routerId
    )
    .then(result => {
      return result.data;
    })
    .catch(err => console.log(err));
}

export function triggerWifiTimeReset(routerId) {
  return axios
    .get(
      process.env.REACT_APP_API_ENDPOINT +
        "/wifi-device/time-reset/?routerId=" +
        routerId
    )
    .then(result => {
      return result.data;
    })
    .catch(err => console.log(err));
}
