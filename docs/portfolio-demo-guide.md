# Portfolio Demo Guide

Tài liệu này hướng dẫn cách tạo lại video demo, ảnh report và Playwright evidence đang được dùng trong `README.md`.

## Mục Đích

README phục vụ portfolio review. Người xem không cần clone source hoặc tự cấu hình env để hiểu sản phẩm.

Asset đã commit vào repo:

- `docs/portfolio/assets/qaqc-full-flow-demo.webm`
- `docs/portfolio/assets/qaqc-playwright-report.png`

## Service Cần Chạy

Demo chạy trên môi trường full-stack local:

| Service | URL |
|---|---|
| Frontend | `http://localhost:3001` |
| Backend | `http://localhost:3000` |

Backend cần dùng seeded demo database ổn định, có account theo role và có cleanup cho data prefix `E2E Portfolio`.

## Quy Trình Quay Demo Sạch

1. Yêu cầu BE chạy cleanup cho data `E2E Portfolio` nếu cần quay lại từ đầu.
2. Start BE tại `http://localhost:3000`.
3. Start FE tại `http://localhost:3001`.
4. Chạy preflight để kiểm tra API, login role và seed readiness.
5. Chạy portfolio E2E capture.
6. Copy video và ảnh report cuối cùng vào `docs/portfolio/assets/`.

## Lệnh Chạy

Preflight:

```powershell
npm.cmd run test:e2e:preflight
```

Portfolio capture:

```powershell
$env:E2E_ALLOW_MUTATION="true"
$env:E2E_PORTFOLIO_CAPTURE="true"
$env:E2E_SLOW_MO="120"
$env:E2E_DEMO_PAUSE_MS="400"
npm.cmd run test:e2e:portfolio
```

Nếu muốn demo chậm hơn để xem bằng mắt:

```powershell
$env:E2E_ALLOW_MUTATION="true"
$env:E2E_PORTFOLIO_CAPTURE="true"
$env:E2E_SLOW_MO="250"
$env:E2E_DEMO_PAUSE_MS="1000"
npm.cmd run test:e2e:portfolio
```

## Artifact Được Sinh Ra

Playwright tạo artifact local ở:

- `playwright-report/`
- `test-results/`
- `blob-report/` nếu bật

README chỉ dùng asset nhẹ đã chọn lọc:

- `docs/portfolio/assets/qaqc-full-flow-demo.webm`
- `docs/portfolio/assets/qaqc-playwright-report.png`

## Không Commit

Không commit các mục sau:

- `playwright-report/`
- `test-results/`
- `blob-report/`
- trace `.zip`
- screenshot tạm

Trace có thể rất nặng và có DOM snapshot/request metadata. Chỉ giữ local, không đưa vào repo nếu không có lý do rõ ràng.

## Port Playwright Report

Playwright có thể mở HTML report ở local URL như:

```text
http://localhost:9323
http://localhost:9333
```

Đây chỉ là local static report server để xem report sau test. Nó không phải service production và không cần deploy cùng app.

## Cập Nhật Asset Trong README

Sau một lần capture mới, thay thế đúng hai file:

```text
docs/portfolio/assets/qaqc-full-flow-demo.webm
docs/portfolio/assets/qaqc-playwright-report.png
```

Giữ nguyên tên file để link trong README không bị vỡ.

## Checklist Trước Khi Commit

- [ ] `README.md` hiển thị link video và ảnh report.
- [ ] Video vẫn có dung lượng hợp lý để commit.
- [ ] Ảnh report thể hiện portfolio flow pass.
- [ ] `git status --short --untracked-files=all` không có `playwright-report/` hoặc `test-results/`.
- [ ] `npm.cmd run check` pass.
