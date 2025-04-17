import { useContext, useState, useEffect } from "react";
import { SidebarContext } from "./Sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaLayerGroup, FaUnity, FaProductHunt, FaHourglassEnd , FaTable } from "react-icons/fa";
import { MdFamilyRestroom, MdClass } from "react-icons/md";
import { GiFamilyTree } from "react-icons/gi";
import { IoPricetags } from "react-icons/io5";
import { CiViewTimeline } from "react-icons/ci";
import { LuFolderOpenDot, LuFolderOpen, LuFolderCog, LuFolderDot } from "react-icons/lu";
import { useSession } from "next-auth/react";
import {TiShoppingCart} from "react-icons/ti";



function SidebarItem({ icon, text, submenu }) {
    const { expanded } = useContext(SidebarContext);
    const [open, setOpen] = useState(false);

    return (
        <li className="relative">
            <div
                className="flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group hover:bg-indigo-50 text-gray-600"
                onClick={() => submenu && setOpen(!open)}
            >
                {icon && <span className="mr-2">{icon}</span>}
                <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3 opacity-100" : "w-0 opacity-0"}`}>
                    {text}
                </span>
                {submenu && <span className="ml-auto">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>}
            </div>
            {submenu && open && (
                <ul className={`transition-all ${expanded ? "pl-6" : "pl-0 flex flex-col items-center"}`}>
                    {submenu.map((sub, index) => (
                        <SidebarSubItem key={index} {...sub} expanded={expanded} />
                    ))}
                </ul>
            )}
        </li>
    );
}

function SidebarSubItem({ href, text, icon, expanded }) {
    return (
        <li className="flex items-center py-2 px-3 my-1 text-gray-600 hover:bg-indigo-50 rounded-md cursor-pointer">
            {icon && <span>{icon}</span>}
            <a href={href} className={`transition-all ${expanded ? "ml-3 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
                {text}
            </a>
        </li>
    );
}

export default function SidebarMenu() {
    const { data: session } = useSession();
    const { expanded, isMobile } = useContext(SidebarContext); // ✅ Pulling isMobile from context

    const [selectedProperty, setSelectedProperty] = useState(() => localStorage.getItem("selectedProperty") || "");
    const [tempSelectedProperty, setTempSelectedProperty] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(() => JSON.parse(localStorage.getItem("isConfirmed")) || false);
    const [properties, setProperties] = useState([]);

    const menuItems = {
        "Store Settings": {
            icon: <LuFolderCog size={20} />,
            submenu: [
                { href: "/", text: "Dashboard", icon: <TbLayoutDashboardFilled size={18} /> },
                { href: "/homepage/grupos", text: "Groups", icon: <FaTable size={18} /> },
                { href: "/homepage/family", text: "Families", icon: <FaTable size={18} /> },
                { href: "/homepage/subfamilia", text: "SubFamilies", icon: <FaTable size={18} /> },
                { href: "/homepage/product", text: "Products", icon: <FaTable size={18} /> },
                { href: "/homepage/Iva", text: "VAT", icon: <FaTable size={18} /> },
                { href: "/homepage/unit", text: "Unit", icon: <FaTable size={18} /> },
            ],
        },
    };

    const shoppingCartItems = {
        "Shopping cart": {
            icon: <TiShoppingCart size={20} />,
            submenu: [
                { href: "/homepage/Cart", text: "Shopping cart", icon: <TiShoppingCart size={18} /> },
            ],
        },
    };

    useEffect(() => {
        if (session?.propertyNames) {
            setProperties(session.propertyNames);
        }
    }, [session?.propertyNames]);

    useEffect(() => {
        const savedSelectedProperty = localStorage.getItem("selectedProperty");
        const savedIsConfirmed = JSON.parse(localStorage.getItem("isConfirmed"));

        if (savedSelectedProperty && savedIsConfirmed !== null) {
            setSelectedProperty(savedSelectedProperty || "");
            setTempSelectedProperty(savedSelectedProperty || "");
            setIsConfirmed(savedIsConfirmed);
        }
    }, []);

    useEffect(() => {
        if (selectedProperty && isConfirmed) {
            localStorage.setItem("selectedProperty", selectedProperty);
        }
    }, [selectedProperty, isConfirmed]);

    return (
        <div className="p-3">
            <select
                id="selectProperty"
                value={selectedProperty}
                onChange={(e) => {
                    const newPropertyID = e.target.value;

                    if (newPropertyID !== selectedProperty) {
                        setIsConfirmed(false);
                    }

                    setTempSelectedProperty(newPropertyID);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-[#FC9D25]"
            >
                <option value="">Select a property</option>
                {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                        {property.name}
                    </option>
                ))}
            </select>

            {tempSelectedProperty && !isConfirmed && (
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        className="bg-red-500 text-white p-2 rounded"
                        onClick={() => {
                            setSelectedProperty("");
                            setIsConfirmed(false);
                            localStorage.removeItem("selectedProperty");
                            localStorage.removeItem("isConfirmed");
                            window.history.back();
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        className="bg-[#FC9D25] text-white p-2 rounded"
                        onClick={() => {
                            setSelectedProperty(tempSelectedProperty);
                            setIsConfirmed(true);
                            localStorage.setItem("selectedProperty", tempSelectedProperty);
                            localStorage.setItem("isConfirmed", JSON.stringify(true));
                        }}
                    >
                        Proceed
                    </button>
                </div>
            )}

            {(session && selectedProperty && isConfirmed) ? (
                <>
                    {Object.entries(menuItems).map(([key, value]) => (
                        <SidebarItem key={key} text={key} icon={value.icon} submenu={value.submenu} />
                    ))}
                    {isMobile && Object.entries(shoppingCartItems).map(([key, value]) => (
                        <SidebarItem key={key} text={key} icon={value.icon} submenu={value.submenu} />
                    ))}
                </>
            ) : (
                <p className="mt-4 text-gray-500 text-center">Select a property to continue...</p>
            )}
        </div>
    );
}
