import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Header = () => {
  const { userData } = useContext(AppContext);
  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <img
        src={assets.header_img}
        alt=""
        className="rounded-full mb-6 w-36 h-36"
      />
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        Hey {userData ? userData.name : "Developer"}!
        <img src={assets.hand_wave} alt="" className="w-8 aspect-square" />
      </h1>

      <h2 className="text-3xl sm:text-5xl font-semibold mb-4">
        Welcome to our app.
      </h2>
      <p className="mb-8 mx-w-md ">
        Lets atart with a quick product tour and we will have you up and running
        in no time!
      </p>
      <button className="rounded-full text-gray-300 cursor-pointer bg-gray-900 border-none px-8 py-2 hover:bg-gray-600 transition-all">
        Get started
      </button>
    </div>
  );
};

export default Header;
