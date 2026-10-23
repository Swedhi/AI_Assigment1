const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- tiny JSON-file "database" ----
const seed = [
  { id: 1, name: 'Royal Orchid', category: 'Orchids', price: 899, stock: 12, emoji: '🪻', description: 'Deep purple orchid stems in a gold-rimmed vase.' },
  { id: 2, name: 'Blush Peony Bouquet', category: 'Bouquets', price: 1299, stock: 8, emoji: '🌸', description: 'Soft peonies wrapped in white tissue and gold ribbon.' },
  { id: 3, name: 'Golden Sunflowers', category: 'Bouquets', price: 649, stock: 20, emoji: '🌻', description: 'Ten bright sunflowers, hand-tied the same morning.' },
  { id: 4, name: 'White Rose Dozen', category: 'Roses', price: 999, stock: 15, emoji: '🌹', description: 'Twelve long-stem white roses for weddings and thank-yous.' },
  { id: 5, name: 'Lavender Pot', category: 'Potted', price: 349, stock: 25, emoji: '🪴', description: 'Fragrant lavender in a ceramic pot. Easy to keep.' },
  { id: 6, name: 'Tulip Trio', category: 'Bouquets', price: 499, stock: 0, emoji: '🌷', description: 'Three purple tulips with eucalyptus.' }
];
const load = () => {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
  catch { save(seed); return [...seed]; }
};
const save = (data) => fs.writeFileSync(DB, JSON.stringify(data, null, 2));

// ---- validation ----
function validate(b, partial = false) {
  const errors = [];
  const need = (k, ok, msg) => { if (!partial || k in b) if (!ok(b[k])) errors.push(msg); };
  need('name', v => typeof v === 'string' && v.trim().length >= 2, 'name must be at least 2 characters');
  need('category', v => typeof v === 'string' && v.trim().length > 0, 'category is required');
  need('price', v => Number(v) > 0, 'price must be greater than 0');
  need('stock', v => Number.isInteger(Number(v)) && Number(v) >= 0, 'stock must be a whole number, 0 or more');
  return errors;
}
const clean = (b) => ({
  ...(b.name !== undefined && { name: String(b.name).trim() }),
  ...(b.category !== undefined && { category: String(b.category).trim() }),
  ...(b.price !== undefined && { price: Number(b.price) }),
  ...(b.stock !== undefined && { stock: Number(b.stock) }),
  ...(b.image !== undefined && { image: String(b.image).trim() }),
  ...(b.description !== undefined && { description: String(b.description).trim() })
});

// ---- CRUD API ----
// READ all (optional ?q= search, ?category= filter)
app.get('/api/flowers', (req, res) => {
  let list = load();
  const { q, category } = req.query;
  if (q) list = list.filter(f => (f.name + f.description).toLowerCase().includes(q.toLowerCase()));
  if (category && category !== 'All') list = list.filter(f => f.category === category);
  res.json(list);
});

// READ one
app.get('/api/flowers/:id', (req, res) => {
  const item = load().find(f => f.id === Number(req.params.id));
  item ? res.json(item) : res.status(404).json({ error: 'Flower not found' });
});

// CREATE
app.post('/api/flowers', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const list = load();
  const item = { id: Math.max(0, ...list.map(f => f.id)) + 1, image: '', description: '', ...clean(req.body) };
  list.push(item); save(list);
  res.status(201).json(item);
});

// UPDATE (full or partial)
app.put('/api/flowers/:id', (req, res) => {
  const errors = validate(req.body, true);
  if (errors.length) return res.status(400).json({ errors });
  const list = load();
  const i = list.findIndex(f => f.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Flower not found' });
  list[i] = { ...list[i], ...clean(req.body) }; save(list);
  res.json(list[i]);
});

// DELETE
app.delete('/api/flowers/:id', (req, res) => {
  const list = load();
  const i = list.findIndex(f => f.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Flower not found' });
  const [removed] = list.splice(i, 1); save(list);
  res.json({ deleted: removed });
});

app.listen(PORT, () => console.log(`Flower shop running at http://localhost:${PORT}`));
