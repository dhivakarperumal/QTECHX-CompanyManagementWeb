import React from "react";
import { Link } from "react-router-dom";
import error from "/images/Error img.svg";


function PageNotFound() {
  return (
    <>
   
    <div className="flex flex-col items-center justify-center  bg-gray-50 px-6 text-center">
      {/* Error Image */}
      <div className="w-80 h-100  mt-20">
      <img
        src={error}
        alt="Page Not Found"
        className="w-full h-full   mb-8"
      />
      </div>

     

      {/* Back to Home Button */}
      <Link
        to="/"
        className="px-6 py-3 rounded-full bg-primary text-white font-medium shadow-md hover:bg-primary/90 transition"
      >
        Back To Home
      </Link>
    </div>
   
    </>
  );
}

export default PageNotFound;


