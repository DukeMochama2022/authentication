import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const { backendUrl, isLoggedin, userData, getuserData } =
    useContext(AppContext);
  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-account`,
        { otp }
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedin, userData]);
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 to-purple-400 flex items-center justify-center px-4">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 top-5 w-28 sm:left-20 sm:w-32 cursor-pointer"
      />
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg text-sm w-96"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6 digit code sent to your email.
        </p>
        <div onPaste={handlePaste} className="flex justify-between mb-8">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                required
                className="w-10 h-10 bg-[#333A5C] text-white text-center text-xlg rounded-medium"
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>
        <button className="w-full py-3  bg-gradient-to-br cursor-pointer from-indigo-500 to-indigo-900 text-white rounded-full">
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default VerifyEmail;
