import Sidebar from "./Components/Sidebar.jsx";
import ChatWindow from "./Components/ChatWindow.jsx";
import { Modals } from "./Components/Modals.jsx";
import "./App.css";

function App() {
  return (
    <div className="mainLayout">
      <Sidebar />
      <ChatWindow />
      <Modals />
    </div>
  );
}

export default App;