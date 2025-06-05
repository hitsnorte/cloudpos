"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function LayoutWrapper({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
      if (window.innerWidth <= 700) {
        setSidebarExpanded(false); // Esconde sidebar no mobile
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar (Sempre renderiza, mas esconde no mobile) */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        expanded={sidebarExpanded} 
        setExpanded={setSidebarExpanded} 
      />

      {/* Conteúdo Principal */}
      <div className="flex flex-col flex-1 transition-all duration-300">
        {/* Navbar (Aparece só no mobile) */}
        {isMobile && <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}

        {/* Páginas (children) */}
        <main
          className={`flex-grow p-6 overflow-auto transition-all duration-300 
            ${isMobile ? "mt-[60px] ml-0" : sidebarExpanded ? "ml-[250px] mt-0" : "ml-[80px] mt-0"}`}
        >
          {children}
        </main>
      </div>

      {/* Overlay no Mobile quando Sidebar estiver aberta */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-opacity-90 z-40"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}
    </div>
  );
}
