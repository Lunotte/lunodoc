import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { GetSessionParams, getSession } from 'next-auth/react';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers'




export default function AcmeLogo({ user }: any) {


 // const session = await getSession(req);

  //const { data: session } = useSession();
  // console.log('quel cote', cookies.name);

  
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
       {/* {session ? (
        <p>Bienvenue, {session.user?.name} !</p>
      ) : (
        <p>Veuillez vous connecter.</p>
      )} */}
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[44px] ">Acme</p>
    </div>
  );
}
