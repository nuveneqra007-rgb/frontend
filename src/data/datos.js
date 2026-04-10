// ─── PRODUCTOS (con imágenes reales) ─────────────────────────────────────────
export const initialProducts = [
  {
    id: 1, name: 'Paracetamol 500mg', cat: 'Analgésicos', price: 5.0, stock: 48,
    lowStockThreshold: 20, desc: 'Alivio rápido del dolor y la fiebre.',
    image: 'https://profaressrl.com/wp-content/uploads/2023/04/PARACETAMOL-500-MG-TABLETAS-X-100-1.png',
    lote: 'LOT-2024-001', expiry: '2026-08-15',
    proveedor: 'Laboratorios Rowe', requiresPrescription: false, sku: 'ANA-001',
  },
  {
    id: 2, name: 'Vitamina C 1000mg', cat: 'Vitaminas', price: 8.5, stock: 72,
    lowStockThreshold: 15, desc: 'Refuerza el sistema inmunológico.',
    image: 'https://www.vitasalud.com.do/wp-content/uploads/2016/10/SG1052-SOLGAR-C-1000MG-90T.jpg',
    lote: 'LOT-2024-012', expiry: '2027-01-20',
    proveedor: 'NutriVida RD', requiresPrescription: false, sku: 'VIT-002',
  },
  {
    id: 3, name: 'Amoxicilina 500mg', cat: 'Antibióticos', price: 12.0, stock: 15,
    lowStockThreshold: 20, desc: 'Antibiótico de amplio espectro. Requiere prescripción.',
    image: 'https://curitekcom.b-cdn.net/wp-content/uploads/2023/10/AMOXICININA.jpg?v=1714509172',
    lote: 'LOT-2024-034', expiry: '2025-12-30',
    proveedor: 'FarmaPlus Import', requiresPrescription: true, sku: 'ANT-003',
  },
  {
    id: 4, name: 'Ibuprofeno 400mg', cat: 'Analgésicos', price: 6.5, stock: 60,
    lowStockThreshold: 20, desc: 'Antiinflamatorio y analgésico eficaz.',
    image: 'https://bysprodstorage.blob.core.windows.net/images/67221.png',
    lote: 'LOT-2024-041', expiry: '2026-11-10',
    proveedor: 'Laboratorios Rowe', requiresPrescription: false, sku: 'ANA-004',
  },
  {
    id: 5, name: 'Vitamina D3 2000UI', cat: 'Vitaminas', price: 9.0, stock: 45,
    lowStockThreshold: 10, desc: 'Esencial para huesos fuertes y sistema inmune.',
    image: 'https://masonnatural.pe/wp-content/uploads/2024/07/D3-2000-Front-1.png',
    lote: 'LOT-2024-055', expiry: '2027-03-15',
    proveedor: 'NutriVida RD', requiresPrescription: false, sku: 'VIT-005',
  },
  {
    id: 6, name: 'Shampoo Anticaspa', cat: 'Cuidado Personal', price: 7.0, stock: 30,
    lowStockThreshold: 10, desc: 'Fórmula médica elimina la caspa desde la primera aplicación.',
    image: 'https://jumbo.com.do/pub/media/catalog/product/cache/5d91a1aa0232de6a069aae492eab5701/2/2/2227747-a.jpg',
    lote: 'LOT-2024-066', expiry: '2026-06-20',
    proveedor: 'DermaCare Labs', requiresPrescription: false, sku: 'CUI-006',
  },
  {
    id: 7, name: 'Aspirina 100mg', cat: 'Analgésicos', price: 4.5, stock: 90,
    lowStockThreshold: 25, desc: 'Analgésico clásico. Anticoagulante en dosis bajas.',
    image: 'https://colsubsidio.vtexassets.com/arquivos/ids/208029-800-450?v=638926994271270000&width=800&height=450&aspect=true',
    lote: 'LOT-2024-071', expiry: '2026-09-30',
    proveedor: 'Laboratorios Rowe', requiresPrescription: false, sku: 'ANA-007',
  },
  {
    id: 8, name: 'Complejo B Forte', cat: 'Vitaminas', price: 11.0, stock: 55,
    lowStockThreshold: 15, desc: 'Vitaminas B1, B6 y B12 para el sistema nervioso.',
    image: 'https://farmacavar.com/wp-content/uploads/2025/06/314-1.png',
    lote: 'LOT-2024-082', expiry: '2026-12-01',
    proveedor: 'NutriVida RD', requiresPrescription: false, sku: 'VIT-008',
  },
  {
    id: 9, name: 'Azitromicina 500mg', cat: 'Antibióticos', price: 14.0, stock: 8,
    lowStockThreshold: 15, desc: 'Antibiótico para infecciones respiratorias.',
    image: 'https://calox.com/wp-content/uploads/2022/12/Azitromicina-500mgx5TabRec.webp',
    lote: 'LOT-2024-091', expiry: '2025-10-15',
    proveedor: 'FarmaPlus Import', requiresPrescription: true, sku: 'ANT-009',
  },
  {
    id: 10, name: 'Crema Hidratante 200ml', cat: 'Cuidado Personal', price: 10.5, stock: 25,
    lowStockThreshold: 10, desc: 'Hidratación profunda 24h. Sin parabenos.',
    image: 'https://www.arom.es/wp-content/uploads/95403_nuky-600x783.jpg',
    lote: 'LOT-2024-100', expiry: '2026-04-30',
    proveedor: 'DermaCare Labs', requiresPrescription: false, sku: 'CUI-010',
  },
  {
    id: 11, name: 'Omega 3 1000mg', cat: 'Vitaminas', price: 13.5, stock: 40,
    lowStockThreshold: 10, desc: 'Ácidos grasos EPA y DHA para corazón y cerebro.',
    image: 'https://i.ebayimg.com/images/g/GdUAAOSwV6lfLCYV/s-l1200.jpg',
    lote: 'LOT-2024-111', expiry: '2026-07-20',
    proveedor: 'NutriVida RD', requiresPrescription: false, sku: 'VIT-011',
  },
  {
    id: 12, name: 'Dipirona 500mg', cat: 'Analgésicos', price: 3.5, stock: 0,
    lowStockThreshold: 20, desc: 'Analgésico y antipirético de acción rápida.',
    image: 'https://vincentilab.com/wp-content/uploads/2023/05/Dipirona_V01.jpg',
    lote: 'LOT-2024-120', expiry: '2025-11-30',
    proveedor: 'Laboratorios Rowe', requiresPrescription: false, sku: 'ANA-012',
  },
  {
    id: 13, name: 'Loratadina 10mg', cat: 'Analgésicos', price: 6.0, stock: 35,
    lowStockThreshold: 15, desc: 'Antihistamínico de segunda generación.',
    image: 'https://iberofarmacos.net/wp-content/uploads/2024/09/LORATADINA-IF-10MG-100-TABLETAS.jpg',
    lote: 'LOT-2024-130', expiry: '2027-02-28',
    proveedor: 'Laboratorios Rowe', requiresPrescription: false, sku: 'ANA-013',
  },
  {
    id: 14, name: 'Proteína Whey 1kg', cat: 'Vitaminas', price: 45.0, stock: 18,
    lowStockThreshold: 5, desc: 'Proteína de suero de alta calidad.',
    image: 'https://sportclothesrd.com/wp-content/uploads/2020/10/whey-e1660958455941.png',
    lote: 'LOT-2024-141', expiry: '2026-05-10',
    proveedor: 'NutriVida RD', requiresPrescription: false, sku: 'VIT-014',
  },
];

export const CATEGORIES = ['Todos', 'Analgésicos', 'Vitaminas', 'Antibióticos', 'Cuidado Personal'];
export const CAT_EMOJIS = { Analgésicos: '💊', Vitaminas: '🌿', Antibióticos: '🧫', 'Cuidado Personal': '🧴' };
export const TAX_RATE = 0.18; // ITBIS República Dominicana
export const DEMO_USERS = [
  { email: 'admin@tufarmacia.com', password: 'admin123', name: 'Admin TuFarmacia', role: 'admin' },
  { email: 'cliente@demo.com', password: 'cliente123', name: 'María García', role: 'user' },
];