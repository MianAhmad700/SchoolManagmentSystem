export const fileToBase64Compressed = async (file) => {
  if (!file) return null;
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    const r = new FileReader();
    r.onload = e => { i.src = e.target.result; };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const canvas = document.createElement('canvas');
  const size = 300;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const { width, height } = img;
  const scale = Math.min(size / width, size / height);
  const sw = width * scale;
  const sh = height * scale;
  const dx = (size - sw) / 2;
  const dy = (size - sh) / 2;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, dx, dy, sw, sh);
  let quality = 0.6;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  const toBytes = (b64) => Math.ceil((b64.length * 3) / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);
  const limit = 150 * 1024;
  let guard = 0;
  while (toBytes(dataUrl.split(',')[1] || '') > limit && quality > 0.3 && guard < 5) {
    quality -= 0.05;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    guard += 1;
  }
  return dataUrl;
};
