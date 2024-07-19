// HomePage.js
import React from "react";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Header from '../../components/common/Header/Header'
import HomeSearch from '../../components/common/HomeSearch/HomeSearch'
import ReviewPortal from '../../components/common/ReviewPortal/ReviewPortal'
import AboutUs from '../../components/common/AboutUs/AboutUs'

const HomePage = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div>
      <div className="header-container">
       <Header/>
      </div>
      <div className="outlet-container">
        <Outlet />
        {isHome && (
          <>
            <HomeSearch />
            <ReviewPortal />
            <AboutUs />
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
