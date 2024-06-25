import  { useEffect } from "react";
import { DatePickerDemo } from "./components/datepicker";

const Dashboard = () => {
  const accesstoken = localStorage.getItem("accesstoken");
  const refreshtoken = localStorage.getItem("refreshtoken");
  const accessTokenExpiresIn = localStorage.getItem("accessTokenExpiresIn");
  const refreshTokenExpiresIn = localStorage.getItem("refreshTokenExpiresIn");

  if (!accesstoken) {
    window.location.href = "/";
  }

  const refreshTokenHandler = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: refreshtoken }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      console.log("refresh token handler==>",responseData)
      localStorage.setItem("accesstoken", responseData.accessToken);
      localStorage.setItem("refreshtoken", responseData.refreshToken);
      localStorage.setItem("accessTokenExpiresIn", responseData.accessTokenExpiresIn);
      localStorage.setItem("refreshTokenExpiresIn", responseData.refreshTokenExpiresIn);
      window.location.reload(); // Refresh the page to apply new tokens
    } catch (error) {
      console.error("Failed to fetch:", error);
      handelSubmit(); // Logout if refresh token fails
    }
  };

  const handelSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accesstoken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      console.log("res==>", responseData);
      localStorage.removeItem("accesstoken"); 
      localStorage.removeItem("refreshtoken"); 
      localStorage.removeItem("accessTokenExpiresIn");
      localStorage.removeItem("refreshTokenExpiresIn");
      window.location.href = "/"; 
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  };

  useEffect(() => {
    if (accessTokenExpiresIn) {
      const accessTokenExpiryDate = new Date(accessTokenExpiresIn);
      const accessTokenTimeout = setTimeout(() => {
        refreshTokenHandler();
      }, accessTokenExpiryDate.getTime() - Date.now() - 10000); // Refresh 10 seconds before expiry

      return () => clearTimeout(accessTokenTimeout);
    }
  }, [accessTokenExpiresIn]);

  useEffect(() => {
    if (refreshTokenExpiresIn) {
      const refreshTokenExpiryDate = new Date(refreshTokenExpiresIn);
      const refreshTokenTimeout = setTimeout(() => {
        handelSubmit();
      }, refreshTokenExpiryDate.getTime() - Date.now() - 10000); // Logout 10 seconds before expiry

      return () => clearTimeout(refreshTokenTimeout);
    }
  }, [refreshTokenExpiresIn]);

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-10 h-screen">
        <DatePickerDemo />
        <button
          onClick={() => handelSubmit()}
          className="bg-red-400 p-2 text-white w-56"
          type="submit"
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default Dashboard;