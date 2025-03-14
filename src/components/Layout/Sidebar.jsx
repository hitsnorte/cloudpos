"use client";
import { ChevronDown, ChevronUp, ChevronLast, ChevronFirst, X } from "lucide-react";
import { createContext, useEffect, useState } from "react";
import SidebarMenu from "./SidebarMenu";
import { FaUser } from "react-icons/fa";
import Image from "next/image";
import { signOut } from "next-auth/react";

export const SidebarContext = createContext();

export default function Sidebar({ mobileOpen, setMobileOpen, expanded, setExpanded }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 700;
      setIsMobile(mobile);

      // Fecha o menu móvel se a tela for maior que 700px
      if (!mobile) {
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
      <SidebarContext.Provider value={{ expanded: isMobile ? true : expanded }}>
        {(isMobile && mobileOpen) || !isMobile ? (
            <aside
                className={`h-screen fixed top-0 left-0 bg-white border-r border-gray-200 shadow-sm z-50 
          transition-all duration-300 ease-in-out 
          ${isMobile ? "w-screen" : expanded ? "w-[250px]" : "w-[80px]"}`}
            >
              <nav className="h-full flex flex-col relative w-full">
                {/* Cabeçalho */}
                <div className="p-4 pb-2 flex items-center">
                  <Image src="/logo/cloudPos-logo.png" alt="CloudPos Logo" width={35} height={35} />
                  <p className={`font-bold transition-all ml-3 ${expanded || isMobile ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
                    CloudPos
                  </p>
                </div>

                {!isMobile && (
                    <button
                        onClick={() => setExpanded((curr) => !curr)}
                        className="absolute right-[-10px] top-5 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 shadow-md"
                    >
                      {expanded ? <ChevronFirst size={15} /> : <ChevronLast size={15} />}
                    </button>
                )}

                {isMobile && (
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="absolute top-3 right-3 text-gray-600 hover:text-black"
                    >
                      <X size={20} />
                    </button>
                )}

                {/* Menu */}
                <ul className="flex-1 px-3">
                  <SidebarMenu />
                </ul>

                {/* Rodapé com Utilizadr */}
                <div className="border-t border-gray-200 shadow-sm flex p-3 w-full relative">
                  <div className="flex justify-center items-center bg-gray-200 p-3 rounded-lg">
                    <FaUser size={20} color="gray" />
                  </div>
                  <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded || isMobile ? "w-full ml-3" : "w-0"}`}>
                    <div className="leading-4">
                      <h4 className="font-semibold">User Teste</h4>
                      <span className="text-xs text-gray-600">teste@gmail.com</span>
                    </div>
                    <button onClick={() => setShowUserMenu((prev) => !prev)} className="ml-2 text-gray-600 hover:text-black">
                      {showUserMenu ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                      <div className="absolute bottom-14 right-3 w-32 bg-white border shadow-lg rounded-md z-50">
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                  )}
                </div>
              </nav>
            </aside>
        ) : null}
      </SidebarContext.Provider>
  );
}
