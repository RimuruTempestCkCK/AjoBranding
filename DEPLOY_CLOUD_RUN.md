# Panduan Deploy ke Google Cloud Run

## Prasyarat
- Google Cloud Account dengan billing enabled
- `gcloud` CLI terinstall ([download di sini](https://cloud.google.com/sdk/docs/install))
- Docker (opsional, jika build lokal)

## Langkah-Langkah Deployment

### 1. Setup Google Cloud Project

```bash
# Login ke Google Cloud
gcloud auth login

# Set project ID (ganti YOUR_PROJECT_ID dengan ID project Anda)
gcloud config set project YOUR_PROJECT_ID

# Enable Cloud Run dan Container Registry APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Siapkan Environment Variables

Buat file `.env.production` di root project (jangan push ke git):

```env
NEXT_PUBLIC_API_URL=https://YOUR_CLOUD_RUN_URL
# API keys lainnya
```

### 3. Deploy ke Cloud Run

**Opsi A: Deploy Langsung dari Source Code (Recommended)**

```bash
gcloud run deploy persona-ai \
  --source . \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --timeout 3600 \
  --max-instances 100
```

**Opsi B: Build Docker Image Terlebih Dahulu**

```bash
# Build image
docker build -t persona-ai:latest .

# Tag image untuk Container Registry
docker tag persona-ai:latest gcr.io/YOUR_PROJECT_ID/persona-ai:latest

# Push ke Container Registry
docker push gcr.io/YOUR_PROJECT_ID/persona-ai:latest

# Deploy dari image
gcloud run deploy persona-ai \
  --image gcr.io/YOUR_PROJECT_ID/persona-ai:latest \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2
```

### 4. Set Environment Variables di Cloud Run

```bash
gcloud run services update persona-ai \
  --update-env-vars=NEXT_PUBLIC_API_URL=https://YOUR_URL \
  --region asia-southeast2
```

Untuk API keys (gunakan Secret Manager - lebih aman):

```bash
# Buat secret
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-

# Grant akses ke Cloud Run service
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member=serviceAccount:persona-ai@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Update service dengan secret
gcloud run services update persona-ai \
  --update-secrets GOOGLE_API_KEY=gemini-api-key:latest \
  --region asia-southeast2
```

### 5. Cek Deployment Status

```bash
# Lihat logs
gcloud run services describe persona-ai --region asia-southeast2

# Real-time logs
gcloud run services logs read persona-ai --limit 50 --region asia-southeast2
```

## Konfigurasi Lanjutan

### Memory dan CPU Allocation

| Use Case | Memory | CPU |
|----------|--------|-----|
| Development | 512Mi | 1 |
| Small App | 1Gi | 2 |
| Medium App | 2Gi | 4 |
| High Traffic | 4Gi+ | 4+ |

### Pricing Notes
- Cloud Run ditagih per detik untuk eksekusi
- 2 juta requests gratis per bulan
- Selalu gunakan `--allow-unauthenticated` untuk public API

## Troubleshooting

### Error: "Container failed to start"
- Cek logs: `gcloud run services logs read persona-ai --limit 100`
- Pastikan `CMD` di Dockerfile correct
- Pastikan app listen di port 3000

### Error: "Permission denied" pada API keys
- Gunakan Secret Manager untuk sensitive data
- Jangan hard-code API keys di source code

### Slow Performance
- Increase memory allocation
- Enable Cloud CDN untuk static files
- Implementasi caching strategy

## Monitoring & Auto-scaling

```bash
# Auto-scale settings
gcloud run services update persona-ai \
  --min-instances 1 \
  --max-instances 100 \
  --region asia-southeast2

# Setup alerts (gunakan Cloud Monitoring)
gcloud monitoring policies create --notification-channels=YOUR_CHANNEL_ID
```

## Custom Domain (Opsional)

```bash
# Setup custom domain
gcloud run domain-mappings create \
  --service persona-ai \
  --domain yourdomain.com \
  --region asia-southeast2
```

## Redeploy setelah update kode

```bash
# Cukup jalankan command deploy lagi
gcloud run deploy persona-ai \
  --source . \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated
```

---

**Tips:**
- Gunakan `cloudbuild.yaml` untuk CI/CD automated deployment
- Monitor cost di Cloud Console > Billing
- Setup alerts untuk error rates dan latency
- Gunakan Cloud Tasks untuk background jobs
