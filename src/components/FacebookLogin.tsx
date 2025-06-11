import { useEffect, useState } from "react";
import axios from "axios";

declare global {
  interface Window {
    FB: any;
  }
}

const FACEBOOK_CLIENT_ID = "2354391968251323";
const REDIRECT_URI = "https://meta-frondend.vercel.app/";
const CONFIG_ID = "634146679679302";
const SCOPE =
  "whatsapp_business_messaging,whatsapp_business_management,business_management";

const FacebookLoginRaw = () => {
  const [code, setCode] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const [signupInfo, setSignupInfo] = useState<string | null>(null);

  // Handle popup login and get `code`
  const openLoginPopup = () => {
    const width = 600;
    const height = 700;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const authUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(SCOPE)}&response_type=code&config_id=${CONFIG_ID}`;

    const popup = window.open(
      authUrl,
      "fbLogin",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    const interval = setInterval(() => {
      try {
        const url = popup?.location.href;
        console.log(url)
        if (url && url.includes("code=")) {
          const parsed = new URL(url);
          const fbCode = parsed.searchParams.get("code");
          if (fbCode) {
            popup?.close();
            clearInterval(interval);
            setCode(fbCode);
            exchangeCode(fbCode);
          }
        }
      } catch {
        // Ignore cross-origin until redirect happens
      }
    }, 500);
  };

  // Exchange `code` for access token
  const exchangeCode = async (code: string) => {
    try {
      const response = await axios.post(
        "https://rtserver-znbx.onrender.com/api/whatsapp/exchange-code",
        { code }
      );
      const token = response.data.access_token;
      setAccessToken(token);
      setSessionInfo(JSON.stringify(response.data, null, 2));

      initFacebookEmbeddedSignup(token);
    } catch (error) {
      console.error("Token exchange failed:", error);
      setSessionInfo("Token exchange failed.");
    }
  };

  // Load SDK and initialize embedded signup
  const initFacebookEmbeddedSignup = (token: string) => {
    if (window.FB && window.FB.WAEmbeddedSignup) {
      window.FB.WAEmbeddedSignup.init({
        app_id: FACEBOOK_CLIENT_ID,
        access_token: token,
        config_id: CONFIG_ID,
        callback: (response: any) => {
          console.log("Embedded signup callback:", response);
          setSignupInfo(JSON.stringify(response, null, 2));
        },
      });
    }
  };

  // Load Facebook SDK
  useEffect(() => {
    const loadFbSdk = () => {
      if (document.getElementById("facebook-jssdk")) return;
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.onload = () => {
        window.FB.init({
          appId: FACEBOOK_CLIENT_ID,
          version: "v18.0",
          xfbml: false,
        });
      };
      document.body.appendChild(script);
    };

    loadFbSdk();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-6">
      {!accessToken && (
        <button
          onClick={openLoginPopup}
          className="bg-blue-600 text-white px-6 py-3 rounded font-bold text-lg"
        >
          Login with Facebook
        </button>
      )}

      <div id="wa-embedded-signup" className="w-full max-w-3xl mt-6" />

      <div className="w-full max-w-3xl text-left space-y-4">
        <div>
          <p className="font-semibold">Authorization Code:</p>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {code || "No code received yet."}
          </pre>
        </div>

        <div>
          <p className="font-semibold">Backend Token Response:</p>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {sessionInfo || "Waiting for token..."}
          </pre>
        </div>

        <div>
          <p className="font-semibold">Signup Event Response:</p>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {signupInfo || "Waiting for signup event..."}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FacebookLoginRaw;
