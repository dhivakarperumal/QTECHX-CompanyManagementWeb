import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeamMembers } from "../Redux/teamSlice";
import TeamCard from "./TeamCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Team() {
  const dispatch = useDispatch();
  const { members, loading, error } = useSelector((state) => state.team);

  const [slidesToShow, setSlidesToShow] = useState(4);

  // ✅ Dynamic slidesToShow
  useEffect(() => {
    const updateSlides = () => {
      if (window.innerWidth <= 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth <= 1024) {
        setSlidesToShow(2);
      } else if (window.innerWidth <= 1280) {
        setSlidesToShow(4);
      } else {
        setSlidesToShow(4);
      }
    };

    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  useEffect(() => {
    if (members.length === 0) {
      dispatch(fetchTeamMembers());
    }
  }, [dispatch, members.length]);

  if (loading) return <p className="text-center">Loading team members...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // ✅ Slick settings
  const settings = {
    infinite: true,
    speed: 600,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    pauseOnHover: true,
  };

  return (
    <div className="pb-8 overflow-x-hidden mt-6">
      {/* Page Header */}
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
        Our Team's
      </h2>

      {/* Slider Wrapper → controls alignment */}
      <div className="flex   justify-center ">
        <div className="w-full max-w-7xl">
         
          <Slider
  {...settings}
  className="[&_.slick-track]:!flex [&_.slick-track]:!justify-center [&_.slick-slide]:!flex [&_.slick-slide]:!justify-center"
>
  {members.map((member) => (
    <div key={member.company_id} className="px-2">
      <TeamCard member={member} />
    </div>
  ))}
</Slider>

        </div>
      </div>
    </div>
  );
}

export default Team;
