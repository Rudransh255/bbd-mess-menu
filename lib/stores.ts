export const stores = [
  {
    slug: 'kohinoor-dum-biryani',
    name: 'Kohinoor Dum Biryani',
    phone: '73170 77789',
    phoneHref: 'tel:+917317077789',
    menuImage: '/store-menus/kohinoor-menu.png',
  },
] as const;

export function storeBySlug(slug: string) {
  return stores.find(store => store.slug === slug);
}
