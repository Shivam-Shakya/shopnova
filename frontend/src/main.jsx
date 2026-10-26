import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { StoreProvider } from "./context/StoreContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Account from "./pages/Account";
import CategoryListing from "./pages/CategoryListing";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Footer from "./components/Footer";
import HelpCenter from "./pages/info/HelpCenter";
import ShippingDelivery from "./pages/info/ShippingDelivery";
import ReturnsExchanges from "./pages/info/ReturnsExchanges";
import PrivacyPolicy from "./pages/info/PrivacyPolicy";
import TermsOfService from "./pages/info/TermsOfService";
import "./styles.css";

function AppLayout() {
  const loc = useLocation();
  const admin = loc.pathname.startsWith("/admin");
  
  // 1. Initial loading state define ki gayi hai
  const [isSiteLoading, setIsSiteLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  // 2. Timer set kiya gaya hai (1.5 seconds ke baad loading false ho jayegi)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSiteLoading(false);
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

  // 3. Jab tak loading true hai, sirf gole wala loader dikhega
  if (isSiteLoading) {
    return (
      <div className="circular-loader-wrapper" style={{ height: "100vh" }}>
        <div className="gole-spinner"></div>
        <p className="loader-text">Loading Shopnova...</p>
      </div>
    );
  }

  // 4. Loading false hone par main website render hogi
  return (
    <>
      {!admin && <Header />}
      <AnimatePresence mode="wait">
        <motion.div
          key={loc.pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Account />} />
            <Route path="/account" element={<Account />} />
            <Route path="/category/:category" element={<CategoryListing />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/shipping-delivery" element={<ShippingDelivery />} />
            <Route path="/returns-exchanges" element={<ReturnsExchanges />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route
              path="*"
              element={
                <main className="empty-state page-empty">
                  <h1>That page wandered off.</h1>
                  <a href="/" className="btn btn-dark">
                    Back to ShopNova
                  </a>
                </main>
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {!admin && <Footer />}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <AppLayout />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
);