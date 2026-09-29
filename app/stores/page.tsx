import Link from 'next/link';
import { Shell } from '../components/shell';
import { stores } from '@/lib/stores';

export default function StoresPage() {
  return <Shell><div className="page-wrap stores-page">
    <div className="page-kicker"><span>BBD MESS / NEARBY</span><span>{stores.length} STORES</span></div>
    <div className="page-title"><p className="eyebrow">FOOD AROUND CAMPUS</p><h1>Nearby<br/><span>stores.</span></h1><p>Tap a store to see its phone number and original menu photo.</p></div>
    <div className="store-grid">{stores.map((store,index)=><article className="store-card" key={store.slug}>
      <span className="store-number">{String(index+1).padStart(2,'0')}</span>
      <div><p className="eyebrow">FOOD DELIVERY</p><h2>{store.name}</h2><a className="store-phone" href={store.phoneHref} aria-label={`Call ${store.name} at ${store.phone}`}>{store.phone}</a></div>
      <Link className="primary-button" href={`/stores/${store.slug}`}>VIEW MENU</Link>
    </article>)}</div>
  </div></Shell>;
}
