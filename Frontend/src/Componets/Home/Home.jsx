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

const Home = () => {

  return (
    <>
      <Hero />
      <FeaturedOpenings />
      <EventBanner/>
      <Services/>
      <AboutUs/>
      <Methodology/>
      <WhyChooseUs />
      <Projects />
      <Careers />
      <Testimonial />
    </>
  );
};

export default Home;
