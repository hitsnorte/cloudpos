import { useContext, useState, useEffect } from "react";
import { SidebarContext } from "./Sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaTable } from "react-icons/fa";
import { LuFolderOpenDot, LuFolderOpen, LuFolderCog, LuFolderDot } from "react-icons/lu";
import { Select, SelectItem } from "@heroui/react";

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
    const { expanded } = useContext(SidebarContext);
    const [selectedProperty, setSelectedProperty] = useState(() => {
        return localStorage.getItem("selectedProperty") || null;
    });
    const [tempSelectedProperty , setTempSelectedProperty] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch("/api/properties");
                if (!response.ok) throw new Error("Failed to fetch properties");
                const data = await response.json();
                setProperties(data);
            } catch (error) {
                console.error("Error fetching properties:", error);
            }
        };
        fetchProperties();
    }, []);

    const menuItems = {
        "Dashboard": {
            icon: <LuFolderCog size={20} />,
            submenu: [{ ref: "/", label: "Dashboard", icon: <TbLayoutDashboardFilled size={18} /> }],
        },
        "Groups": {
            icon: <LuFolderCog size={20} />,
            submenu: [{ ref: "/homepage/grupos", label: "All Groups", icon: <FaTable size={18} /> }],
        },
        "Families": {
            icon: <LuFolderDot size={20} />,
            submenu: [{ ref: "/homepage/family", label: "All Families", icon: <FaTable size={18} /> }],
        },
        "Sub Families": {
            icon: <LuFolderOpenDot size={20} />,
            submenu: [{ ref: "/homepage/subfamilia", label: "All SubFamilies", icon: <FaTable size={18} /> }],
        },
        "Products": {
            icon: <LuFolderOpen size={20} />,
            submenu: [{ ref: "/homepage/product", label: "All Products", icon: <FaTable size={18} /> }],
        },
    };

    return (
        <div className="p-3">
            {/* Property Selection */}
            <Select
                className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Select a property"
                value={selectedProperty}
                onChange={(value) => {
                    const newProperty = value?.target?.value || value;

                    // If user selects a new property, reset confirmation state
                    if (newProperty !== selectedProperty) {
                        setIsConfirmed(false);
                    }

                    setTempSelectedProperty(newProperty);
                }}
            >
                {properties.map((property) => (
                    <SelectItem key={property.propertyID} value={property.propertyTag} className="bg-white hover:bg-gray-100 text-gray-900">
                        {property.propertyName}
                    </SelectItem>
                ))}
            </Select>

            {/* Mostra botoões quando uma propriedade é escolhida mas não confirmada */}
            {tempSelectedProperty && !isConfirmed && (
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        className="bg-red-500 text-white p-2 rounded"
                        onClick={() => setSelectedProperty(null)}
                    >
                        Cancel
                    </button>

                    <button
                        className="bg-[#FC9D25] text-white p-2 rounded"
                        onClick={() => {
                            setSelectedProperty(tempSelectedProperty);
                            setIsConfirmed(true);
                            localStorage.setItem("selectedProperty" , tempSelectedProperty);
                        }}
                    >
                        Proceed
                    </button>

                </div>
            )}

            {/* Sidebar só mostra depois da confirmacao */}
            {selectedProperty && (
                Object.entries(menuItems).map(([key, value]) => (
                    <SidebarItem key={key} text={key} icon={value.icon} submenu={value.submenu} />
                ))
            )}
        </div>
    );
}
