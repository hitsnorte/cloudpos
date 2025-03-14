import DataTable from '@/src/components/page/product/PageTable';

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-semibold px-4">All Products</h1>
      <DataTable />
    </div>
  );
}