import { useEffect, useState } from "react";
import axios from "axios";

const FACEBOOK_CLIENT_ID = "2354391968251323";
const REDIRECT_URI = "https://meta-frondend.vercel.app/"; // same domain
const SCOPE =
  "whatsapp_business_messaging,whatsapp_business_management,business_management";
const CONFIG_ID = "634146679679302";

const FacebookLoginRaw = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [signupInfo, setSignupInfo] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Handle popup login
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
      } catch (err) {
        // Wait silently until redirect completes
      }
    }, 500);
  };

  // Exchange code for token
  const exchangeCode = async (code: string) => {
    try {
      const response = await axios.post(
        "https://rtserver-znbx.onrender.com/api/whatsapp/exchange-code",
        { code }
      );
      const token = response.data.access_token;
      setAccessToken(token);
      setSessionInfo(JSON.stringify(response.data, null, 2));
      setModalOpen(true);
    } catch (error) {
      console.error("Token exchange failed:", error);
      setSessionInfo("Token exchange failed.");
    }
  };

  // Listen to messages from embedded signup iframe
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
          setSignupInfo(JSON.stringify(data, null, 2));
          if (data.event === "FINISH") {
            console.log("Signup completed:", data.data);
          } else if (data.event === "CANCEL") {
            console.warn("Signup cancelled at:", data.data.current_step);
          } else if (data.event === "ERROR") {
            console.error("Signup error:", data.data.error_message);
          }
        }
      } catch {
        console.warn("Non-JSON message from iframe");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-4">
      {!accessToken ? (
        <button
          onClick={openLoginPopup}
          className="bg-blue-600 text-white px-6 py-3 rounded font-bold text-lg"
        >
          Login with Facebook
        </button>
      ) : (
        <p className="text-green-600 font-semibold text-xl">
          ✅ Facebook Access Token Acquired
        </p>
      )}

      {modalOpen && accessToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-full max-w-3xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-red-500 font-bold text-lg"
            >
              ✕
            </button>
            <iframe
              title="WA Embedded Signup"
              src={`https://www.facebook.com/embed/wa/whatsapp-business-onboarding/?access_token=${accessToken}&config_id=${CONFIG_ID}`}
              style={{ width: "100%", height: "600px", border: "none" }}
            />
          </div>
        </div>
      )}

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
