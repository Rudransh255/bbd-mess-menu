'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <>
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="BBD Mess home">
          <Image src="/logo.svg" alt="" width={48} height={48} priority />
          <span><strong>BBD MESS</strong><small>YOUR DAILY MENU</small></span>
        </Link>
        <span className="header-mark">EAT WELL. STUDY HARD.</span>
      </div>
    </header>
    <main id="main-content" className="site-main">{children}</main>
    <nav className="bottom-nav" aria-label="Main navigation">
      <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className={pathname === '/' ? 'active' : ''}><span aria-hidden>◫</span> Today</Link>
      <Link href="/week" aria-current={pathname === '/week' ? 'page' : undefined} className={pathname === '/week' ? 'active' : ''}><span aria-hidden>▦</span> Week</Link>
      <Link href="/stores" aria-current={pathname.startsWith('/stores') ? 'page' : undefined} className={pathname.startsWith('/stores') ? 'active' : ''}><span aria-hidden>⌂</span> Nearby Stores</Link>
    </nav>
  </>;
}
