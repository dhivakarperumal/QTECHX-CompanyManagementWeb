import Hero from "./Hero";
import Services from "./Services";
import AboutUs from "./AboutUs";
import Methodology from "./Methodology";
import WhyChooseUs from "./WhyChooseUs";
import Projects from "./Projects";
import Careers from "./Careers";
import Testimonial from "./Testimonial";
import SocialMedia from "./SocialMedia";
import EventBanner from "./EventBanner";

const Home = () => {

  return (
    <>
      <Hero />
      <EventBanner/>
      <Services/>
      <AboutUs/>
      <Methodology/>
      <WhyChooseUs />
      <Projects />
      <Careers />
      <Testimonial />
      <SocialMedia />
    </>
  );
};

export default Home;
