import React, { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Toaster, toast } from 'sonner'

function b64encode(str){ return btoa(unescape(encodeURIComponent(str))) }
function b64decode(str){ return decodeURIComponent(escape(atob(str))) }

const DEMO = {
  name: 'My Quick Board',
  categories: [
    { id: 'core', name: 'Core', tiles: [
      { id:'i', label:'I', emoji:'🧑', color:'#e2e8f0' },
      { id:'want', label:'want', emoji:'🤲', color:'#fde68a' },
      { id:'help', label:'help', emoji:'🆘', color:'#fecaca' },
      { id:'please', label:'please', emoji:'🙏', color:'#bbf7d0' },
      { id:'yes', label:'yes', emoji:'👍', color:'#d9f99d' },
      { id:'no', label:'no', emoji:'👎', color:'#fecdd3' },
      { id:'more', label:'more', emoji:'➕', color:'#e9d5ff' },
      { id:'done', label:'all done', emoji:'✅', color:'#bae6fd' },
    ]},
    { id: 'feel', name: 'Feelings', tiles: [
      { id:'happy', label:'happy', emoji:'😊' },
      { id:'sad', label:'sad', emoji:'😢' },
      { id:'angry', label:'angry', emoji:'😠' },
      { id:'tired', label:'tired', emoji:'😴' },
      { id:'hurt', label:'hurt', emoji:'🤕' },
    ]},
    { id: 'food', name: 'Food & Drink', tiles: [
      { id:'water', label:'water', emoji:'💧' },
      { id:'juice', label:'juice', emoji:'🧃' },
      { id:'milk', label:'milk', emoji:'🥛' },
      { id:'apple', label:'apple', emoji:'🍎' },
      { id:'banana', label:'banana', emoji:'🍌' },
      { id:'sandwich', label:'sandwich', emoji:'🥪' },
    ]},
  ]
}

const LS_KEY = 'spe-akt-tiles-v1'
const uuid = () => Math.random().toString(36).slice(2,10)

function useLocalStorage(key, initial){
  const [s, setS] = useState(()=>{
    try{ const raw = localStorage.getItem(key); return raw? JSON.parse(raw): initial }catch{ return initial }
  })
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(s)) }catch{} }, [key, s])
  return [s,setS]
}

