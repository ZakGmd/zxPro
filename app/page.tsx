import Login from "@/components/login";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex overflow-y-hidden justify-between items-center">
      <div className="w-1/2 h-[100vh]">
      <Image src={"/moody2.jpg"} alt={""} width={1900} height={1400} className=" object-cover w-full h-full " />

      </div>  
      <div className="w-1/2 pl-20 py-2 overflow-hidden bg-black">
        <Login />
      </div>
    </div>
  );
}
