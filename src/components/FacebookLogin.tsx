
const FacebookLogin = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:3000/auth/facebook";
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button 
        onClick={handleLogin} 
        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg"
      >
        Login with Facebook
      </button>
    </div>
  );
};

export default FacebookLogin;
