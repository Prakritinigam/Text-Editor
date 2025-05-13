import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import Delta from "quill-delta";
import "quill/dist/quill.snow.css";
import { io, Socket } from "socket.io-client";

const SAVE_INTERVAL_MS = 2000;
const SERVER_URL = "http://localhost:3001";

interface Props {
  username: string;
}

interface ChangePayload {
  delta: Delta;
  username: string;
}

function Editor({ username }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const quillRef = useRef<Quill | null>(null);

  const [status, setStatus] = useState("Connecting...");
  const [lastEditor, setLastEditor] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on("connect", () => setStatus("🟢 Connected"));
    socket.on("disconnect", () => setStatus("🔴 Disconnected"));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const editorContainer = document.createElement("div");
    wrapperRef.current.innerHTML = "";
    wrapperRef.current.append(editorContainer);

    const quill = new Quill(editorContainer, {
      theme: "snow",
      placeholder: "Start collaborating here...",
    });

    quill.disable();
    quillRef.current = quill;

    socketRef.current?.once("load-document", ({ documentData, lastEditor }) => {
      try {
        const parsed = documentData ? JSON.parse(documentData) : null;
        if (parsed && parsed.ops) {
          quill.setContents(parsed);
        } else {
          quill.setContents([]);
        }
      } catch {
        quill.setContents([]);
      }

      setLastEditor(lastEditor);
      quill.enable();
    });

    quill.on("text-change", (delta, _, source) => {
      if (source !== "user") return;

      const payload: ChangePayload = { delta, username };
      socketRef.current?.emit("send-changes", payload);
      setLastEditor(username);
    });

    socketRef.current?.on(
      "receive-changes",
      ({ delta, username }: ChangePayload) => {
        quill.updateContents(delta);
        setLastEditor(username);
      }
    );

    const saveInterval = setInterval(() => {
      const data = quill.getContents();
      socketRef.current?.emit("save-document", {
        documentData: JSON.stringify(data),
        lastEditor: username,
      });
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(saveInterval);
  }, [username]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <div className="text-lg font-semibold text-gray-800">👤 {username}</div>
        <div className="text-sm text-gray-500 italic">{status}</div>
      </div>

      {lastEditor && (
        <div className="text-md mb-2 text-blue-600">
          Last edited by: <span className="font-semibold">{lastEditor}</span>
        </div>
      )}

      <div
        ref={wrapperRef}
        className="bg-white border rounded-lg shadow-md min-h-[400px] overflow-hidden"
      />
    </div>
  );
}

export default Editor;
