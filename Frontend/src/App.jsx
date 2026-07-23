import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Componets/CommonComponents/Navbar";
import Header from "./Componets/CommonComponents/Header";
import Footer from "./Componets/Components/Footer";

import ScrollToTop from "./Componets/CommonComponents/ScrollToTop";
import ScrollNavigator from "./Componets/CommonComponents/ScrollNavigator";
import Loader from "./Componets/CommonComponents/Loader";
import FloatingSupport from "./Componets/CommonComponents/FloatingSupport";

function App() {
  const [loading] = useState(false);
  const { pathname, hash } = useLocation();
  const currentRoute = hash?.startsWith("#") ? hash.slice(1) : pathname;
  const isAuthPage = currentRoute === "/login" || currentRoute === "/register";
  const isAdmin = currentRoute === "/admin" || currentRoute.startsWith("/admin/");
  const isEmployee = currentRoute === "/employee" || currentRoute.startsWith("/employee/");
  const showPublicChrome = !isAuthPage && !isAdmin && !isEmployee;

  if (loading) {
    return <Loader />;
  }

  return (
    <section>
      {/* {showPublicChrome && <Header />} */}
      {showPublicChrome && <Navbar />}
      <ScrollToTop/>
      <ScrollNavigator/>
      <Outlet />
      {!isAdmin && <FloatingSupport />}
      <Footer/>
      {/* {showPublicChrome && <Footer />} */}
    </section>
  );
}

export default App;