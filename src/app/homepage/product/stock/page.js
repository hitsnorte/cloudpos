import DataTable from '@/src/components/product/page/DataTable';

export default function Home() {
  return (
    <div>
      <h1 className="text-4xl font-semibold text-center my-6">Tabela de Produtos</h1>
      <DataTable />
    </div>
  );
}