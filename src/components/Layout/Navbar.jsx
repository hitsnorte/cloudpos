"use client";
import { IoMenu } from "react-icons/io5";
import { X } from "lucide-react"; // Ícone de fechar
import { FaCloud } from "react-icons/fa";

export default function Navbar({ mobileOpen, setMobileOpen }) {
  return (
    <nav className="w-full fixed top-0 z-50 flex items-center justify-between p-4 bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center gap-2">
        {/* Ícone da nuvem e nome */}
        <FaCloud size={25} color="gray" />
        <span className="font-semibold text-gray-700 text-sm">CloudPos</span>
      </div>
      {/* Botão para abrir/fechar a sidebar no mobile */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="text-2xl text-gray-600 hover:text-black"
      >
        {mobileOpen ? <X /> : <IoMenu />}
      </button>
    </nav>
  );
}
