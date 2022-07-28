import React from "react";

const Error = props => {
  return (
    <div className="message is-danger">
      <div className="message-body">{props.message}</div>
    </div>
  );
};

export default Error;
