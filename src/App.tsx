import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import FacebookLogin from "./components/FacebookLogin";
import "./index.css";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FacebookLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
