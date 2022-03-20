import React from "react";
import { Tooltip } from "antd";
const Client = ({ username }) => {
  return (
    <div className="client">
      <Tooltip title={username}>
        <img
          draggable="false"
          className="avatarModern"
          src={`https://ui-avatars.com/api/?rounded=true&name=${username}&background=random`}
          alt={username.split(" ")[0]}
        />
      </Tooltip>
      {/* <span className="userName">{username.split(" ")[0]}</span> */}
    </div>
  );
};

export default Client;