export default function App(){
  const [board, setBoard] = useLocalStorage(LS_KEY, DEMO)
  const [activeCatId, setActiveCatId] = useState(board.categories[0]?.id ?? 'core')
  const activeCat = board.categories.find(c=>c.id===activeCatId) ?? board.categories[0]
  const [phrase, setPhrase] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const [tileSize, setTileSize] = useLocalStorage('tile-size', 140)
  const [highContrast, setHighContrast] = useLocalStorage('hc', true)
  const [showEmoji, setShowEmoji] = useLocalStorage('show-emoji', true)
  const [showLabels, setShowLabels] = useLocalStorage('show-labels', true)

  // Apply high contrast mode to document
  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true')
    } else {
      document.documentElement.removeAttribute('data-high-contrast')
    }
  }, [highContrast])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // voices
  const [voices, setVoices] = useState([])
  const [voiceName, setVoiceName] = useLocalStorage('voice-name','')
  useEffect(()=>{
    const load = ()=> setVoices(window.speechSynthesis.getVoices())
    load(); window.speechSynthesis.onvoiceschanged = load
  },[])
  const selectedVoice = useMemo(()=> voices.find(v=>v.name===voiceName) ?? null, [voices, voiceName])

  // import from URL hash
  useEffect(()=>{
    try{
      if (location.hash.startsWith('#board=')){
        const payload = location.hash.slice(7)
        const parsed = JSON.parse(b64decode(payload))
        if (parsed?.categories){
          setBoard(parsed); setActiveCatId(parsed.categories[0]?.id ?? 'core')
          toast.success('Imported board from link')
          history.replaceState(null,'',location.pathname+location.search)
        }
      }
    }catch(e){
      console.error('Failed to import from URL:', e)
      toast.error('Could not import board from link')
    }
  },[])

  // service worker already registered in main.jsx

  const fileRef = useRef(null)

  const addWord = (t)=> setPhrase(p=>[...p, (t.speak||t.label).trim()])
  const undo = ()=> setPhrase(p=>p.slice(0,-1))
  const clear = ()=> setPhrase([])
  const speakNow = ()=>{
    const text = phrase.join(' '); if(!text) return;
    try {
      const u = new SpeechSynthesisUtterance(text)
      if (selectedVoice) u.voice = selectedVoice
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u)
      toast.success('Speaking...')
    } catch (e) {
      console.error('Speech synthesis error:', e)
      toast.error('Could not speak text')
    }
  }

  const saveTile = (catId, tile)=>{
    try {
      setBoard(b=>({...b, categories: b.categories.map(c=> c.id===catId? {...c, tiles: c.tiles.some(tt=>tt.id===tile.id)? c.tiles.map(tt=>tt.id===tile.id? tile: tt): [...c.tiles, tile]}: c)}))
      toast.success('Saved tile')
    } catch (e) {
      console.error('Failed to save tile:', e)
      toast.error('Could not save tile')
    }
  }
  
  const deleteTile = (catId, tileId)=>{
    try {
      setBoard(b=>({...b, categories: b.categories.map(c=> c.id===catId? {...c, tiles: c.tiles.filter(tt=>tt.id!==tileId)}: c)}))
      toast.success('Deleted tile')
    } catch (e) {
      console.error('Failed to delete tile:', e)
      toast.error('Could not delete tile')
    }
  }
  
  const addCategory = ()=>{
    try {
      const id = uuid(); 
      setBoard(b=>({...b, categories:[...b.categories, {id, name:`New ${b.categories.length+1}`, tiles:[]}]})); 
      setActiveCatId(id)
      toast.success('Added new category')
    } catch (e) {
      console.error('Failed to add category:', e)
      toast.error('Could not add category')
    }
  }
  
  const saveCategoryName = (catId, name)=> {
    try {
      setBoard(b=>({...b, categories:b.categories.map(c=> c.id===catId? {...c, name}: c)}))
    } catch (e) {
      console.error('Failed to save category name:', e)
      toast.error('Could not save category name')
    }
  }

  const exportJSON = ()=>{
    try {
      const data = JSON.stringify(board, null, 2)
      const blob = new Blob([data], {type:'application/json'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `${board.name.replace(/\s+/g,'-').toLowerCase()}-board.json`; 
      a.click(); 
      URL.revokeObjectURL(url)
      toast.success('Board exported successfully')
    } catch (e) {
      console.error('Export failed:', e)
      toast.error('Could not export board')
    }
  }
  
  const importJSON = (file)=>{
    try {
      const reader = new FileReader()
      reader.onload = ()=>{
        try{
          const parsed = JSON.parse(String(reader.result))
          if(!parsed?.categories) throw new Error('Invalid file format')
          setBoard(parsed); 
          setActiveCatId(parsed.categories[0]?.id ?? 'core')
          toast.success('Imported board successfully')
        }catch(e){ 
          console.error('Import parse error:', e)
          toast.error('Invalid board file format') 
        }
      }
      reader.onerror = () => toast.error('Could not read file')
      reader.readAsText(file)
    } catch (e) {
      console.error('Import failed:', e)
      toast.error('Could not import file')
    }
  }

  // share
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const openShare = async ()=>{
    try{
      const base = location.origin + location.pathname
      const payload = b64encode(JSON.stringify(board))
      const link = `${base}#board=${payload}`
      setShareUrl(link)
      const dataUrl = await QRCode.toDataURL(link, {margin:1, scale:6})
      setQrDataUrl(dataUrl); 
      setShareOpen(true)
    }catch(e){
      console.error('Share generation failed:', e)
      toast.error('Could not generate share link')
    }
  }

  // speech recognition with better fallbacks
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)
  const toggleListen = ()=>{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR){ 
      toast.error('Speech recognition not supported in this browser. Try Chrome or Safari.')
      return 
    }
    if (!listening){
      try {
        const r = new SR(); 
        r.lang = (selectedVoice?.lang) || 'en-US'; 
        r.continuous = false; 
        r.interimResults = false; 
        r.maxAlternatives = 1
        r.onresult = (ev)=>{
          const text = ev.results?.[0]?.[0]?.transcript || ''; 
          if(text) {
            const words = text.split(/\s+/).filter(word => word.trim().length > 0)
            setPhrase(p=>[...p, ...words])
            toast.success(`Added: ${words.join(', ')}`)
          }
        }
        r.onend = ()=> setListening(false)
        r.onerror = (e)=>{
          console.error('Speech recognition error:', e)
          setListening(false)
          if (e.error === 'no-speech') {
            toast.error('No speech detected. Please try again.')
          } else {
            toast.error('Speech recognition error. Please try again.')
          }
        }
        recRef.current = r; 
        setListening(true); 
        r.start()
        toast.success('Listening... Speak now')
      } catch (e) {
        console.error('Speech recognition setup failed:', e)
        toast.error('Could not start speech recognition')
        setListening(false)
      }
    } else { 
      try {
        recRef.current?.stop?.(); 
        setListening(false)
        toast.success('Stopped listening')
      } catch (e) {
        console.error('Failed to stop speech recognition:', e)
        setListening(false)
      }
    }
  }

  const gridCols = tileSize>=220? 'grid cols-4': (tileSize>=160? 'grid cols-6': 'grid cols-8')

  // editing tile
  const [editing, setEditing] = useState(null) // {catId, tile?}

  return (<>
    <Toaster richColors />
    <div className="container">
      <header>
        <div>
          <h1>SpeakTiles</h1>
          <div className="muted">Tap tiles to build a sentence. Press Speak.</div>
          <div className="status-indicators">
            <span className={`status ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </span>
            {!isOnline && <span className="muted">(Working offline)</span>}
          </div>
        </div>
        <div className="actions">
          <button onClick={openShare} disabled={!isOnline}>Share</button>
          <button onClick={toggleListen}>{listening? 'Listening…':'Voice Input'}</button>
          <button className="primary" onClick={()=> window.matchMedia('(display-mode: standalone)').matches? toast.message('Already installed'): (navigator?.serviceWorker? toast.message('Use your browser "Add to Home Screen"'): toast.message('Service worker not available'))}>Install</button>
          <button onClick={addCategory}>+ Category</button>
        </div>
      </header>

      <div className="card">
        <div className="content row">
          {phrase.length? phrase.map((w,i)=>(<span key={i} className="chip">{w}</span>)): <span className="muted">Tap tiles or use the mic to add words…</span>}
          <div style={{marginLeft:'auto'}} className="row">
            <button onClick={speakNow}>Speak</button>
            <button onClick={undo} disabled={!phrase.length}>Undo</button>
            <button onClick={clear} disabled={!phrase.length}>Clear</button>
          </div>
        </div>
      </div>

      <div className="tabs">
        {board.categories.map(c=>(<button key={c.id} className={`tab ${c.id===activeCatId?'active':''}`} onClick={()=>setActiveCatId(c.id)}>{c.name}</button>))}
      </div>

      <div className="row" style={{marginBottom:8}}>
        <input aria-label="Category name" value={activeCat.name} onChange={e=>saveCategoryName(activeCat.id, e.target.value)} />
        <button onClick={()=> setEditing({catId: activeCat.id})}>+ Tile</button>
        <span className="muted">Tile size</span>
        <input type="range" min="120" max="260" step="10" value={tileSize} onChange={e=>setTileSize(parseInt(e.target.value))}/>
        <label className="row"><input type="checkbox" checked={highContrast} onChange={e=>setHighContrast(e.target.checked)} /> High contrast</label>
        <label className="row"><input type="checkbox" checked={showEmoji} onChange={e=>setShowEmoji(e.target.checked)} /> Emoji</label>
        <label className="row"><input type="checkbox" checked={showLabels} onChange={e=>setShowLabels(e.target.checked)} /> Labels</label>
        <select value={voiceName} onChange={e=>setVoiceName(e.target.value)}>
          <option value="">Default Voice</option>
          {voices.map(v=>(<option key={v.name} value={v.name}>{v.name} ({v.lang})</option>))}
        </select>
      </div>

      <div className={gridCols} style={{gap:10}}>
        {activeCat.tiles.map((t, index) => (
          <button 
            key={t.id} 
            className="tile" 
            style={{
              height:tileSize,
              minHeight:tileSize, 
              background:t.color||'var(--tile-bg)'
            }} 
            onClick={()=>addWord(t)} 
            onContextMenu={(e)=>{
              e.preventDefault(); 
              setEditing({catId:activeCat.id, tile:t})
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                addWord(t)
              } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault()
                setEditing({catId:activeCat.id, tile:t})
              }
            }}
            tabIndex={0}
            aria-label={`${t.label} tile. Press Enter to add to sentence, Delete to edit.`}
          >
            {showEmoji && (
              t.imageUrl? 
                <img 
                  src={t.imageUrl} 
                  alt="" 
                  style={{width:'50%',height:'50%',objectFit:'contain',marginBottom:6}}
                />: 
                <span className="emoji">{t.emoji||'🖱️'}</span>
            )}
            {showLabels && <span className="label">{t.label}</span>}
          </button>
        ))}
      </div>

      <input 
        ref={fileRef} 
        type="file" 
        accept="application/json" 
        style={{display:'none'}} 
        onChange={(e)=> e.target.files?.[0] && importJSON(e.target.files[0])} 
      />

      <div className="row" style={{marginTop:12}}>
        <button onClick={exportJSON}>Export</button>
        <button onClick={()=>fileRef.current?.click()}>Import</button>
      </div>

      <dialog open={shareOpen} onClose={()=>setShareOpen(false)}>
        <div style={{padding:12, maxWidth:420}}>
          <h3>Share this board</h3>
          {qrDataUrl? <img className="qr" src={qrDataUrl} alt="QR"/>: null}
          <div className="row">
            <input 
              value={shareUrl} 
              readOnly 
              onFocus={e=>e.currentTarget.select()} 
              style={{flex:1}}
            />
          </div>
          <div className="row" style={{justifyContent:'flex-end'}}>
            <button onClick={()=>{ 
              navigator.clipboard?.writeText(shareUrl); 
              toast.success('Copied link') 
            }}>
              Copy Link
            </button>
            <button onClick={()=>setShareOpen(false)}>Done</button>
          </div>
        </div>
      </dialog>

      {editing && <EditTileDialog editing={editing} onClose={()=>setEditing(null)} onSave={saveTile} onDelete={deleteTile} />}
    </div>
  </>)
}

function EditTileDialog({ editing, onClose, onSave, onDelete }){
  const { catId, tile } = editing
  const [form, setForm] = useState(tile || { id: uuid(), label:'', emoji:'🔤' })
  useEffect(()=>{ setForm(tile || { id: uuid(), label:'', emoji:'🔤' }) }, [tile])
  return (
    <dialog open onClose={onClose}>
      <div style={{padding:16, minWidth:360}}>
        <h3>{tile? 'Edit tile':'Add tile'}</h3>
        <div className="row"><span>Label</span><input value={form.label} onChange={e=>setForm({...form, label:e.target.value})} style={{flex:1}}/></div>
        <div className="row"><span>Emoji</span><input value={form.emoji||''} onChange={e=>setForm({...form, emoji:e.target.value, imageUrl:undefined})} placeholder="e.g., 🚽"/></div>
        <div className="row"><span>Image URL</span><input value={form.imageUrl||''} onChange={e=>setForm({...form, imageUrl:e.target.value||undefined})} placeholder="https://..."/></div>
        <div className="row"><span>Color</span><input type="color" value={form.color||'#ffffff'} onChange={e=>setForm({...form, color:e.target.value})}/></div>
        <div className="row"><span>Speak as</span><input value={form.speak||''} onChange={e=>setForm({...form, speak:e.target.value})} placeholder="(optional)"/></div>
        <div className="row" style={{justifyContent:'space-between'}}>
          {tile? <button onClick={()=>{ onDelete(catId, form.id); onClose(); }} style={{color:'#b91c1c'}}>Delete</button>: <span/>}
          <div className="row">
            <button onClick={onClose}>Cancel</button>
            <button className="primary" onClick={()=>{ if(!form.label.trim()) { toast.error('Label is required'); return; } onSave(catId, form); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
    </dialog>
  )
}