import React from "react";
import "./Modal.css";

export default class Modal extends React.Component {
  render() {
    return (
      <div
        className={
          this.props.isActive
            ? `modal ${this.props.modalClassName} is-active`
            : `modal ${this.props.modalClassName}`
        }
      >
        <div className="modal-background" onClick={this.props.closeModal} />
        <div className="modal-content">
          <div className="box">
            <div className="inner-scroll">
              <h4>{this.props.title}</h4>
              {this.props.children}
            </div>
          </div>
        </div>
        <button
          className="modal-close is-large"
          aria-label="close"
          onClick={this.props.closeModal}
        />
      </div>
    );
  }
}
