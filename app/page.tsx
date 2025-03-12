import Login from "@/components/login";
import Image from "next/image";
import { EB_Garamond, Inter } from "next/font/google";

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
const inter = Inter({ subsets: ["latin"] });
export default function Home() {
  return (
    <div className={`flex overflow-hidden justify-between items-center px-5 ${inter.className}  `}>
      <div className=" overflow-hidden    relative w-1/2  mt-[8px] h-[99vh] bg-gradient-to-b   to-[138%] rounded-t-[68px] to-[#fc7348] -z-10  from-black">
        <div className="leftSide absolute inset-0 w-full h-full  bg-radial-[at_50%_28%] to-transparent  from-[10%] from-black -z-10   "></div>
        <svg style={{ display: "none" }}>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="6.29" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        </svg>
        <div className="flex flex-col items-center justify-center h-full w-full gap-8 pb-12  text-white">
            <div className="flex flex-col items-center gap-4">
               <div className={`font-Garamond text-[68px]   text-slate-100  ${garamond.className}`}>Tingle</div>
               <div className="flex flex-col items-center gap-1">
                <div className="text-3xl">Get Started with us</div>
                <div className="max-w-[240px] text-center text-[14px] font-light">Complete this easy steps to registre your account.</div>
               </div>
            </div>
            <div className="flex flex-col gap-3">
               <div className="px-4 w-[320px] py-3 flex  items-center gap-2 backdrop-blur-lg rounded-2xl bg-white/5">
                  <div className="flex text-center py-1 px-3 rounded-full bg-white/10">1</div>
                  <div> Sign up your account</div>
               </div>
               <div className="px-4 w-[320px] py-3 flex  items-center gap-2 backdrop-blur-lg rounded-2xl bg-white/5">
                  <div className="flex text-center py-1 px-3 rounded-full bg-white/10">2</div>
                  <div> Sign up your account</div>
               </div>
               <div className="px-4 w-[320px] py-3 flex  items-center gap-2 backdrop-blur-lg rounded-2xl bg-white/5">
                  <div className="flex text-center py-1 px-3 rounded-full bg-white/10">3</div>
                  <div> Sign up your account</div>
               </div>
            </div>
        </div>

      </div>  
      <div className="w-1/2 z-10 h-[100vh]  py-2 overflow-hidden bg-[#1D1D1F]">
        <Login />
      </div>
    </div>
  );
}
