"use client"; 

import { useEffect, useState } from "react";

export default function SubfamiliaPage() {
  const [subfamilia, setSubfamilia] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubfamilia, setCurrentSubfamilia] = useState({ id: null, nome: "" });


  // Fetch subfamilias
  useEffect(() => {
    fetch("/api/subfamily/get_subfamily")
      .then((res) => res.json())
      .then((data) => setSubfamilia(data))
      .catch((err) => console.error("Erro ao buscar subfamílias:", err));
  }, []);

  // Handle Create or Edit
  const handleSave = () => {
    if (isEditing) {
      // Editando uma subfamília existente
      fetch(`/api/subfamily/insert_subfamily/${currentsubfamilia.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentsubfamilia),
      })
        .then((res) => res.json())
        .then(() => {
          setIsEditing(false);
          setCurrentSubfamilia({ id: null, nome: "" });
          fetchData();
        })
        .catch((err) => console.error("Erro ao editar subfamília:", err));
  };
}

  // Fetch all subfamilias
  const fetchData = () => {
    fetch("/api/subfamily/get_subfamily")
      .then((res) => res.json())
      .then((data) => setSubfamilia(data))
      .catch((err) => console.error("Erro ao buscar subfamílias:", err));
  };

  // Handle Edit
  const handleEdit = (sub) => {
    setIsEditing(true);
    setCurrentSubfamilia(sub);
  };

  // Handle Delete
  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta subfamília?")) {
      fetch(`/api/subfamily/delete_subfamily/${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => fetchData())
        .catch((err) => console.error("Erro ao excluir subfamília:", err));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Subfamílias</h1>

   

      {/* Tabela */}
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nome</th>
            <th className="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {subfamilia.length > 0 ? (
            subfamilia.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{sub.id}</td>
                <td className="border px-4 py-2">{sub.nome}</td>
                <td className="border px-4 py-2 flex justify-around">
                  <button
                    onClick={() => handleEdit(sub)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border px-4 py-2 text-center">
                Carregando subfamílias...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    
      {/* Formulário para criar/editar subfamília */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold">{isEditing ? "Editar Subfamília" : "Criar Subfamília"}</h2>
        <input
          type="text"
          className="mt-2 p-2 border border-gray-300 rounded"
          placeholder="Nome da Subfamília"
          value={currentSubfamilia.nome}
          onChange={(e) =>
            setcurrentsubfamilia({ ...currentSubfamilia, nome: e.target.value })
          }
        />
        <button
          onClick={handleSave}
          className="ml-4 p-2 bg-green-500 text-white rounded"
        >
          {isEditing ? "Salvar alterações" : "Criar"}
        </button>
      </div>
    </div>
  )
}
