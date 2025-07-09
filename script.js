const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');
const modelSelect = document.getElementById('model');

if (localStorage.getItem('model')) modelSelect.value = localStorage.getItem('model');
modelSelect.addEventListener('change', e => {
  localStorage.setItem('model', e.target.value);
});

function addMessage(text, type) {
  const el = document.createElement('div');
  el.className = `msg ${type}`;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  if (type === 'bot') speakText(text);
}

async function handleSend() {
  const msg = input.value.trim();
  if (!msg) return;
  const model = modelSelect.value;

  addMessage(msg, 'user');
  input.value = '';
  input.disabled = true;
  send.disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, user: 'guest', model })
    });
    const data = await res.json();
    addMessage(data.reply, 'bot');
  } catch (e) {
    addMessage('❌ Error: ' + e.message, 'bot');
  } finally {
    input.disabled = false;
    send.disabled = false;
    input.focus();
  }
}

send.addEventListener('click', handleSend);
input.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });
