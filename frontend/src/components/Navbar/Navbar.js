import React, { Component } from "react";
import { Link } from "react-router-dom";

import logo from "../../images/wifimon-logo.png";
import "./Navbar.css";

class Navbar extends Component {
  state = {
    isNavBarBurgerActive: false
  };

  handleNavBarBurger = () => {
    this.setState(prevState => {
      return { isNavBarBurgerActive: !prevState.isNavBarBurgerActive };
    });
  };

  render() {
    const navbarMenuClassNames = this.state.isNavBarBurgerActive
      ? "navbar-menu is-active"
      : "navbar-menu";
    const navbarBurgerClassNames = this.state.isNavBarBurgerActive
      ? "navbar-burger burger is-active"
      : "navbar-burger burger";

    return (
      <nav id="navbar" className="navbar has-shadow is-spaced is-link">
        <div className="container">
          <div className="navbar-brand">
            <span className="navbar-item logo">
              <img src={logo} alt="WiFI pārvaldnieks" />
              <span className="navbar-title">Wifi pārvaldnieks</span>
            </span>
            <span className="navbar-item mob search">
              <button
                className="icon"
                aria-label="search"
                aria-expanded="false"
                onClick={this.props.handleSearchSwitch}
              >
                <i className="fas fa-search" />
              </button>
            </span>
            <button
              className={navbarBurgerClassNames}
              aria-label="menu"
              aria-expanded="false"
              onClick={this.handleNavBarBurger}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
          <div className={navbarMenuClassNames}>
            <div className="navbar-start">
              <Link to="/devices" className="navbar-item">
                <span>Visas iekārtas</span>
              </Link>
              {this.props.activeDeviceItems.length > 0 && (
                <React.Fragment>
                  <Link to="/devices/active" className="navbar-item is-badge">
                    <span>
                      Aktīvās iekārtas
                      <span className="mob badge">
                        {this.props.activeDeviceItems.length}
                      </span>
                    </span>
                  </Link>
                  <span className="badge des">
                    {this.props.activeDeviceItems.length}
                  </span>
                </React.Fragment>
              )}
              <button
                className="navbar-item des search"
                aria-label="search"
                aria-expanded="false"
                onClick={this.props.handleSearchSwitch}
              >
                <span>Meklēt</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;
