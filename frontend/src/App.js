import React, { Component } from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

import Devices from "./pages/Devices";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route key="devices" path="/devices" exact component={Devices} />
          <Route
            key="devices-active"
            path="/devices/active"
            exact
            render={props => <Devices {...props} activeDevices={true} />}
          />
          <Redirect from="/" to="/devices" exact />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
