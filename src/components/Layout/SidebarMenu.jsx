import { useContext, useState, useEffect } from "react";
import { SidebarContext } from "./Sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaTable } from "react-icons/fa";
import { LuFolderOpenDot, LuFolderOpen, LuFolderCog, LuFolderDot } from "react-icons/lu";
import { useSession } from "next-auth/react";

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

function SidebarSubItem({ ref, label, icon, expanded }) {
    return (
        <li className="flex items-center py-2 px-3 my-1 text-gray-600 hover:bg-indigo-50 rounded-md cursor-pointer">
            {icon && <span>{icon}</span>}
            <a href={ref} className={`transition-all ${expanded ? "ml-3 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
                {label}
            </a>
        </li>
    );
}

export default function SidebarMenu() {
    const { data: session } = useSession();
    const { expanded } = useContext(SidebarContext);

    const [selectedProperty, setSelectedProperty] = useState(() => {
        return localStorage.getItem("selectedProperty") || null;
    });
    const [tempSelectedProperty, setTempSelectedProperty] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(() => {
        return JSON.parse(localStorage.getItem("isConfirmed")) || false;
    });
    const [properties, setProperties] = useState([]);

    const menuItems = {
           "Store Settings": {
      icon: <LuFolderCog  size={20} />, 
      submenu: [
        {  ref: "/", label: "Dashboard", icon: <TbLayoutDashboardFilled size={18} /> }, 
        { ref: "/homepage/grupos", label: "Groups", icon: <FaTable size={18} /> }, 
        { ref: "/homepage/family", label: "Families", icon: <FaTable size={18} /> },
        { ref: "/homepage/subfamilia", label: "SubFamilies", icon: <FaTable size={18} /> },
        { ref: "/homepage/product", label: "Products", icon: <FaTable size={18} /> },
        { ref: "/homepage/Iva", label: "Iva", icon: <FaTable size={18} /> },
        { ref: "/homepage/Unit", label: "Unit", icon: <FaTable size={18} /> },
            ], 
        },
    };

    // ✅ Corrected Effect: Only fetch properties from session
    useEffect(() => {
        if (session?.propertyNames) {
            setProperties(session.propertyNames);
        }
    }, [session?.propertyNames]);

    return (
        <div className="p-3">
            {/* Property Selection */}
            <select
                id="selectProperty"
                value={selectedProperty || ""}
                onChange={(e) => {
                    const newProperty = e.target.value;

                    if (newProperty !== selectedProperty) {
                        setIsConfirmed(false);
                    }

                    setTempSelectedProperty(newProperty);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-[#FC9D25]"
            >
                <option value="">Select a property</option>
                {properties.map((property) => (
                    <option key={property.id} value={property.tag}>
                        {property.name}
                    </option>
                ))}
            </select>

            {/* Show buttons when a property is selected but not confirmed */}
            {tempSelectedProperty && !isConfirmed && (
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        className="bg-red-500 text-white p-2 rounded"
                        onClick={() => {
                            setSelectedProperty(null);
                            setIsConfirmed(false);
                            localStorage.removeItem("selectedProperty");
                            localStorage.removeItem("isConfirmed");
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

            {/* Sidebar only shows after confirmation */}
            {selectedProperty && isConfirmed && (
                Object.entries(menuItems).map(([key, value]) => (
                    <SidebarItem key={key} text={key} icon={value.icon} submenu={value.submenu} />
                ))
            )}
        </div>
    );
}