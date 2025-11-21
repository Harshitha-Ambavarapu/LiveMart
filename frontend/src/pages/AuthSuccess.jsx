import { useEffect } from "react";
import axios from "axios";

export default function AuthSuccess() {
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("http://localhost:4000/api/auth/me", {
          withCredentials: true,
        });
        console.log("User:", res.data.user);

        // redirect user anywhere after successful login
        window.location.href = "/dashboard";
      } catch (err) {
        console.error("Auth failed:", err);
        window.location.href = "/login";
      }
    }
    fetchUser();
  }, []);

  return <h2>Signing you in...</h2>;
}