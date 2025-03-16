"use client"
import { EB_Garamond, Inter } from "next/font/google";

import { useEffect, useState } from "react";
import GoogleLoginButton from "./goglBtn";
import Image from "next/image";
import Link from "next/link";

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
const inter = Inter({ subsets: ["latin"] });
const footerItems= {
  main: [
    { label: 'About', path: '/about' },
   
    { label: 'Help Centre', path: '/help' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Cookie Policy', path: '/cookies' },
    { label: 'Accessibility', path: '/accessibility' },
    
  ],
}

export default function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailGradientWidth, setEmailGradientWidth] = useState('40%');
  const [passwordGradientWidth, setPasswordGradientWidth] = useState('40%');

  // Effect to update gradient width based on input length
  useEffect(() => {
    // Calculate width based on input length (min 5%, max 100%)
    const newEmailWidth = email.length ? Math.min(40 + email.length * 6, 100) : 40;
    setEmailGradientWidth(`${newEmailWidth}%`);
    
    const newPasswordWidth = password.length ? Math.min(40 + password.length * 6, 100) : 40;
    setPasswordGradientWidth(`${newPasswordWidth}%`);
  }, [email, password]);

    return (
        <div className={` ${inter.className} h-[calc(100vh-20px)]  flex flex-col  items-center mx-auto justify-between bg-gradient-to-r from-[#1D1D1F] to-transparent text-white   py-7 rounded-2xl`}>
          <div className=""></div>
                   
          <div className="flex flex-col mt-4 ">
                    <div className={`mb-8 ${garamond.className} text-3xl `}>Add Your Brilliance</div>
                    <div className="flex flex-col items-start gap-2">
                      <GoogleLoginButton/>
                      <button   className="w-full h-12 pr-[19px] flex items-center justify-center self-stretch gap-3  bg-[#1D1D1F]  hover:to-[#fc7348]/30 hover:to-[180%] hover:from-[40%] hover:bg-gradient-to-b hover:from-transparent transition-all duration-300   hover:shadow-[0px_0.0001px_0px_rgba(252,115,72,0.01),inset_0px_0.7px_0px_rgba(0,0,0,0.10)] active:shadow-[0px_0.1px_0px_rgba(252,115,72,0.01),inset_0px_5px_0px_rgba(0,0,0,0.10)]  shadow-[0_2px_2px_rgba(0,0,0,0.1),inset_0px_0.5px_0px_rgba(255,255,255,0.10)]  p-[14px] cursor-pointer bg-gradient-to-br rounded-3xl from-white/5  to-gray-100/0 text-gray-100 text-[16px] font-light leading-5 tracking-[-0.05px] border border-black"
                      ><Image src={"aplSvg.svg"} alt={"arrow right icon svg "} width={22} height={22}  />Sign up with Apple</button> 
                      <div className="flex items-center gap-4 my-4 ">
                          <div className="w-[200px] h-[1px] bg-transparent shadow-[0_0.2px_0px_rgba(255,255,255,0.15),inset_0px_1px_0px_rgba(0,0,0,0.95)]"></div>
                          <div className="text-[16px] leading-5  font-normal text-slate-50  ">Or</div>
                          <div className="w-[200px] h-[1px] bg-transparent shadow-[0_0.2px_0px_rgba(255,255,255,0.15),inset_0px_1px_0px_rgba(0,0,0,0.95)]"></div>
                      </div>
                    </div>
                    <div className='px-3 h-11 w-[448px] mb-2 text-[18px]   border text-white  text-center flex items-center justify-center rounded-3xl  border-black bg-[#fc7348]/60 font-light cursor-pointer hover:bg-[#fc7348] hover:bg-gradient-to-b hover:from-transparent transition-all duration-300   hover:shadow-[0px_0.4px_0px_rgba(0,0,0,0.4),inset_0px_2px_0px_rgba(0,0,0,0.10)] active:shadow-[0px_0.1px_0px_rgba(252,115,72,0.01),inset_0px_5px_0px_rgba(0,0,0,0.10)]  shadow-[0_1.1px_2px_rgba(0,0,0,0.65),inset_0px_0.7px_0px_rgba(255,255,255,0.15)]'>Create an account</div>
                    <div className="text-start text-[12px] font-light max-w-[384px] text-slate-100/50 mb-8">By signing up, you agree to the <span className="text-[#fc7348]"> Terms of Service </span>and <span className="text-[#fc7348]">Privacy Policy</span>, including <span className="text-[#fc7348]">Cookie Use.</span> </div>
                    <div className="mb-4 ">Already have an account?</div>
                    <div className='px-3 py-5 h-11 w-[448px]  mb-2 text-[16px] bg-gradient-to-b from-transparent from-[34%] to-[#fc7348]/10 gap-1   text-white  text-center flex items-center justify-center rounded-3xl
                                   font-light cursor-pointer  duration-300 border border-black  hover:shadow-[0px_0.4px_0px_rgba(0,0,0,0.4),inset_0px_2px_0px_rgba(0,0,0,0.10)] 
                                     transition-shadow  
                                    shadow-[0_1.1px_2px_rgba(0,0,0,0.65),inset_0px_1px_1px_rgba(255,255,255,0.20)]'>Sign in <Image src={"loginIcon.svg"} alt={""} width={20} height={20} />  </div>
          </div>

          <div>
                  <ul className="items-center gap-3 flex">
                    {footerItems.main.map((item, index) => (
                      <li key={index}>
                        <Link href={item.path} className="hover:underline text-white/30 text-[14px]">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
          </div>
        </div>
    )
}