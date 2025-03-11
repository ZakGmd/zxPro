"use client"
 



import Image from "next/image";

 
export default  function GoogleLoginButton(){
    
    
    return(
       
       
            <button   className="w-full h-12 flex items-center justify-center self-stretch gap-3  bg-[#1D1D1F]  hover:to-[#fc7348]/30 hover:to-[180%] hover:from-[40%] hover:bg-gradient-to-b hover:from-transparent transition-all duration-300   hover:shadow-[0px_0.0001px_0px_rgba(252,115,72,0.01),inset_0px_0.7px_0px_rgba(0,0,0,0.10)] active:shadow-[0px_0.1px_0px_rgba(252,115,72,0.01),inset_0px_5px_0px_rgba(0,0,0,0.10)]  shadow-[0_2px_2px_rgba(0,0,0,0.1),inset_0px_0.5px_0px_rgba(255,255,255,0.10)]  p-[14px] cursor-pointer bg-gradient-to-br rounded-3xl from-white/5  to-gray-100/0 text-gray-100 text-[16px] font-light leading-5 tracking-[-0.05px] border border-black" 
            ><Image src={"Gicon.svg"} alt={"arrow right icon svg "} width={20} height={20}  /> Sign up with Google</button> 
    
       
        
      
        
        
    )
}