import officeDepotReceiptUrl from '../src/assets/demo/receipts/office_depot.webp';
import shellReceiptUrl from '../src/assets/demo/receipts/shell.webp';
import marketStreetCafeReceiptUrl from '../src/assets/demo/receipts/market_street_cafe.webp';
import homeDepotReceiptUrl from '../src/assets/demo/receipts/home_depot.webp';
import hebReceiptUrl from '../src/assets/demo/receipts/heb.webp';
import staplesReceiptUrl from '../src/assets/demo/receipts/staples.webp';
import lowesReceiptUrl from '../src/assets/demo/receipts/lowes.webp';
import harborFreightReceiptUrl from '../src/assets/demo/receipts/harbor_freight.webp';
import sherwinWilliamsReceiptUrl from '../src/assets/demo/receipts/sherwin_williams.webp';
import aceHardwareReceiptUrl from '../src/assets/demo/receipts/ace_hardware.webp';

// v38.0.18: ten lightweight, photo-style U.S. demo receipts for the Home gallery.
// The first four use the user's approved receipt-photo references; the remaining
// six follow the same photographed thermal-paper-on-dark-surface visual language.
export const DEMO_RECEIPT_ASSETS: Array<{ id: string; note: string; mimeType: string; assetUrl: string }> = [
  { id: 'rcpt_demo_1', note: 'Office supplies — Office Depot', mimeType: 'image/webp', assetUrl: officeDepotReceiptUrl },
  { id: 'rcpt_demo_2', note: 'Fuel — Shell', mimeType: 'image/webp', assetUrl: shellReceiptUrl },
  { id: 'rcpt_demo_3', note: 'Business meal — Market Street Cafe', mimeType: 'image/webp', assetUrl: marketStreetCafeReceiptUrl },
  { id: 'rcpt_demo_4', note: 'Hardware materials — The Home Depot', mimeType: 'image/webp', assetUrl: homeDepotReceiptUrl },
  { id: 'rcpt_demo_5', note: 'Client refreshments — H-E-B', mimeType: 'image/webp', assetUrl: hebReceiptUrl },
  { id: 'rcpt_demo_6', note: 'Office restock — Staples', mimeType: 'image/webp', assetUrl: staplesReceiptUrl },
  { id: 'rcpt_demo_7', note: 'Paint prep materials — Lowe\'s', mimeType: 'image/webp', assetUrl: lowesReceiptUrl },
  { id: 'rcpt_demo_8', note: 'Tool replacement — Harbor Freight', mimeType: 'image/webp', assetUrl: harborFreightReceiptUrl },
  { id: 'rcpt_demo_9', note: 'Paint and caulk — Sherwin-Williams', mimeType: 'image/webp', assetUrl: sherwinWilliamsReceiptUrl },
  { id: 'rcpt_demo_10', note: 'Hardware supplies — Ace Hardware', mimeType: 'image/webp', assetUrl: aceHardwareReceiptUrl },
];
