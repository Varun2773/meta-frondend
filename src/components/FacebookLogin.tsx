import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // If using React Router
import axios from "axios";

const FacebookLoginRaw = () => {
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  // const [sdkResponse, setSdkResponse] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Facebook App Info
  const clientId = "2354391968251323";
  const redirectUri = "https://meta-frondend.vercel.app/";
  const scope =
    "whatsapp_business_messaging,whatsapp_business_management,business_management";

  // Construct the Facebook Login URL
  const buildFacebookLoginUrl = () => {
    const state = "xyz123"; // Optional CSRF protection
    return `https://www.facebook.com/v23.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}`;
  };

  // Handle redirect from Facebook with ?code=...
  useEffect(() => {
    const fbCode = searchParams.get("code");
    if (fbCode) {
      setCode(fbCode);
      exchangeCode(fbCode);
    }
  }, [searchParams]);

  // Exchange the code for a token via your backend
  const exchangeCode = async (code: string) => {
    try {
      const response = await axios.post(
        "https://rtserver-znbx.onrender.com/api/whatsapp/exchange-code",
        { code }
      );
      setSessionInfo(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error("Token exchange failed:", error);
      setSessionInfo("Token exchange failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <a
        href={buildFacebookLoginUrl()}
        className="bg-blue-600 text-white px-6 py-3 rounded font-bold text-lg"
      >
        Login with Facebook
      </a>

      <div className="text-left w-full max-w-2xl px-4">
        <p className="font-semibold">Authorization Code:</p>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">
          {code || "No code received yet."}
        </pre>

        <br />

        <p className="font-semibold">Backend Token Response:</p>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">
          {sessionInfo || "Waiting for code..."}
        </pre>
      </div>
    </div>
  );
};

export default FacebookLoginRaw;
