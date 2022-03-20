import React, { useState } from "react";
import { Input, Button } from "antd";
import toast, { Toaster } from "react-hot-toast";
import { generateSlug } from "random-word-slugs";
import {
  UsergroupAddOutlined,
  UserOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const joinRoom = () => {
    if (roomId.length === 0 || username.length === 0) {
      toast.error("Please enter a room id and username!");
      return;
    }

    // Redirect to room

    navigate(`/editor/${roomId}`, { state: { username } });
  };

  const handleInputEnter = (e) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  return (
    <>
      <div className="homePageWrapper">
        <div className="formWrapper">
          <div className="inputGroup">
            <img
              onClick={() => {
                setRoomId(generateSlug(4));
                toast.success("New room id generated!");
              }}
              className="logo"
              src="https://res.cloudinary.com/vigneshshettyin/image/upload/v1647760691/guiaskdkwt3fo4yhpkvt.png"
              alt="React Logo"
            />
            <Input
              size="large"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
              }}
              className="inputBox"
              placeholder="Room ID"
              prefix={<UsergroupAddOutlined />}
              onKeyUp={handleInputEnter}
            />

            <Input
              size="large"
              className="inputBox"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              placeholder="User Name"
              prefix={<UserOutlined />}
              onKeyUp={handleInputEnter}
            />

            <Button
              type="primary"
              shape="round"
              onClick={() => {
                joinRoom();
              }}
              icon={<SendOutlined />}
              size="large"
            >
              Join Room!
            </Button>

            <span className="infoTextBelowButton">
              Random Id? Click on Logo!
            </span>
          </div>
        </div>

        <Toaster position="top-right" reverseOrder={false} />

        <footer>
          <p>🤟</p>
        </footer>
      </div>
    </>
  );
};

export default Home;
