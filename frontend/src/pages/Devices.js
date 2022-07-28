import React, { Component } from "react";
import {
  fetchDevices,
  triggerWifiOnOff,
  triggerWifiTimeReset
} from "../helpers/fetch";
import * as moment from "moment";

import Navbar from "../components/Navbar/Navbar";
import DeviceList from "../components/DeviceList/DeviceList";
import ActiveConnectionList from "../components/ActiveConnectionList/ActiveConnectionList";
import Spinner from "../components/Spinner/Spinner";
import Error from "../components/Error/Error";
import Search from "../components/Search/Search";
import Modal from "../components/Modal/Modal";

class Devices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      isLoading: false,
      isSearch: false,
      activeDevices: props.activeDevices ? true : false,
      activeDeviceItems: [],
      selectedDevice: null,
      refresh: null
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.fetchingDevices(false);
    // fetch devices info in background
    this.intervalFetchDevices = setInterval(
      this.fetchingDevices.bind(this, true),
      process.env.REACT_APP_FETCH_ENDPOINT_INTERVAL * 1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalFetchDevices);
  }

  /**
   * Fetching devices from API
   */
  fetchingDevices(inBackground) {
    if (inBackground && this.state.isSearch) {
      return;
    }
    fetchDevices()
      .then(devices => {
        if (typeof devices === "undefined") {
          this.setState({ isLoading: false });
          return;
        }

        devices = this.setWifiOnTimeLeft(devices);
        const activeDeviceItems = this.filterActiveWifiDevices(devices);

        if (this.state.activeDevices) {
          devices = activeDeviceItems;
        }

        if (typeof devices === "undefined") {
          devices = [];
        }
        this.setState({ devices: [] });
        this.setState({
          devices,
          isLoading: false,
          activeDeviceItems: activeDeviceItems
        });
      })
      .catch(err => {
        this.setState({ isLoading: false, activeDeviceItems: [] });
        console.log(err);
      });
  }

  /**
   * Set wifi on time left
   * @param {*} devices
   */
  setWifiOnTimeLeft(devices) {
    return devices.map(item => {
      if (item.device.wifi_status === 0 || item.device.wifi_force_on === 1) {
        item.device.wifi_time_left = -1;
        return item;
      }
      const now = moment(new Date());
      const wifiOnTimeLimit = moment(item.device.last_wifi_active).add(
        +process.env.REACT_APP_WIFI_ON_INTERVAL,
        "m"
      );
      const minutesLeft = wifiOnTimeLimit.diff(now, "minutes");
      item.device.wifi_time_left = minutesLeft + 1;
      return item;
    });
  }

  /**
   * Filtering devices with WIFI on
   * @param {*} devices
   */
  filterActiveWifiDevices(devices) {
    return devices.filter(item => {
      return item.device.wifi_status === 1;
    });
  }

  /**
   * Handle wifi on/off switch
   */
  handleWifiOnOffSwitch = deviceId => {
    triggerWifiOnOff(deviceId)
      .then(result => {
        const status = result.wifiStatus;
        this.setState(prevState => {
          const devices = [...prevState.devices];
          let updateDevices = devices.map(item => {
            const device = item.device;
            if (device.id === deviceId) {
              device.wifi_status = status === "on" ? 1 : 0;
              device.last_wifi_active =
                status === "on"
                  ? moment(new Date(), moment.HTML5_FMT.DATETIME_LOCAL).add(
                      -1,
                      "seconds"
                    )
                  : null;
            }
            return { device: device };
          });
          updateDevices = this.setWifiOnTimeLeft(updateDevices);
          const activeDeviceItems = this.filterActiveWifiDevices(updateDevices);
          return {
            devices: updateDevices,
            activeDeviceItems: activeDeviceItems
          };
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  /**
   * Handle search switch
   */
  handleSearchSwitch = () => {
    this.setState({ isSearch: !this.state.isSearch });
  };

  /**
   * Handle search items
   */
  handleSearch = query => {
    if (query.length === 0) {
      this.fetchingDevices();
    }
    const regex = new RegExp(query, "gi");
    const filteredDevices = this.state.devices.filter(item => {
      return (
        item.device.title.match(regex) || item.device.near_rooms.match(regex)
      );
    });
    this.setState({ devices: filteredDevices });
  };

  /**
   * Show Actice connections modal
   */
  handleModalActiveConnections = deviceId => {
    const selectedDevice = this.state.devices.find(item => {
      return item.device.id === deviceId;
    });
    if (selectedDevice) {
      document.querySelector("html").classList.add("is-clipped");
      selectedDevice.device.activeConnections.sort((a, b) => {
        return +a.signalStrengthCh0 - +b.signalStrengthCh0;
      });
      this.setState({ selectedDevice: selectedDevice.device });
    }
  };

  /**
   * Close Active connections modal
   */
  handleModalActiveConnectionsClose = () => {
    document.querySelector("html").classList.remove("is-clipped");
    this.setState({ selectedDevice: null });
  };

  /**
   * Handle wifi time reset without turning physical wifi on/off
   */
  handleWifiTimeReset = deviceId => {
    triggerWifiTimeReset(deviceId)
      .then(() => {
        this.setState(prevState => {
          const devices = [...prevState.devices];
          let updateDevices = devices.map(item => {
            const device = item.device;
            if (device.id === deviceId) {
              device.last_wifi_active =
                device.wifi_status === 1
                  ? moment(new Date(), moment.HTML5_FMT.DATETIME_LOCAL).add(
                      -1,
                      "seconds"
                    )
                  : null;
            }
            return { device: device };
          });
          updateDevices = this.setWifiOnTimeLeft(updateDevices);
          return {
            devices: updateDevices
          };
        });
      })
      .catch(err => console.log(err));
  };

  render() {
    return (
      <div className="App">
        <Navbar
          handleSearchSwitch={this.handleSearchSwitch}
          activeDeviceItems={this.state.activeDeviceItems}
        />
        {this.state.isSearch && (
          <Search
            handleSearch={this.handleSearch}
            handleSearchSwitch={this.handleSearchSwitch}
          />
        )}
        {this.state.isLoading ? (
          <Spinner />
        ) : this.state.devices.length > 0 ? (
          <DeviceList
            devices={this.state.devices}
            handleWifiOnOffSwitch={this.handleWifiOnOffSwitch}
            handleWifiTimeReset={this.handleWifiTimeReset}
            handleModalActiveConnections={this.handleModalActiveConnections}
            isSearch={this.state.isSearch}
            title={
              this.state.activeDevices
                ? "Aktīvās apraides iekārtas"
                : "Apraides iekārtu saraksts"
            }
          />
        ) : this.state.isSearch && this.state.devices.length === 0 ? (
          <div className="section">
            <div className="container">
              <Error message="Iekārta nav atrasta vai arī izvēlētajā kabinetā bezvadu internets nav pieejams. Mēģiniet meklēt pēc cita atslēgas vārda!" />
            </div>
          </div>
        ) : (
          <div className="section">
            <div className="container">
              <Error message="Savienojuma kļūda ar API serveri. Mēģiniet ielādēt lapu atkāroti pēc brīža." />
            </div>
          </div>
        )}
        {this.state.selectedDevice && (
          <Modal
            title={`Pieslēgto iekārtu saraksts (${
              this.state.selectedDevice.title
            })`}
            isActive={this.state.selectedDevice !== null}
            closeModal={this.handleModalActiveConnectionsClose}
            modalClassName="active-connections"
          >
            <ActiveConnectionList
              connections={this.state.selectedDevice.activeConnections}
            />
          </Modal>
        )}
      </div>
    );
  }
}

export default Devices;
