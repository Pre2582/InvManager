/** Shared random-data helpers used by every "create" form's Autofill button. */

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ── Names ─────────────────────────────────────────────────────────────────────
const FIRST = [
  'Aarav','Priya','Rohan','Ananya','Vikram','Neha','Arjun','Kavya',
  'Dev','Riya','Rahul','Sunita','Amit','Pooja','Kiran','Siddharth',
  'Meera','Tarun','Divya','Nikhil',
];
const LAST = [
  'Sharma','Patel','Singh','Kumar','Joshi','Gupta','Mehta','Shah',
  'Verma','Nair','Reddy','Iyer','Das','Malhotra','Chopra','Tiwari',
  'Pandey','Rao','Bose','Kapoor',
];

// ── Product catalogue ─────────────────────────────────────────────────────────
const PRODUCT_TEMPLATES = [
  { name:'Wireless Bluetooth Speaker',      prefix:'SPK', desc:'Portable 360° sound, 12 h battery, IPX7 waterproof.' },
  { name:'Smart Fitness Tracker Band',       prefix:'FIT', desc:'Heart rate, SpO₂, sleep tracking, 7-day battery.' },
  { name:'Portable Power Bank 20000 mAh',   prefix:'PWR', desc:'Dual USB-A + USB-C, 65 W PD fast charge, LED indicator.' },
  { name:'Gaming Mouse Pad XL',             prefix:'MPD', desc:'Non-slip base, stitched edges, 90×40 cm surface.' },
  { name:'Mechanical Wrist Rest',           prefix:'WRT', desc:'Memory foam, anti-slip base, fits full-size keyboards.' },
  { name:'Monitor Light Bar',               prefix:'MLB', desc:'USB-powered, no screen glare, touch-control dimmer.' },
  { name:'Mini PC Cooling Fan 120 mm',      prefix:'FAN', desc:'Ultra-quiet 25 dB, dual ball bearing, long lifespan.' },
  { name:'HDMI 2.1 Cable 2 m',              prefix:'HDM', desc:'8K@60 Hz, 48 Gbps bandwidth, gold-plated connectors.' },
  { name:'Ergonomic Footrest',              prefix:'FST', desc:'Adjustable height and tilt, massage surface, non-slip.' },
  { name:'Cable Organiser Clips 20-Pack',   prefix:'CBL', desc:'Self-adhesive, holds up to 5 cables per clip.' },
  { name:'Smart LED Strip 5 m',             prefix:'LED', desc:'16M colours, Wi-Fi app control, music sync mode.' },
  { name:'Laptop Cooling Pad',              prefix:'CPD', desc:'Dual 140 mm fans, adjustable stand, USB hub built-in.' },
  { name:'Webcam Ring Light',               prefix:'RLT', desc:'10-inch, 3 colour modes, 10 brightness levels, tripod.' },
  { name:'Mechanical Pencil Case',          prefix:'PNC', desc:'Hard-shell, custom foam insert, TSA-friendly zipper.' },
  { name:'Wireless Presentation Clicker',   prefix:'CLK', desc:'100 ft range, laser pointer, plug-and-play USB-A.' },
];

const IMAGES = [
  'https://images.unsplash.com/photo-1608751819407-8c8672b2b6b7?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1625845779296-1a3da0c5a1d0?w=600&h=400&fit=crop&auto=format',
];

const ORDER_NOTES = [
  'Please handle with care — fragile items.',
  'Gift wrap requested.',
  'Urgent delivery needed by end of week.',
  'Standard delivery is fine, no rush.',
  'Leave at reception if no one answers.',
  '',
];

// ── Exported generators ───────────────────────────────────────────────────────

export const autoFillProduct = () => {
  const t = rand(PRODUCT_TEMPLATES);
  return {
    name:        t.name,
    sku:         `${t.prefix}-${randInt(100, 999)}`,
    price:       (randInt(999, 79999) / 100).toFixed(2),
    quantity:    String(randInt(10, 250)),
    description: t.desc,
    image_url:   rand(IMAGES),
  };
};

export const autoFillCustomer = () => {
  const first = rand(FIRST);
  const last  = rand(LAST);
  const tag   = randInt(10, 99);
  return {
    full_name: `${first} ${last}`,
    email:     `${first.toLowerCase()}.${last.toLowerCase()}${tag}@example.com`,
    phone:     `+91 ${randInt(70000, 99999)} ${randInt(10000, 99999)}`,
  };
};

export const autoFillSignup = () => {
  const first = rand(FIRST);
  const tag   = randInt(100, 999);
  return {
    username: `${first.toLowerCase()}${tag}`,
    email:    `${first.toLowerCase()}${tag}@demo.com`,
    password: 'Demo@1234',
  };
};

// ── Slide (Landing page hero carousel) ───────────────────────────────────────

const SLIDE_TEMPLATES = [
  { title: 'Summer Collection 2025',    subtitle: 'Fresh arrivals for the season',       badge_text: 'New Arrival', cta_text: 'Shop Now',      description: 'Discover our curated summer lineup — lightweight, vibrant, and built for the heat.' },
  { title: 'Top Deals of the Month',    subtitle: 'Up to 40% off selected items',        badge_text: 'Hot Deal',    cta_text: 'Grab the Deal', description: 'Limited-time offers on our best-selling products. Don\'t miss out!' },
  { title: 'New Tech Arrivals',         subtitle: 'The latest gadgets, just landed',     badge_text: 'Just In',     cta_text: 'Explore Now',   description: 'From smart accessories to cutting-edge peripherals — all new, all exciting.' },
  { title: 'Winter Warmers Sale',       subtitle: 'Cosy picks at unbeatable prices',     badge_text: 'Sale',        cta_text: 'Shop Sale',     description: 'Stay warm without breaking the bank. Check our winter specials now.' },
  { title: 'Office Essentials Bundle',  subtitle: 'Everything for the perfect workspace',badge_text: 'Bundle Deal', cta_text: 'Build My Desk', description: 'Ergonomic accessories, smart lighting, and productivity tools — all in one place.' },
  { title: 'Premium Picks',            subtitle: 'Quality you can feel',                badge_text: 'Premium',     cta_text: 'View Collection', description: 'Hand-selected premium products for the discerning buyer.' },
];

export const autoFillSlide = () => {
  const t = rand(SLIDE_TEMPLATES);
  return {
    title:       t.title,
    subtitle:    t.subtitle,
    description: t.description,
    badge_text:  t.badge_text,
    cta_text:    t.cta_text,
    image_url:   rand(IMAGES),
    price:       (randInt(499, 29999) / 100).toFixed(2),
    is_active:   true,
    sort_order:  randInt(0, 9),
  };
};

/**
 * Autofill for the Order create modal.
 * Returns null if there are no customers or no in-stock products.
 */
export const autoFillOrder = (customers, products) => {
  const inStock = products.filter((p) => p.quantity > 0);
  if (!customers.length || !inStock.length) return null;

  const customer = rand(customers);
  const shuffled = [...inStock].sort(() => Math.random() - 0.5);
  const picks    = shuffled.slice(0, Math.min(randInt(1, 2), shuffled.length));

  const items = picks.map((p) => ({
    product_id: p.id,
    name:       p.name,
    sku:        p.sku,
    price:      Number(p.price),
    quantity:   Math.min(randInt(1, 3), p.quantity),
  }));

  return { customerId: customer.id, items, notes: rand(ORDER_NOTES) };
};
