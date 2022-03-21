import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/ayu-dark.css";
import "codemirror/theme/3024-night.css";
import "codemirror/theme/ayu-mirage.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/yonce.css";
import "codemirror/theme/elegant.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../socket/Actions";

function Editor({ socketRef, roomId, onCodeChange, theme }) {
  const editorRef = useRef(null);

  useEffect(() => {
    console.log("theme", theme);
  }, [theme]);

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: theme,
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          lineWrapping: true,
          indentUnit: 2,
          tabSize: 2,
          indentWithTabs: true,
          matchTags: { bothTags: true },
          styleActiveLine: true,
          styleSelectedText: true,
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, { code, roomId });
        }
      });
    }
    init();
    //eslint-disable-next-line
  }, [roomId, socketRef]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      //eslint-disable-next-line
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
    //eslint-disable-next-line
  }, [socketRef.current]);

  return <textarea id="realtimeEditor"></textarea>;
}

export default Editor;
