import { lazy } from "react";
import Hero from "./Hero";
import DeferredHomeSection from "./DeferredHomeSection";

const JobOpeningBanner = lazy(() => import("./JobOpeningBanner"));
const Services = lazy(() => import("./Services"));
const EventBanner = lazy(() => import("./EventBanner"));
const AboutUs = lazy(() => import("./AboutUs"));
const Methodology = lazy(() => import("./Methodology"));
const WhyChooseUs = lazy(() => import("./WhyChooseUs"));
const Projects = lazy(() => import("./Projects"));
const Careers = lazy(() => import("./Careers"));
const Testimonial = lazy(() => import("./Testimonial"));

const Home = () => {

  return (
    <>
      <Hero />
      <DeferredHomeSection component={JobOpeningBanner} />
      <DeferredHomeSection component={Services} />
      <DeferredHomeSection component={EventBanner} />
      <DeferredHomeSection component={AboutUs} />
      <DeferredHomeSection component={Methodology} />
      <DeferredHomeSection component={WhyChooseUs} />
      <DeferredHomeSection component={Projects} />
      <DeferredHomeSection component={Careers} />
      <DeferredHomeSection component={Testimonial} />
    </>
  );
};

      {/* <FeaturedOpenings /> */}
      {/* <InnovationHub/> */}
export default Home;
