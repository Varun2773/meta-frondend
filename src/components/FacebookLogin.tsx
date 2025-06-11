import  { useEffect, useState } from "react";
import axios from "axios";

const FACEBOOK_CLIENT_ID = "2354391968251323";
const REDIRECT_URI = "https://meta-frondend.vercel.app/auth-callback";
const SCOPE =
  "whatsapp_business_messaging,whatsapp_business_management,business_management";
const CONFIG_ID = "634146679679302";

const FacebookLoginPopupEmbed = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [signupInfo, setSignupInfo] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Open popup for OAuth login
  const openLoginPopup = () => {
    const width = 600,
      height = 700;
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

    // Listen for message from popup
    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { code?: string; error?: string };
      if (data.code) {
        exchangeCode(data.code);
        popup?.close();
      }
    });
  };

  // Exchange code for access token
  const exchangeCode = async (code: string) => {
    try {
      const response = await axios.post(
        "https://rtserver-znbx.onrender.com/api/whatsapp/exchange-code",
        { code }
      );
      setAccessToken(response.data.access_token);
      setModalOpen(true);
    } catch (err) {
      console.error("Token exchange failed", err);
    }
  };

  // Listen for WA Embedded Signup events
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
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {!accessToken && (
        <button
          onClick={openLoginPopup}
          className="bg-blue-600 text-white px-5 py-3 rounded"
        >
          Login with Facebook
        </button>
      )}

      {modalOpen && accessToken && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-xl w-full">
            <button
              className="text-red-500 float-right font-bold"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>
            <iframe
              title="WA Signup"
              src={`https://www.facebook.com/embed/wa/whatsapp-business-onboarding/?access_token=${accessToken}&config_id=${CONFIG_ID}`}
              style={{ width: "100%", height: "600px", border: "none" }}
            />
          </div>
        </div>
      )}

      {signupInfo && (
        <div className="mt-6 max-w-lg bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Signup Info:</h2>
          <pre className="overflow-auto text-sm">{signupInfo}</pre>
        </div>
      )}
    </div>
  );
};

export default FacebookLoginPopupEmbed;
