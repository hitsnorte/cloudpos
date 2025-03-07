import { useContext, useState } from "react";
import { SidebarContext } from "./Sidebar"; // Importa o contexto da Sidebar
import { ChevronDown, ChevronRight } from "lucide-react";
import { TbLayoutDashboardFilled } from "react-icons/tb"; // Ícone para o submenu

import { FaTable } from "react-icons/fa"
import { LuFolderOpenDot, LuFolderOpen, LuFolderCog, LuFolderDot } from "react-icons/lu";




// Item de menu principal
function SidebarItem({ icon, text, active, alert, submenu }) {
  const { expanded } = useContext(SidebarContext);
  const [open, setOpen] = useState(false);

  return (
    <li className="relative">
      <div
        className={`flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group 
          ${active ? "bg-indigo-100 text-indigo-800" : "hover:bg-indigo-50 text-gray-600"}`}
        onClick={() => submenu && setOpen(!open)}
      >
        {/* Ícone do menu sempre visível */}
        {icon && <span className="mr-2">{icon}</span>}
        
        {/* Texto do menu some quando retraído */}
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3 opacity-100" : "w-0 opacity-0"}`}>
          {text}
        </span>

        {/* Ícone do submenu (Chevron) sempre visível */}
        {submenu && (
          <span className="ml-auto">
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}

        {alert && <div className="absolute right-2 w-2 h-2 rounded bg-indigo-400" />}
      </div>

      {/* Submenu */}
      {submenu && open && (
        <ul className={`transition-all ${expanded ? "pl-6" : "pl-0 flex flex-col items-center"} `}>
          {submenu.map((sub, index) => (
            <SidebarSubItem key={index} {...sub} expanded={expanded} />
          ))}
        </ul>
      )}
    </li>
  );
}

// Subitem de menu (submenu)
function SidebarSubItem({ ref, label, icon, expanded }) {
  return (
    <li className={`flex items-center py-2 px-3 my-1 text-gray-600 hover:bg-indigo-50 rounded-md cursor-pointer 
        ${expanded ? "justify-start" : "justify-center"}`}>
      
      {/* Ícone do submenu sempre visível */}
      {icon && <span>{icon}</span>}

      {/* Texto do submenu some quando retraído */}
      <a href={ref} className={`transition-all ${expanded ? "ml-3 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
        {label}
      </a>
    </li>
  );
}

// Menu completo
export default function SidebarMenu() {
  const { expanded } = useContext(SidebarContext);

  const menuItems = {
    "Groups": {
      icon: <LuFolderCog  size={20} />, 
      submenu: [
        { ref: "/#", label: "Dashboard", icon: <TbLayoutDashboardFilled size={18} /> }, 
        { ref: "/homepage/grupos", label: "All Groups", icon: <FaTable size={18} /> }, 
      ],
    },
    "Families": {
      icon: <LuFolderDot size={20} />,
      submenu: [
                { ref: "/homepage/family", label: "All Families", icon: <FaTable size={18} /> },
      ],
    },
    "Sub Families": {
      icon: <LuFolderOpenDot  size={20} />, 
      submenu: [
        { ref: "/homepage/product/stock", label: "All SubFamilies", icon: <FaTable size={18} /> }, //Criar tabela da sub familia e colocar o caminho
      ],

    },
    "Producs": {
      icon: <LuFolderOpen  size={20} />, 
      submenu: [
        { ref: "/homepage/product/stock", label: "All Producs", icon: <FaTable size={18} /> }, 
      ],
    },
   
    
  };

  return (
    <>
      {Object.entries(menuItems).map(([key, value]) => (
        <SidebarItem key={key} text={key} icon={value.icon} submenu={value.submenu} />
      ))}
    </>
  );
}
