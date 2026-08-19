import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./Componets/CommonComponents/Navbar";
import Footer from "./Componets/Components/Footer";

import ScrollToTop from "./Componets/CommonComponents/ScrollToTop";
import ScrollNavigator from "./Componets/CommonComponents/ScrollNavigator";
import FloatingSupport from "./Componets/CommonComponents/FloatingSupport";
import Loader from "./Componets/CommonComponents/Loader";
import { useAuth } from "./PrivateRouter/AuthContext";

function App() {
  const [loading] = useState(false);
  const { user } = useAuth();
  const { pathname, hash } = useLocation();
  const currentRoute = hash?.startsWith("#") ? hash.slice(1) : pathname;
  const isAuthPage = currentRoute === "/login" || currentRoute === "/register";
  const isAdmin = currentRoute === "/admin" || currentRoute.startsWith("/admin/");
  const isEmployee =
    currentRoute === "/employee" ||
    currentRoute.startsWith("/employee/") ||
    currentRoute === "/trainee" ||
    currentRoute.startsWith("/trainee/");
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
      <FloatingSupport />
      <Outlet />
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{ zIndex: 20000 }}
        toastOptions={{
          style: {
            zIndex: 20000,
          },
        }}
      />
      {showPublicChrome && <Footer />}
      {/* {showPublicChrome && <Footer />} */}
    </section>
  );
}

export default App;