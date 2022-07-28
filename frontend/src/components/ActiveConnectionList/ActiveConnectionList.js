import React from "react";
import "./ActiveConnectionsList.css";

export default class ActiveConnectionList extends React.Component {
  render() {
    const activeConnections = this.props.connections.map((conn, idx) => {
      return (
        <tr key={idx}>
          <td>{idx + 1}.</td>
          <td>{conn.macAddress}</td>
          <td>{conn.signalStrengthCh0}</td>
          <td>{conn.txCcq}</td>
          <td className="des">{conn.txRate}</td>
        </tr>
      );
    });

    return (
      <table
        className="table is-fullwidth is-striped is-hoverable active-connections"
        style={{ fontSize: "0.9rem" }}
      >
        <thead>
          <tr>
            <th>Nr. </th>
            <th>Fiziskā adrese</th>
            <th>Signāls</th>
            <th>Kvalitāte</th>
            <th className="des">Ātrums</th>
          </tr>
        </thead>
        <tbody>{activeConnections}</tbody>
      </table>
    );
  }
}
