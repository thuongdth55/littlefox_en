// File này được GitHub Actions ghi đè lúc deploy: __FIREBASE_URL__ -> giá trị secret FIREBASE_URL.
// Chạy local: thay tạm bằng URL thật, ví dụ "https://ten-du-an-default-rtdb.firebaseio.com" (đừng commit).
window.APP_CONFIG = {
  FIREBASE_URL: "__FIREBASE_URL__"
};
