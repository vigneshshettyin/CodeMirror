import React, { useEffect, useRef, useState } from "react";
import Client from "../components/Client";
import { Button } from "antd";
import { PaperClipOutlined, CloseCircleFilled } from "@ant-design/icons";
import Editor from "../components/Editor";
import { initSocket } from "../socket/socket";
import ACTIONS from "../socket/Actions";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (error) => {
        handleErrors(error);
      });
      socketRef.current.on("connect_failed", (error) => {
        handleErrors(error);
      });

      const handleErrors = (error) => {
        toast.error("Socket connection failed, try again later");
        console.log("Socker Error: ", error);
        reactNavigator("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      //Listen for join event

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} has joined the room`);
            console.log(`${username} has joined the room`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      //Listen for disc

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} has left the room`);
          console.log(`${username} has left the room`);
        }
        setClients((clients) =>
          clients.filter((client) => client.socketId !== socketId)
        );
      });
    };

    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, [roomId, location, reactNavigator]);

  const [clients, setClients] = useState([]);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="mainWrap">
        <div className="aside">
          <div className="asideInner">
            <div className="clientsList">
              {clients.map((client, index) => {
                return (
                  <Client
                    className="client"
                    key={index}
                    username={client.username}
                  />
                );
              })}
            </div>
          </div>
          <Button
            className="btn"
            type="info"
            shape="round"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(roomId);
                toast.success("Room ID copied to clipboard!");
              } catch (err) {
                toast.error("Something went wrong!");
                console.error(err);
              }
            }}
            icon={<PaperClipOutlined />}
            size="large"
          >
            Copy Room ID
          </Button>
          <Button
            className="btn"
            type="danger"
            shape="round"
            onClick={() => {
              reactNavigator("/");
            }}
            icon={<CloseCircleFilled />}
            size="large"
          >
            Leave Room !
          </Button>
        </div>
        <div className="editorWrap">
          <Editor
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
            roomId={roomId}
            socketRef={socketRef}
          />
        </div>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </>
  );
};

export default EditorPage;
