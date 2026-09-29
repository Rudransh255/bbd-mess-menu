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
    <div className="store-menu-photos">{store.menuImages.map((menuImage, index)=><figure className="store-menu-photo" key={menuImage.src}><Image src={menuImage.src} width={menuImage.width} height={menuImage.height} sizes="(max-width: 760px) calc(100vw - 32px), 700px" alt={`Menu photograph ${index + 1} for ${store.name}`}/><figcaption>Original menu photo {store.menuImages.length > 1 ? `${index + 1} of ${store.menuImages.length}` : ''} supplied by the store. Call to confirm current prices.</figcaption></figure>)}</div>
  </div></Shell>;
}
