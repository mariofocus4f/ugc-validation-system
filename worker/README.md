# UGC Validation - Cloudflare Worker Backend

Backend API wdrożony na Cloudflare Workers z Cloudflare D1 (database) i R2 (storage).

## 🚀 Quick Start - Deployment

### 1. Zaloguj się do Cloudflare

```bash
cd worker
npx wrangler login
```

### 2. Utwórz Cloudflare D1 Database

```bash
npx wrangler d1 create ugc-validation-db
```

Skopiuj `database_id` z wyniku i wklej do `wrangler.toml`.

### 3. Zainicjalizuj bazę danych

```bash
npx wrangler d1 execute ugc-validation-db --file=./schema.sql
```

### 4. Utwórz R2 Bucket

```bash
npx wrangler r2 bucket create ugc-images
```

### 5. Ustaw zmienne środowiskowe (secrets)

```bash
# Airtable
npx wrangler secret put AIRTABLE_API_KEY
npx wrangler secret put AIRTABLE_BASE_ID

# Cloudflare Account (optional)
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
```

### 6. Wdróż Worker

```bash
npx wrangler deploy
```

Worker będzie dostępny pod: `https://ugc-validation-api.YOUR-SUBDOMAIN.workers.dev`

## 📋 Konfiguracja Frontend

Po wdrożeniu workera, zaktualizuj frontend:

1. Otwórz `client/src/services/api.js`
2. Zmień `baseURL` na URL twojego workera:
   ```javascript
   baseURL: 'https://ugc-validation-api.YOUR-SUBDOMAIN.workers.dev'
   ```
3. Zbuduj i wdróż frontend:
   ```bash
   cd client
   npm run build
   npx wrangler pages deploy build --project-name=ugc-validation
   ```

## 🔧 Development

Lokalne uruchomienie w trybie dev:

```bash
npx wrangler dev
```

Worker będzie dostępny lokalnie na `http://localhost:8787`

## 📊 Database Management

### Query database

```bash
npx wrangler d1 execute ugc-validation-db --command "SELECT * FROM reviews LIMIT 10"
```

### Check stats

```bash
npx wrangler d1 execute ugc-validation-db --command "SELECT COUNT(*) as total FROM reviews"
```

## 📦 R2 Storage

Obrazy są przechowywane w: `ugc-images` bucket

Struktura: `orders/{orderNumber}/{timestamp}-{filename}`

### (Opcjonalne) Skonfiguruj publiczny dostęp do R2

1. Przejdź do Cloudflare Dashboard → R2
2. Wybierz bucket `ugc-images`
3. Settings → Custom Domains
4. Dodaj subdomenę np. `images.your-domain.com`
5. Zaktualizuj `worker/src/services/r2Storage.js` z nową domeną

## 🔍 Monitoring & Logs

### Real-time logs

```bash
npx wrangler tail
```

### Check worker status

```bash
npx wrangler deployments list
```

## 📡 Endpoints

- `GET /api/health` - Health check
- `POST /api/ugc/validate` - Upload and validate images

## 🔐 Environment Variables

Set in `wrangler.toml` (vars) or as secrets:

- `AIRTABLE_API_KEY` (secret)
- `AIRTABLE_BASE_ID` (secret)
- `CORS_ORIGIN` (var)
- `MAX_FILE_SIZE` (var)
- `MAX_FILES` (var)
- `MIN_IMAGE_WIDTH` (var)

## 🎯 Features

- ✅ Serverless backend on Cloudflare Workers
- ✅ Image storage in Cloudflare R2
- ✅ Data persistence in Cloudflare D1 (SQLite)
- ✅ Airtable integration
- ✅ Auto-accept images (AI validation disabled)
- ✅ CORS configured for frontend
- ✅ No email required, only order number

## 📈 Scaling

Cloudflare Workers automatically scales:
- 100,000 free requests/day
- Unlimited bandwidth
- Global edge network
- Sub-50ms response times

## 🆘 Troubleshooting

### Worker nie działa?
1. Sprawdź logs: `npx wrangler tail`
2. Sprawdź bindings w `wrangler.toml`
3. Upewnij się że D1 database jest utworzona
4. Upewnij się że R2 bucket jest utworzony

### CORS errors?
Upewnij się że `CORS_ORIGIN` w `wrangler.toml` zawiera URL frontendu.

### Database errors?
Uruchom ponownie: `npx wrangler d1 execute ugc-validation-db --file=./schema.sql`

