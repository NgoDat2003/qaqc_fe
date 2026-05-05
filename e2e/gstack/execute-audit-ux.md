# gstack UX Check — Slice 5: Execute Audit (Mobile)

## Setup
URL: http://localhost:3001
Login: qc@test.com / Test@1234
Viewport: iPhone 14 (390x844)

## Checklist

### My Audits list
- [ ] Screenshot trang My Audits
- [ ] Card list có readable trên mobile không?
- [ ] Status badge (pending/in_progress) rõ không?
- [ ] Empty state có meaningful không? (icon + message + CTA)

### Execute form — UX flow
- [ ] Mở bài audit → section tabs [C][H][E][P] có scroll ngang không?
- [ ] Screenshot tab C — có thấy hết criteria không?
- [ ] +/- button có đủ lớn không? (ước lượng 44px)
- [ ] Progress bar trên cùng có update khi điền không?

### Scoring boundary — visual feedback
- [ ] Tăng repeat count lên 4 → CCP badge có xuất hiện không?
- [ ] CCP badge màu gì? Đủ nổi bật không?
- [ ] Flag RISK → toàn bài có hiện warning gì không?

### Upload ảnh
- [ ] Click upload → có mở camera/file picker không?
- [ ] Preview ảnh sau upload — thumbnail rõ không?
- [ ] Remove ảnh — có confirm không hay xóa thẳng?

### Submit flow
- [ ] Sticky submit bar có luôn visible không khi scroll?
- [ ] Click Submit → confirm dialog có hiện không?
- [ ] Confirm dialog có show tóm tắt (số lỗi, điểm ước tính) không?

### Error states
- [ ] Có lỗi nhưng chưa upload ảnh → submit bị block với message gì?
- [ ] Message đó user hiểu không?

### Post-submit
- [ ] Sau submit → điểm có hiện ngay không?
- [ ] Grade badge màu đúng với điểm không? (Xuất sắc/Tốt/Đạt/Không đạt)

## Report format
Screenshot mỗi bước + PASS/FAIL/ISSUE + đề xuất fix nếu có
