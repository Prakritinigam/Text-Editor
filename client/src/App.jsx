import { useState } from "react";
import Editor from "./Editor";

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  const handleLogout = () => {
    setUsername("");
    setJoined(false);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center p-4">
      {!joined ? (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            RealTime -Text Editor
          </h1>
          <p className="text-gray-500 mb-6">
            Collaborate in real-time with others!
          </p>
          <input
            className="border border-gray-300 rounded p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded w-full"
            onClick={() => username && setJoined(true)}
          >
            Join Editor
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col items-center">
          <div className="flex justify-between items-center px-6 pt-4 mb-4 w-full">
            <h1 className="text-4xl font-bold text-blue-700">
              RealTime - Text Editor
            </h1>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          <Editor username={username} />
        </div>
      )}
    </div>
  );
}

export default App;
