"use client";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";

import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarMenu from "./SidebarMenu";
import { FaUser } from "react-icons/fa";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

export const SidebarContext = createContext();

export default function Sidebar({ mobileOpen, setMobileOpen, expanded, setExpanded }) {
  const router = useRouter();
  const { data: session } = useSession(); 
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 700;
      setIsMobile(mobile);

      if (!mobile) {
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
      <SidebarContext.Provider value={{ expanded: isMobile ? true : expanded, isMobile }}>

      {(isMobile && mobileOpen) || !isMobile ? (
            <aside
                className={`h-screen fixed top-0 left-0 bg-white border-r border-gray-200 shadow-sm z-20 
            transition-all duration-300 ease-in-out 
            ${isMobile ? "w-screen" : expanded ? "w-[250px]" : "w-[80px]"}`}
            >
              <nav className="h-full flex flex-col relative w-full">
                {/* Header */}
                <div className="p-4 pb-2 flex items-center">
                  <Image src="/logo/cloudPos-logo.png" alt="CloudPos Logo" width={35} height={35} />
                  <p className={`font-bold transition-all ml-3 ${expanded || isMobile ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
                    CloudPos
                  </p>
                </div>

                {/* Sidebar Toggle Button */}
                {!isMobile && (
                    <button
                        onClick={() => setExpanded((curr) => !curr)}
                        className="absolute right-[-10px] top-5 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 shadow-md"
                    >
                      {expanded ? <MdKeyboardArrowLeft size={20} /> : <MdKeyboardArrowRight size={20} />}
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

                {/* Footer with User Info */}
                <div className="border-t border-gray-200 shadow-sm flex p-3 w-full relative">
                  {/* User Avatar */}
                  <div className="flex justify-center items-center bg-orange-200 p-3 rounded-lg">
                    {session?.user?.image ? (
                        <Image src={session.user.image} alt="User Avatar" width={30} height={30} className="rounded-full" />
                    ) : (
                        <FaUser size={20} color="#FF9500" />
                    )}
                  </div>

                  {/* User Info & Dropdown Toggle */}
                  <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded || isMobile ? "w-full ml-3" : "w-0"}`}>
                    <div className="leading-4">
                      <h4 className="font-semibold">{session?.user?.name || "Guest User"}</h4>
                      <span className="text-xs text-gray-600">{session?.user?.email || "No email available"}</span>
                    </div>
                    <button onClick={() => setShowUserMenu((prev) => !prev)} className="ml-2 text-gray-600 hover:text-black">
                      {showUserMenu ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                      <div className="absolute bottom-14 right-3 w-32 bg-white border shadow-lg rounded-md z-50">
                        <button
                            onClick={() => router.push("/homepage/Chains")}
                            className="block w-full text-left px-4 py-2 text-sm text-[#191919] hover:bg-gray-100"
                        >
                          All chains
                        </button>

                        <button
                            onClick={() => router.push("/homepage/properties")}
                            className="block w-full text-left px-4 py-2 text-sm text-[#191919] hover:bg-gray-100"
                        >
                          All Properties
                        </button>

                        <button
                            onClick={() => router.push("/homepage/profiles")}
                            className="block w-full text-left px-4 py-2 text-sm text-[#191919] hover:bg-gray-100"
                        >
                          All Profiles
                        </button>

                        <button
                        onClick={() => {
                          localStorage.removeItem("selectedPropertyID");
                          localStorage.removeItem("selectedProperty");
                          signOut({ callbackUrl: "/login" });
                        }}
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
