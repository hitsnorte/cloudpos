import Pagefamily from '@/src/components/page/family/page';
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-semibold px-4">All Families</h1>
      <Pagefamily />
      <button className="absolute top-4 right-10 bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
          < Plus size={25} />
      </button>
    </div>
  );
}