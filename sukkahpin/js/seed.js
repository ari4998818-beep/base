// Placeholder content. Every record here is flagged `sample: true` so admins can
// find, edit, replace, or delete it from /#/admin → Samples.
//
// Product links point at store *search* pages, not specific listings, so nothing
// here pretends to be a real product page. Swap them for real links anytime.

const I = (name) => `img/${name}.webp`;

export const SEED_USERS = [
  { id: 'u-gold', name: 'Goldberger Family', display: 'The Goldbergers', city: 'Monsey, NY' },
  { id: 'u-stern', name: 'Chaya Stern', display: 'Chaya S.', city: 'Lakewood, NJ' },
  { id: 'u-weiss', name: 'Yossi Weiss', display: 'A family in Toronto', city: 'Toronto, ON' },
  { id: 'u-klein', name: 'Rivky Klein', display: 'Rivky K.', city: 'Passaic, NJ' },
  { id: 'u-fried', name: 'Mendy Friedman', display: 'The Friedmans', city: 'Brooklyn, NY' },
  { id: 'u-katz', name: 'Shira Katz', display: 'A family in Cedarhurst', city: 'Cedarhurst, NY' },
];

const shop = (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;

// category = the owner-facing tag category; source = the Sukkah Sources shelf.
export const SEED_PRODUCTS = {
  tablecloth: { name: 'Linen Tablecloth', vendor: 'Target', url: 'https://www.target.com/s?searchTerm=linen+tablecloth', price: '$39', category: 'Table', source: 'Linens', note: 'Used two layered together.' },
  rattan: { name: 'Rattan Pendant Shade', vendor: 'IKEA', url: 'https://www.ikea.com/us/en/search/?q=rattan%20pendant', price: '$49.99', category: 'Lighting', note: 'Hung three at different heights.' },
  strings: { name: 'Warm White String Lights, 100 ft', vendor: 'Amazon', url: shop('warm white string lights 100 ft outdoor'), price: '$32', category: 'Lighting', note: 'Zig-zagged under the schach.' },
  curtains: { name: 'Sheer White Curtain Panels', vendor: 'IKEA', url: 'https://www.ikea.com/us/en/search/?q=sheer%20curtains', price: '$24.99 / pair', category: 'Walls', note: 'Clipped straight onto the frame with ring clips.' },
  chairs: { name: 'Woven Dining Chairs', vendor: 'Wayfair', url: 'https://www.wayfair.com/keyword.php?keyword=woven+dining+chair', price: '$189 / pair', category: 'Seating' },
  olive: { name: 'Faux Olive Tree, 6 ft', vendor: 'Amazon', url: shop('faux olive tree 6ft'), price: '$89', category: 'Decor', note: 'Brings them inside for the winter.' },
  bamboo: { name: 'Bamboo Schach Mat', vendor: 'The Sukkah Project', url: 'https://www.sukkah.com/', price: '$65', category: 'Structure' },
  sectional: { name: 'Outdoor Sectional Sofa', vendor: 'Wayfair', url: 'https://www.wayfair.com/keyword.php?keyword=outdoor+sectional', price: '$1,299', category: 'Seating', note: 'Covers go in the wash after Yom Tov.' },
  firepit: { name: 'Round Fire Pit Table', vendor: 'Home Depot', url: 'https://www.homedepot.com/s/fire%20pit%20table', price: '$349', category: 'Decor', note: 'Only on after the meal, obviously.' },
  plates: { name: 'Stoneware Dinner Plates, set of 8', vendor: 'Crate & Barrel', url: 'https://www.crateandbarrel.com/search?query=stoneware%20dinner%20plates', price: '$64', category: 'Table', source: 'Tables' },
  chandelier: { name: 'Plug-in Crystal Chandelier', vendor: 'Amazon', url: shop('plug in crystal chandelier'), price: '$159', category: 'Lighting', note: 'Plug-in, so no electrician needed.' },
  wisteria: { name: 'Faux Wisteria Garland', vendor: 'Amazon', url: shop('artificial wisteria garland'), price: '$26 / 12 pack', category: 'Decor', note: 'Twelve packs. Worth it.' },
  rug: { name: 'Outdoor Rug, 8×10', vendor: 'Wayfair', url: 'https://www.wayfair.com/keyword.php?keyword=outdoor+rug+8x10', price: '$119', category: 'Rugs' },
  deck: { name: 'Interlocking Deck Tiles', vendor: 'IKEA', url: 'https://www.ikea.com/us/en/search/?q=runnen', price: '$24.99 / 9 pack', category: 'Flooring' },
  kidsKit: { name: 'Kids’ Sukkah Decorations Kit', vendor: 'Eichlers', url: 'https://www.eichlers.com/search?q=sukkah%20decorations', price: '$18', category: 'Kids', note: 'The kids did every single one.' },
  balloons: { name: 'Balloon Garland Kit', vendor: 'Amazon', url: shop('balloon garland kit pink white'), price: '$22', category: 'Kids' },
  pallets: { name: 'Cedar Fence Pickets', vendor: 'Home Depot', url: 'https://www.homedepot.com/s/cedar%20fence%20picket', price: '$4.28 each', category: 'DIY', note: 'Sanded and left raw. Took one Sunday.' },
  glasshouse: { name: 'Aluminum Greenhouse Frame', vendor: 'Amazon', url: shop('aluminum greenhouse frame kit'), price: '$1,150', category: 'Structure', note: 'Roof panels come off. Schach goes on top.' },
  vase: { name: 'Matte Ceramic Vase', vendor: 'Target', url: 'https://www.target.com/s?searchTerm=ceramic+vase', price: '$25', category: 'Decor' },
  pillows: { name: 'Outdoor Throw Pillows', vendor: 'Target', url: 'https://www.target.com/s?searchTerm=outdoor+throw+pillows', price: '$20 each', category: 'Bedding', source: 'Linens' },
  ushpizin: { name: 'Ushpizin Wall Print', vendor: 'Eichlers', url: 'https://www.eichlers.com/search?q=ushpizin', price: '$30', category: 'Judaica / Sukkos Decor' },
  panels: { name: 'Snap-Together Sukkah Panels', vendor: 'The Sukkah Project', url: 'https://www.sukkah.com/', price: 'from $399', category: 'Panels' },
};

// photo: [src, label, hotspots[[productKey, x%, y%]]]
const P = (src, label, spots = []) => ({ src: I(src), label, hotspots: spots.map(([p, x, y]) => ({ p, x, y })) });

const daysAgo = (d) => new Date(Date.now() - d * 864e5).toISOString();

export const SEED_SUKKAHS = [
  {
    slug: 'sunset-sukkah', title: 'The Sunset Sukkah', location: 'Monsey, NY', owner: 'u-gold', votes: 767, createdAt: daysAgo(3),
    categories: ['Outdoor', 'Luxury', 'Lighting'], tags: ['Rooftop', 'Pergola', 'Lighting'],
    description: 'Built on the back deck so the table faces west. By the time Kiddush is over the whole sukkah turns gold.',
    special: 'Three rattan lanterns at different heights, and every chair faces the view.',
    featured: true, editorsPick: true,
    photos: [
      P('hero-pergola', 'Inside', [['rattan', 44, 40], ['curtains', 18, 50], ['vase', 51, 90]]),
      P('pergola-table', 'Table', [['tablecloth', 42, 84], ['chairs', 64, 92], ['plates', 55, 80]]),
      P('lanterns', 'Lighting', [['rattan', 35, 70]]),
      P('trees-view', 'Outside', [['olive', 56, 58]]),
      P('table-detail', 'Details', [['vase', 38, 70], ['plates', 60, 78]]),
      P('night-lights', 'Night', [['strings', 50, 14]]),
    ],
  },
  {
    slug: 'greenhouse-sukkah', title: 'The Greenhouse Sukkah', location: 'Monsey, NY', owner: 'u-gold', votes: 842, createdAt: daysAgo(6),
    categories: ['Modern', 'Outdoor', 'Creative'], tags: ['Modern', 'Outdoor', 'Creative'],
    description: 'A black aluminum greenhouse frame with the roof panels removed. Schach on top, glass all around, and a hundred feet of string lights.',
    special: 'At night it glows like a lantern from the street.',
    featured: true, hero: 1,
    photos: [
      P('greenhouse', 'Outside', [['glasshouse', 52, 32], ['strings', 40, 58]]),
      P('night-lights', 'Night', [['strings', 50, 14], ['sectional', 30, 80]]),
      P('greenhouse-top', 'Schach', [['bamboo', 50, 40]]),
      P('table-detail', 'Table', [['plates', 60, 78]]),
      P('lanterns', 'Lighting', [['rattan', 35, 70]]),
    ],
  },
  {
    slug: 'linen-sukkah', title: 'The Linen Sukkah', location: 'Lakewood, NJ', owner: 'u-stern', votes: 691, createdAt: daysAgo(4),
    categories: ['Luxury', 'DIY'], tags: ['Elegant', 'Classic', 'DIY'],
    description: 'All white, all linen. The walls are curtain panels clipped to a standard frame, so the whole look went up in an afternoon.',
    special: 'We seat twenty-two without it ever feeling crowded.',
    photos: [
      P('linen', 'Inside', [['tablecloth', 50, 82], ['chairs', 22, 82], ['curtains', 12, 40]]),
      P('linen-top', 'Schach', [['bamboo', 50, 20]]),
      P('t-modern', 'Table', [['vase', 50, 56], ['tablecloth', 50, 88]]),
      P('vines-curtain', 'Walls', [['curtains', 50, 60]]),
      P('table-detail', 'Details', [['plates', 60, 78]]),
    ],
  },
  {
    slug: 'cozy-sukkah', title: 'The Cozy Sukkah', location: 'Toronto, ON', owner: 'u-weiss', votes: 588, createdAt: daysAgo(2),
    categories: ['Small Space', 'Outdoor'], tags: ['Small Space', 'Budget', 'Decor'],
    description: 'Toronto gets cold. So we skipped the long table and built a living room with a fire pit, blankets, and the good pillows.',
    special: 'Everyone ends up out here after the meal.',
    featured: true, hero: 2,
    photos: [
      P('cozy', 'Inside', [['sectional', 50, 58], ['olive', 8, 70]]),
      P('cozy-top', 'Schach', []),
      P('firepit-lounge', 'Details', [['firepit', 53, 86], ['sectional', 22, 72], ['pillows', 40, 62]]),
      P('t-small', 'Outside', [['pillows', 42, 84]]),
      P('t-outdoor', 'Night', [['firepit', 50, 86], ['strings', 50, 18]]),
    ],
  },
  {
    slug: 'floral-sukkah', title: 'The Floral Sukkah', location: 'Passaic, NJ', owner: 'u-klein', votes: 473, createdAt: daysAgo(5),
    categories: ['Creative', 'Luxury'], tags: ['Creative', 'Luxury', 'Lighting'],
    description: 'Eleven packs of wisteria wired into the schach, sheer panels on every side, and one long table down the middle.',
    special: 'It smells like nothing, but it looks like a garden.',
    featured: true, hero: 3,
    photos: [
      P('floral', 'Inside', [['wisteria', 50, 12], ['tablecloth', 50, 80]]),
      P('floral-top', 'Schach', [['wisteria', 45, 30]]),
      P('vines-curtain', 'Walls', [['curtains', 50, 60], ['wisteria', 40, 14]]),
      P('t-creative', 'Details', [['wisteria', 50, 18], ['chandelier', 46, 46]]),
    ],
  },
  {
    slug: 'rooftop-sukkah', title: 'The Rooftop Sukkah', location: 'Brooklyn, NY', owner: 'u-fried', votes: 912, createdAt: daysAgo(9),
    categories: ['Balcony', 'Outdoor', 'Modern'], tags: ['Balcony', 'City View', 'Modern'],
    description: 'Fourth-floor roof in Boro Park. Deck tiles over the tar, snap-together panels, and the whole skyline for a wall.',
    special: 'Our neighbors come up just to see the view on Chol Hamoed.',
    photos: [
      P('t-balcony', 'Outside', [['sectional', 50, 88]]),
      P('trees-view', 'Details', [['olive', 56, 58]]),
      P('pergola-table', 'Table', [['tablecloth', 42, 84], ['chairs', 64, 92]]),
      P('night-lights', 'Night', [['strings', 50, 14]]),
    ],
  },
  {
    slug: 'minimal-sukkah', title: 'The Minimal Sukkah', location: 'Cedarhurst, NY', owner: 'u-katz', votes: 356, createdAt: daysAgo(1),
    categories: ['Modern', 'Small Space'], tags: ['Minimal', 'Modern', 'Small Space'],
    description: 'White walls, one vase, and nothing else. We wanted the schach and the light to do the decorating.',
    special: 'Nothing on the walls, on purpose.',
    photos: [
      P('t-modern', 'Inside', [['vase', 50, 56], ['tablecloth', 50, 88]]),
      P('t-diy', 'Schach', [['bamboo', 30, 24], ['olive', 60, 60]]),
      P('table-detail', 'Table', [['vase', 38, 70], ['plates', 60, 78]]),
    ],
  },
  {
    slug: 'family-sukkah', title: 'The Family Sukkah', location: 'Baltimore, MD', owner: 'u-weiss', votes: 534, createdAt: daysAgo(7),
    categories: ['Family', 'DIY'], tags: ['Family', 'DIY', 'Kids'],
    description: 'Seven kids, seven opinions. Every decoration in here was made or picked by one of them, and the balloons were non-negotiable.',
    special: 'The kids built the benches with their zeidy.',
    photos: [
      P('t-family', 'Inside', [['balloons', 36, 10], ['kidsKit', 70, 40]]),
      P('t-diy', 'Schach', [['pallets', 30, 24]]),
      P('pergola-table', 'Table', [['tablecloth', 42, 84]]),
      P('cozy-top', 'Details', [['olive', 30, 50]]),
    ],
  },
  {
    slug: 'chandelier-sukkah', title: 'The Chandelier Sukkah', location: 'Lakewood, NJ', owner: 'u-stern', votes: 298, createdAt: daysAgo(0.5),
    categories: ['Luxury'], tags: ['Luxury', 'Lighting', 'Elegant'],
    description: 'A plug-in crystal chandelier in a sukkah. People laughed. Then they sat down.',
    special: 'The chandelier cost less than the tablecloths.',
    photos: [
      P('t-luxury', 'Lighting', [['chandelier', 50, 28], ['vase', 50, 72]]),
      P('linen', 'Inside', [['tablecloth', 50, 82], ['curtains', 12, 40]]),
      P('t-modern', 'Table', [['ushpizin', 20, 30]]),
    ],
  },
  {
    slug: 'pallet-sukkah', title: 'The Pallet Sukkah', location: 'Monroe, NY', owner: 'u-fried', votes: 214, createdAt: daysAgo(0.2),
    categories: ['DIY', 'Creative', 'Outdoor'], tags: ['DIY', 'Budget', 'Creative'],
    description: 'Cedar pickets, one weekend, zero experience. The slats let the light through in stripes.',
    special: 'Total cost for the walls was under $300.',
    photos: [
      P('t-diy', 'Schach', [['pallets', 30, 24], ['olive', 60, 60]]),
      P('firepit-lounge', 'Outside', [['firepit', 53, 86]]),
      P('lanterns', 'Lighting', [['rattan', 35, 70]]),
      P('t-outdoor', 'Night', [['strings', 50, 18]]),
    ],
  },
];

export const SEED_SETTINGS = {
  heroStat: '500+',
  contestLine: 'Voting is open through Hoshana Rabbah. Winners are announced after Yom Tov.',
};
