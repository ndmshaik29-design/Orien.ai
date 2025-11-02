// Frontend behavior for Orien
const CHAT_ENDPOINT = '/api/chat';
const IMAGE_ENDPOINT = '/api/image';

document.addEventListener('DOMContentLoaded', ()=> {
  const openAppBtn = document.getElementById('openAppBtn');
  const openImagesBtn = document.getElementById('openImagesBtn');
  const app = document.getElementById('app');
  const hero = document.querySelector('.hero-landing');

  openAppBtn.addEventListener('click', ()=> { hero.style.display='none'; app.style.display='flex'; showPanel('chat'); });
  openImagesBtn.addEventListener('click', ()=> { hero.style.display='none'; app.style.display='flex'; showPanel('image'); });

  // Tabs & panels
  const tabs = document.querySelectorAll('.tab');
  const panelPills = document.querySelectorAll('.panel-pill');
  const chatPanel = document.getElementById('chatPanel');
  const imagePanel = document.getElementById('imagePanel');
  const messagesEl = document.getElementById('messages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const genImageBtn = document.getElementById('genImageBtn');
  const imagePrompt = document.getElementById('imagePrompt');
  const imageGrid = document.getElementById('imageGrid');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  let lastImageUrl = null;

  tabs.forEach(t=>t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    showPanel(t.dataset.tab);
  }));

  panelPills.forEach(p=>p.addEventListener('click', ()=>{
    panelPills.forEach(x=>x.classList.remove('active'));
    p.classList.add('active');
    showPanel(p.dataset.panel);
  }));

  function showPanel(name){
    if(name==='chat'){
      chatPanel.style.display='block';
      imagePanel.style.display='none';
      document.getElementById('workspaceTitle').textContent = 'Chat with Orien';
      panelPills.forEach(p=>p.classList.toggle('active', p.dataset.panel === 'chat'));
    } else {
      chatPanel.style.display='none';
      imagePanel.style.display='block';
      document.getElementById('workspaceTitle').textContent = 'Image Generator';
      panelPills.forEach(p=>p.classList.toggle('active', p.dataset.panel === 'image'));
    }
  }

  function appendMessage(text, from='bot'){
    const msg = document.createElement('div'); msg.className='msg ' + (from==='user' ? 'user' : 'bot');
    const av = document.createElement('div'); av.className='av'; av.textContent = from==='bot' ? 'O' : 'Y';
    const bubble = document.createElement('div'); bubble.className='bub'; bubble.textContent = text;
    msg.appendChild(av); msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // send chat
  sendBtn.addEventListener('click', async ()=>{
    const prompt = chatInput.value.trim(); if(!prompt) return;
    appendMessage(prompt,'user'); chatInput.value='';
    appendMessage('Orien is thinking...','bot');
    try{
      const reply = await sendChatRequest(prompt);
      const bubbles = messagesEl.querySelectorAll('.bub');
      bubbles[bubbles.length-1].textContent = reply;
    }catch(err){
      const bubbles = messagesEl.querySelectorAll('.bub');
      bubbles[bubbles.length-1].textContent = 'Error: ' + err.message;
    }
  });

  // image generate
  genImageBtn.addEventListener('click', async ()=>{
    const prompt = imagePrompt.value.trim(); if(!prompt) return;
    const card = document.createElement('div'); card.className='img-card'; card.textContent='Generating...';
    imageGrid.prepend(card);
    try{
      const imgUrl = await sendImageRequest(prompt);
      card.innerHTML = '';
      const img = document.createElement('img'); img.src = imgUrl; card.appendChild(img);
      lastImageUrl = imgUrl;
    }catch(err){
      card.textContent = 'Error: ' + err.message;
    }
  });

  clearBtn.addEventListener('click', ()=>{
    messagesEl.innerHTML = '';
    appendMessage("Hello — I'm Orien. Ask me anything.");
  });

  downloadBtn.addEventListener('click', ()=>{
    if(!lastImageUrl){ alert('No image to download'); return; }
    const a = document.createElement('a'); a.href = lastImageUrl; a.download = 'orien.png'; document.body.appendChild(a); a.click(); a.remove();
  });

  async function sendChatRequest(prompt){
    const res = await fetch(CHAT_ENDPOINT, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({prompt})
    });
    if(!res.ok) throw new Error('Server error ' + res.status);
    const data = await res.json();
    return data.reply || JSON.stringify(data);
  }

  async function sendImageRequest(prompt){
    const res = await fetch(IMAGE_ENDPOINT, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({prompt})
    });
    if(!res.ok) throw new Error('Server error ' + res.status);
    const data = await res.json();
    return data.imageUrl;
  }

});
