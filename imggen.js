const btn = document.createElement('button');
btn.textContent = '🎨 Gambar AI';
btn.onclick = async () => {
  const prompt = prompt("Tulis deskripsi gambar:");
  if (!prompt) return;
  const res = await fetch('/api/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  const img = document.createElement('img');
  img.src = data.url;
  img.style = 'max-width:100%;margin-top:10px';
  document.body.appendChild(img);
};
document.getElementById('top-bar').appendChild(btn);
