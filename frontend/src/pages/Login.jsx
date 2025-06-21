import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      axios.defaults.withCredentials = true;
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });
        if (data.success) {
          toast.success(data.message);
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          return toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });
        if (data.success) {
          toast.success(data.message);
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          return toast.error(data.message);
        }
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(msg);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 to-purple-400 flex items-center justify-center px-4">
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 top-5 w-28 sm:left-20 sm:w-32 cursor-pointer"
      />

      {/* Login/Signup Box */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 sm:p-10 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {state === "Sign Up"
            ? "Create your account below"
            : "Login to your account"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {state === "Sign Up" && (
            <div className="flex items-center gap-3 w-full px-4 py-2 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="icon" />
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-3 w-full px-4 py-2 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="icon" />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full px-4 py-2 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="icon" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none"
            />
          </div>

          <p
            onClick={() => navigate("/reset-password")}
            className="text-right text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition duration-200"
          >
            Forgot password?
          </p>

          <button
            type="submit"
            className=" bg-gradient-to-br cursor-pointer from-indigo-500 to-indigo-900 text-white py-2 font-medium rounded-full w-full hover:bg-gray-700 transition duration-300"
          >
            {state}
          </button>

          <p className="text-sm text-gray-600 mt-4">
            {state === "Sign Up"
              ? "Already have an account?"
              : "Don't have Account?"}{" "}
            <span
              className="text-blue-600 cursor-pointer underline"
              onClick={() =>
                setState(state === "Sign Up" ? "Login" : "Sign Up")
              }
            >
              {state === "Sign Up" ? "Login" : "Sign Up"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
