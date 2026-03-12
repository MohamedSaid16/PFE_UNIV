/*
  MainLayout — public pages layout (Navbar + content + Footer).
  Converted from friend's TS. Uses our Navbar/Footer components.
*/

import React from 'react';
import Navbar from '../../common/Navbar';
import Footer from '../../common/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
