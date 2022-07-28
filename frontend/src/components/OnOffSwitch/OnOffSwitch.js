import React from "react";
import "./OnOffSwitch.css";

const OnOffSwitch = props => {
  return (
    <div className="is-flex is-align-items-center">
      <div className="onoffswitch">
        <input
          type="checkbox"
          name="onoffswitch"
          id={props.id}
          className="onoffswitch-checkbox"
          checked={props.checked}
          onChange={props.handleChange}
        />
        <label className="onoffswitch-label" htmlFor={props.id}>
          <span className="onoffswitch-inner" />
          <span className="onoffswitch-switch" />
        </label>
      </div>
      <div className="onoffswitch-title" onClick={props.handleChange}>
        {props.title}
      </div>
    </div>
  );
};

export default OnOffSwitch;
