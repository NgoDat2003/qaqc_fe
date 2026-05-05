# gstack UX Check — Slice 1: Auth

## Setup
URL: http://localhost:3001
Credentials: qam@test.com / Test@1234

## Checklist

### Login page — first impression
- [ ] Mở /login — screenshot toàn trang
- [ ] Font, màu, spacing có professional không?
- [ ] Logo/branding có hiện không?
- [ ] Input fields rõ ràng không?

### Loading state
- [ ] Click submit → button có đổi trạng thái không? (spinner, disabled)
- [ ] Không bị double-submit được không?

### Error state
- [ ] Nhập sai password → error message có rõ ràng không?
- [ ] Error hiện ở đúng vị trí không? (tại field hay toast?)
- [ ] Màu đỏ error đủ contrast không?

### Post-login
- [ ] Dashboard load → skeleton hiện trước hay flash trắng?
- [ ] Sidebar menu có đúng role không?
- [ ] User name hiện ở header không?

### Business logic validation
- [ ] Thử navigate /master-data khi đang login QC role → có bị block không?
- [ ] Session timeout simulation → có redirect /login không?

## Report format
Screenshot mỗi bước + nhận xét ngắn: PASS / FAIL / ISSUE
