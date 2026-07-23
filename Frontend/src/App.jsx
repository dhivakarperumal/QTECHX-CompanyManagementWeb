import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Componets/CommonComponents/Navbar";
import Header from "./Componets/CommonComponents/Header";
import Footer from "./Componets/CommonComponents/Footer";

import ScrollToTop from "./Componets/CommonComponents/ScrollToTop";
import ScrollNavigator from "./Componets/CommonComponents/ScrollNavigator";
import Loader from "./Componets/CommonComponents/Loader";
import FloatingSupport from "./Componets/CommonComponents/FloatingSupport";

function App() {
  const [loading] = useState(false);
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/employee" || pathname.startsWith("/employee/");
  const showPublicChrome = !isAuthPage && !isAdminArea;

  if (loading) {
    return <Loader />;
  }

  return (
    <section>
      {showPublicChrome && <Header />}
      {showPublicChrome && <Navbar />}
      <ScrollToTop/>
      <ScrollNavigator/>
      <Outlet />
      <FloatingSupport />
      {showPublicChrome && <Footer />}
    </section>
  );
}

export default App;