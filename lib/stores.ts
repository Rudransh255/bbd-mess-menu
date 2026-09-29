export const stores = [
  {
    slug: 'kohinoor-dum-biryani',
    name: 'Kohinoor Dum Biryani',
    phone: '73170 77789',
    phoneHref: 'tel:+917317077789',
    menuImages: [{ src: '/store-menus/kohinoor-menu.png', width: 536, height: 806 }],
  },
  {
    slug: 'taj-famous-biriyani',
    name: 'Taj Famous Biriyani',
    phone: '80522 45471, 73076 40258',
    phoneHref: 'tel:+918052245471',
    menuImages: [
      { src: '/store-menus/taj-menu1.png', width: 507, height: 697 },
      { src: '/store-menus/taj-menu2.png', width: 462, height: 695 },
    ],
  },
] as const;

export function storeBySlug(slug: string) {
  return stores.find(store => store.slug === slug);
}
