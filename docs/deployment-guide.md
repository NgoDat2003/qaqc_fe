# Deployment Guide — FE Vercel + BE Render

## Mục tiêu

Frontend không expose backend port hoặc backend host trong client bundle. Browser chỉ gọi cùng origin:

- `/api/...`
- `/uploads/...`

Next.js server rewrite các request này sang backend qua biến môi trường server-side `BE_INTERNAL_URL`.

## Frontend env

### Local

```env
BE_INTERNAL_URL=http://localhost:3000
```

### Vercel

```env
BE_INTERNAL_URL=https://<render-backend-domain>
```

Không dùng `NEXT_PUBLIC_BE_URL` cho API backend. Biến `NEXT_PUBLIC_*` sẽ bị đóng vào client bundle và làm lộ backend URL.

## Backend env cần phối hợp

Trên Render hoặc nền tảng tương đương, backend cần tối thiểu:

```env
NODE_ENV=production
DATABASE_URL=<database-url>
CORS_ORIGIN=https://<vercel-frontend-domain>
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
```

`PORT` thường do Render inject. Backend nên lắng nghe `process.env.PORT`.

## Upload/evidence

FE hiển thị ảnh qua `/uploads/...`; Next.js rewrite sang `${BE_INTERNAL_URL}/uploads/...`.

Nếu backend đang lưu file vào local disk, Render restart/redeploy có thể làm mất file. Demo portfolio có thể chấp nhận tạm, nhưng production nên dùng persistent disk hoặc object storage.

## Thứ tự deploy

1. Deploy BE trước, xác nhận health/API hoạt động.
2. Lấy backend URL và set `BE_INTERNAL_URL` cho FE.
3. Deploy FE.
4. Smoke test login, dashboard, audit flow, upload evidence.

## Lệnh kiểm tra FE

```powershell
npm.cmd run check
```

Chạy E2E vào FE đã deploy:

```powershell
$env:E2E_BASE_URL="https://<vercel-frontend-domain>"
npm.cmd run test:e2e:preflight
```

Khi `E2E_BASE_URL` được set, Playwright không tự bật dev server local.
