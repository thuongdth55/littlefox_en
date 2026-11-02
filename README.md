# Little Fox Stories – PWA học tiếng Anh qua video

Web app (PWA) đọc dữ liệu từ Firebase Realtime Database tại `/littlefox_en`, giao diện giống app Android:
danh sách truyện → danh sách tập → trình phát video + transcript (IPA, dịch nghĩa, tra từ, lưu từ).

## Cấu trúc

```
.github/workflows/deploy.yml   # build & deploy lên GitHub Pages, chèn secret FIREBASE_URL
public/
  index.html  style.css  app.js
  config.js        # chứa placeholder __FIREBASE_URL__ (workflow thay bằng secret)
  sw.js            # service worker (offline + cache dữ liệu/ảnh)
  manifest.json    # PWA manifest
  icons/           # icon 192 / 512
```

## Deploy

1. Tạo repo GitHub, push toàn bộ thư mục này lên nhánh `main`.
2. **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FIREBASE_URL`
   - Value: URL gốc của Realtime Database, ví dụ `https://ten-du-an-default-rtdb.firebaseio.com`
     (không có `/littlefox_en`, không có `.json`)
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Push lên `main` (hoặc chạy tay workflow *Deploy PWA to GitHub Pages*). Mở `https://<user>.github.io/<repo>/`.

## Quy tắc Firebase cần có

App gọi REST API trực tiếp từ trình duyệt, nên Rules phải cho phép đọc `littlefox_en`
và đọc/ghi `littlefox_en/bookmarks`. Ví dụ:

```json
{
  "rules": {
    "littlefox_en": {
      ".read": true,
      "bookmarks": { ".write": true }
    }
  }
}
```

Lưu ý: secret chỉ giúp không lộ URL trong mã nguồn repo. Sau khi deploy, URL vẫn nằm trong `config.js` của trang
(trình duyệt cần nó để gọi API). Hãy bảo vệ dữ liệu bằng Rules, không dựa vào việc giấu URL.

## Chạy thử local

Sửa tạm `public/config.js` thành URL thật (đừng commit), rồi:

```
cd public && python3 -m http.server 8080
```

## Ghi chú tính năng

- Chạm một câu: hiện bản dịch tiếng Việt + giải thích. Nút tròn bên trái: đọc câu (giọng trình duyệt).
- Chạm cờ 🇺🇸/🇬🇧: đổi IPA Mỹ/Anh.
- Chạm một từ: mở bảng tra từ (phát âm, nghĩa), bấm ★ để lưu vào `littlefox_en/bookmarks/<từ>`.
- Nghĩa tiếng Việt lấy từ MyMemory, định nghĩa từ dictionaryapi.dev. Muốn dùng từ điển Anh–Việt khác, sửa hàm `lookup()` trong `app.js`.
- Nút **Share** → hộp thoại *Link video* (Mở / Share) → mã QR để mở video trên thiết bị khác.
- Nếu `video_url` là luồng HLS (.m3u8) thì app tự nạp hls.js.
