import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  interface User {
    name: string;
    email: string;
    picture: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/user", { withCredentials: true })
      .then((res) => {
        console.log(res.data.user);
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error(err);
        navigate("/");
      });
  }, [navigate]);

  const handleLogout = () => {
    axios
      .get("http://localhost:3000/logout", { withCredentials: true })
      .then(() => navigate("/"))
      .catch((err) => console.log("Logout Successfully", err));
  };

  return (
    <div>
      {user ? (
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
          <p>Email: {user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Dashboard;
