// import React, { useState } from "react";
// import SocialMedia from "../Home/SocialMedia";
// import Head from "../Components/Head";
// import { IoIosArrowForward } from 'react-icons/io';
// import { Link } from 'react-router-dom';

// const Achievements = () => {
//   const [filter, setFilter] = useState("All");

//   const items = [
//     {
//       id: 1,
//       category: "Awards",
//       image:
//         "/WhyChooseUs/award.webp", 
//     },
   
//     {
//       id: 3,
//       category: "Celebration",
//       image: "/WhyChooseUs/award1.webp", 
        
//     },
//   ];

//   const filteredItems =
//     filter === "All" ? items : items.filter((item) => item.category === filter);

//   return (
//     <>
//     <Head
//         title="Our Achievements"
//         subtitle={
//           <>
//             <Link className="text-lg font-semibold text-white" to="/">Home</Link>
//             <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
//             <Link className="text-lg font-semibold text-white" to="/about">Our Achievements</Link>
//           </>
//         }
//       />
//     <div className="bg-gray-50 py-12">
//       <h1 className="text-3xl md:text-5xl font-bold text-center mb-8">
//         Achievements and Celebration
//       </h1>

//       {/* Filter Buttons */}
//       <div className="flex justify-center gap-6 mb-10 text-lg font-semibold">
//         {["All", "Awards", "Celebration"].map((cat) => (
//           <button
//             key={cat}
//             onClick={() => setFilter(cat)}
//             className={`${
//               filter === cat ? "text-primary" : "text-gray-700"
//             } hover:text-primary`}
//           >
//             {cat}
//           </button>
//         ))}
//       </div>

//       {/* Items */}
//       <div className="flex flex-wrap justify-center gap-8">
//         {filteredItems.map((item) => (
//           <div
//             key={item.id}
//             className="w-[320px] rounded-lg overflow-hidden shadow-lg bg-white"
//           >
//             <img
//               src={item.image}
//               alt={item.category}
//               className="w-full h-60 object-cover"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//     <SocialMedia/>
//     </>
//   );
// };

// export default Achievements;


import React from "react";
import { Link } from "react-router-dom";
import error from "/images/Error img.svg";


function Achivements() {
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
    </div>

    </>
  );
}

export default Achivements;


