import Hero from "./Hero";
import FeaturedOpenings from "./FeaturedOpenings";
import EventBanner from "./EventBanner";
import Services from "./Services";
import AboutUs from "./AboutUs";
import Methodology from "./Methodology";
import WhyChooseUs from "./WhyChooseUs";
import Projects from "./Projects";
import Careers from "./Careers";
import Testimonial from "./Testimonial";
import JobOpeningBanner from "./JobOpeningBanner";
import InnovationHub from "./InnovationHub";

const Home = () => {

  return (
    <>
      <Hero />
      <JobOpeningBanner />
      <Services/>
      <EventBanner/>
      <AboutUs/>
      <Methodology/>
      <WhyChooseUs />
      <Projects />
      <Careers />
      <Testimonial />
    </>
  );
};

      {/* <FeaturedOpenings /> */}
      {/* <InnovationHub/> */}
export default Home;
