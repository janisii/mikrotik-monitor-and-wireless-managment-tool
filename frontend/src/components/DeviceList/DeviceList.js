import React, { Component } from "react";
import DeviceItem from "./DeviceItem/DeviceItem";

class DeviceList extends Component {
  render() {
    return (
      <div className="section">
        <div className="container">
          {!this.props.isSearch && (
            <h1 className="title">{this.props.title}</h1>
          )}
          <div className="columns is-multiline">
            {this.props.devices.map(item => {
              const device = item.device;
              return (
                <div
                  key={device.id}
                  className="column is-half-tablet is-half-desktop is-one-third-widescreen is-one-quarter-fullhd"
                >
                  <DeviceItem
                    key={device.id}
                    device={device}
                    handleWifiOnOffSwitch={this.props.handleWifiOnOffSwitch}
                    handleWifiTimeReset={this.props.handleWifiTimeReset}
                    handleModalActiveConnections={
                      this.props.handleModalActiveConnections
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default DeviceList;
