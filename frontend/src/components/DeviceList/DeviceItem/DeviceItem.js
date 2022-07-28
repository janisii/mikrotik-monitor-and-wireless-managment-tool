import React, { Component } from "react";
import OnOffSwitch from "../../OnOffSwitch/OnOffSwitch";
import "./DeviceItem.css";

class DeviceItem extends Component {
  constructor(props) {
    super(props);
    this.device = this.props.device;
  }

  render() {
    let wifiClassNames = "icon wifi";
    let networkClassNames = "icon network";

    wifiClassNames +=
      this.device.wifi_status === 0
        ? " is-down"
        : this.device.wifi_status === 1
        ? " is-on"
        : "";

    networkClassNames +=
      this.device.device_status === 0
        ? " is-down"
        : this.device.device_status === 1
        ? " is-on"
        : "";

    const activeConnections = this.device.activeConnections.length;

    return (
      <div className="box has-background-white-ter device">
        <div className="is-flex device-status">
          <div className="is-flex is-align-items-center">
            <span className={wifiClassNames}>
              {this.device.activeConnections.length > 0 &&
                this.device.wifi_status === 1 && (
                  <span
                    className="active-connections"
                    onClick={this.props.handleModalActiveConnections.bind(
                      this,
                      this.device.id
                    )}
                  >
                    {activeConnections}
                  </span>
                )}
              <i className="fas fa-wifi" />
            </span>
            <span className={networkClassNames}>
              <i className="fas fa-network-wired" />
            </span>
          </div>
          <div className="is-flex is-align-items-center">
            {this.props.device.wifi_time_left >= 0 && (
              <div className="time-left-wrap">
                <span
                  className="title-desc"
                  onClick={this.props.handleWifiTimeReset.bind(
                    this,
                    this.device.id
                  )}
                >
                  {this.props.device.wifi_time_left} min{" "}
                  <i className="fas fa-sync-alt" />
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="is-flex">
          <div className="info">
            <div className="title-desc">Iekārtas nosaukums:</div>
            <h5
              className="title is-5 has-text-link"
              title={this.device.ip_addr}
            >
              {this.device.title}
            </h5>
            <div className="title-desc">Tuvākie kabineti:</div>
            <p>{this.device.near_rooms}</p>
          </div>
          <div className="switch">
            {this.device.device_status === 1 && (
              <div className="on-off-switch-wrap">
                <OnOffSwitch
                  id={this.device.id}
                  checked={this.device.wifi_status === 1}
                  handleChange={this.props.handleWifiOnOffSwitch.bind(
                    this,
                    this.device.id
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default DeviceItem;
