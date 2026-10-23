# Petal & Gold: flower shop

Express backend (JSON-file storage) + vanilla JS frontend. Theme: white, purple, gold.

## Run
```
npm install
npm start
```
Open http://localhost:3000

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/flowers?q=rose&category=Roses | List / search / filter |
| GET | /api/flowers/:id | Get one |
| POST | /api/flowers | Create `{name, category, price, stock, emoji?, description?}` |
| PUT | /api/flowers/:id | Update (any subset of fields) |
| DELETE | /api/flowers/:id | Delete |

Data lives in `data.json` (created on first run).
