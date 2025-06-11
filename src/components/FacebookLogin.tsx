import { useEffect, useState } from "react";
import axios from "axios";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const FacebookLoginRaw = () => {
  const [sdkResponse, setSdkResponse] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [backendResponse, setBackendResponse] = useState<any>(null);

  const APP_ID = "2354391968251323";
  const CONFIG_ID = "988718802681268"; // Use your real config ID
  // const REDIRECT_URI = "https://meta-frondend.vercel.app";

  useEffect(() => {
    // Load SDK only once
    if (document.getElementById("facebook-jssdk")) return;

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: APP_ID,
        autoLogAppEvents: true,
        xfbml: false,
        version: "v23.0",
      });
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // PostMessage listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      )
        return;

      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          console.log("Signup Event:", data);
          setSessionInfo(data);

          if (data.event === "FINISH") {
            console.log("Signup completed:", data.data);
          } else if (data.event === "CANCEL") {
            console.warn("Signup cancelled at:", data.data?.current_step);
          } else if (data.event === "ERROR") {
            console.error("Signup error:", data.data?.error_message);
          }
        }
      } catch (err) {
        console.warn("Non-JSON response from Facebook SDK:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleFbLogin = () => {
    if (!window.FB) {
      alert("Facebook SDK not loaded");
      return;
    }

    window.FB.login(
      (response: any) => {
        console.log("FB.login response:", response);
        setSdkResponse(response);

        const code = response.authResponse?.code;
        if (code) {
          exchangeCode(code); // call async function outside
        }
      },
      {
        config_id: CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: { version: "v3" },
      }
    );
  };

  // Define async function separately
  const exchangeCode = async (code: string) => {
    try {
      const res = await axios.post(
        "https://rtserver-znbx.onrender.com/api/whatsapp/exchange-code",
        { code }
      );
      setBackendResponse(res.data);
    } catch (error) {
      console.error("Backend token exchange failed:", error);
      setBackendResponse("Backend token exchange failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <button
        onClick={handleFbLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded font-bold text-lg"
      >
        Login with Facebook
      </button>

      <div className="mt-6 w-full max-w-2xl text-left">
        <p className="font-semibold">SDK Response:</p>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          {sdkResponse ? JSON.stringify(sdkResponse, null, 2) : "Waiting..."}
        </pre>

        <p className="font-semibold mt-6">Signup Event via PostMessage:</p>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          {sessionInfo ? JSON.stringify(sessionInfo, null, 2) : "Waiting..."}
        </pre>

        <p className="font-semibold mt-6">Backend Exchange Response:</p>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          {backendResponse
            ? JSON.stringify(backendResponse, null, 2)
            : "Waiting..."}
        </pre>
      </div>
    </div>
  );
};

export default FacebookLoginRaw;
