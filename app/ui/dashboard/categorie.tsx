import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData, fetchCategoriesData } from '@/app/lib/data';
import { Categorie, Tag } from '@prisma/client';
import { getSession } from 'next-auth/react';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CategorieWrapper() {
  const categories = await fetchCategoriesData();

  return (
    <>
      {categories.map((categorie: Categorie, index: any) => (
        <Categorie key={index} title="Collected" categorie={categorie} type="collected" />
      ))}
    </>
  );
}

export function Categorie({
  title,
  categorie,
  type,
}: {
  title: string;
  categorie: any;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {categorie.nom}
      </p>
      {categorie.tags.map((tag: any, index: any) => (
        <span key={index} className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
          {tag.tag.nom}
        </span>
      ))}
    </div>
  );
}
