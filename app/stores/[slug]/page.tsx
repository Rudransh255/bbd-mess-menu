import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell } from '../../components/shell';
import { storeBySlug, stores } from '@/lib/stores';

export function generateStaticParams() { return stores.map(({slug})=>({slug})); }

export default async function StorePage({params}:{params:Promise<{slug:string}>}) {
  const store=storeBySlug((await params).slug); if(!store) notFound();
  return <Shell><div className="page-wrap store-detail">
    <Link className="text-link" href="/stores">← ALL NEARBY STORES</Link>
    <div className="page-title"><p className="eyebrow">NEARBY STORE</p><h1>{store.name}</h1><p>Call the store directly to confirm prices, availability and delivery.</p></div>
    <section className="store-contact" aria-label="Store contact"><div><span>PHONE NUMBER</span><strong>{store.phone}</strong></div><a className="primary-button" href={store.phoneHref}>CALL STORE</a></section>
    <figure className="store-menu-photo"><Image src={store.menuImage} width={540} height={810} sizes="(max-width: 760px) calc(100vw - 32px), 700px" alt={`Menu photograph for ${store.name}`}/><figcaption>Original menu photo supplied by the store. Call to confirm current prices.</figcaption></figure>
  </div></Shell>;
}
