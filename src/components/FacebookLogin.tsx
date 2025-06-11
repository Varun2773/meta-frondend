import { useEffect, useState } from "react";
import axios from "axios";

declare global {
  interface Window {
    FB: any;
  }
}

const FACEBOOK_APP_ID = "2354391968251323";
const CONFIG_ID = "634146679679302";
const REDIRECT_URI = "https://meta-frondend.vercel.app"; // Must match exactly with FB app config

const FacebookWASignup = () => {
  const [sessionInfo, setSessionInfo] = useState("");
  const [signupData, setSignupData] = useState<any>(null);

  // ✅ 1. Exchange OAuth code with backend
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      exchangeCode(code);
    }
  }, []);

  // ✅ 2. Load Facebook SDK and WhatsApp Embedded Signup SDK
  useEffect(() => {
    const loadFacebookSdk = () => {
      if (window.FB) {
        initFacebookSdk();
        return;
      }

      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.onload = initFacebookSdk;
      document.body.appendChild(script);
    };

    const initFacebookSdk = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        xfbml: false,
        version: "v18.0",
      });

      // Wait briefly to ensure FB.WAEmbeddedSignup is available
      const tryInit = () => {
        if (window.FB && window.FB.WAEmbeddedSignup) {
          window.FB.WAEmbeddedSignup.init({
            app_id: FACEBOOK_APP_ID,
            config_id: CONFIG_ID,
            callback: (response: any) => {
              console.log("Signup callback received:", response);

              if (response.event === "FINISH") {
                setSignupData(response.data);
              } else if (response.event === "ERROR") {
                console.error("Signup error:", response.data?.error_message);
              }
            },
          });
        } else {
          console.warn("FB.WAEmbeddedSignup not ready yet, retrying...");
          setTimeout(tryInit, 300); // Retry until available
        }
      };

      tryInit();
    };

    loadFacebookSdk();
  }, []);

  // ✅ 3. Manual OAuth login redirect
  const handleLogin = () => {
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=whatsapp_business_management,business_management`;
    window.location.href = authUrl;
  };

  // ✅ 4. Exchange code for access token via backend
  const exchangeCode = async (code: string) => {
    try {
      const response = await axios.post(
        "https://rtserver-znbx.onrender.com/api/whatsapp/exchange-code",
        {
          code,
        }
      );

      setSessionInfo(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      console.error("Backend token exchange failed:", err);
      setSessionInfo(
        "Token exchange failed. " +
          (err.response?.data?.error?.message || err.message)
      );
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold">WhatsApp Embedded Signup</h1>

      <div id="wa-embedded-signup" className="my-4"></div>

      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Connect Facebook to Get Access Token
      </button>

      {signupData && (
        <div>
          <p className="font-semibold mt-4">✅ Signup Finished:</p>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify(signupData, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <p className="font-semibold mt-4">
          🛡️ Session Info (Access Token Response):
        </p>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          {sessionInfo || "No token yet. Click login above."}
        </pre>
      </div>
    </div>
  );
};

export default FacebookWASignup;
