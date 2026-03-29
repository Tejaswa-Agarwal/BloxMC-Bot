(async function(){
  const box=document.getElementById('guilds');
  if(!box) return;
  try {
    const res=await fetch('/api/guilds');
    const data=await res.json();
    if(!data.guilds||data.guilds.length===0){box.innerHTML='<div class="card"><h3>No servers found</h3><p class="muted">You do not have manageable servers yet.</p></div>';return;}
    box.className='grid cols-2';
    box.innerHTML=data.guilds.map(g=>`
      <div class="card">
        <div class="server-card-title">
          <h3>${g.name}</h3>
          <span class="pill ${g.botPresent?'ok':''}">${g.botPresent?'Connected':'Not Connected'}</span>
        </div>
        <p class="muted">${g.botPresent?'Axion is active in this server.':'Invite Axion to this server to manage it.'}</p>
        <div class="actions" style="margin-top:10px;">
          ${g.botPresent?`<a class="btn" href="/server/${g.id}">Open Panel</a>`:'<span class="pill">Awaiting invite</span>'}
        </div>
      </div>
    `).join('');
  } catch(e){
    box.innerHTML='<div class="card warning"><h3>Failed to load servers</h3><p class="muted">Try refreshing the page.</p></div>';
  }
})();
