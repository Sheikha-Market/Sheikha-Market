"""Original schematic media; no input images, network, hardware or personal data."""
from pathlib import Path
import json, math, struct, wave, hashlib
out=Path(__file__).resolve().parents[2]/'runtime/sheikha-media/v1';out.mkdir(parents=True,exist_ok=True)
W,H,FPS,N=160,120,12,48
boxes=[(-.6,0,-.3,.6,1.3,.3),(-.4,1.4,-.3,.4,2.1,.3),(-1,0,-.2,-.7,1.2,.2),(.7,0,-.2,1,1.2,.2),(-.5,-.8,-.2,-.15,0,.2),(.15,-.8,-.2,.5,0,.2)]
vertices=[];faces=[]
for x,y,z,X,Y,Z in boxes:
 b=len(vertices);vertices += [(x,y,z),(X,y,z),(X,Y,z),(x,Y,z),(x,y,Z),(X,y,Z),(X,Y,Z),(x,Y,Z)]
 for f in [(1,2,3,4),(5,8,7,6),(1,5,6,2),(2,6,7,3),(3,7,8,4),(5,1,4,8)]:faces.append([b+i for i in f])
(out/'robot.obj').write_text('# SHEIKHA original schematic; simulation units\n'+''.join('v %s %s %s\n'%v for v in vertices)+''.join('f '+' '.join(map(str,f))+'\n' for f in faces))
(out/'identity.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="#041b25"/><g fill="#086a64" stroke="#d4af37" stroke-width="5"><rect x="275" y="60" width="90" height="80" rx="20"/><rect x="245" y="155" width="150" height="170" rx="18"/><path d="M220 165V310M420 165V310M280 345V405M360 345V405" stroke-width="25"/></g><text x="320" y="250" text-anchor="middle" fill="#d4af37" font-size="32">شيخة</text><text x="320" y="455" text-anchor="middle" fill="#eef5f2" font-size="18">SHEIKHA · LOCAL DESIGN</text></svg>''')
scene={'identity':'SHEIKHA_IDENTITY_V1','dimensions':'3D_PLUS_TIME','units':'SIMULATION_UNITS','vertices':vertices,'faces':faces,'durationSeconds':4,'keyframes':[{'t':i/FPS,'rotationY':i/N*math.tau} for i in range(N)],'arVerified':'UNKNOWN','vrVerified':'UNKNOWN','nativeGuestRendering':'UNKNOWN','physicalEmbodiment':'UNKNOWN'}
(out/'scene-4d.json').write_text(json.dumps(scene,indent=2))
with wave.open(str(out/'identity-tone.wav'),'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(22050)
 w.writeframes(b''.join(struct.pack('<h',int(4000*math.sin(2*math.pi*440*i/22050)*min(1,i/1000,(22050-i)/1000))) for i in range(22050)))
def chunk(tag,data):return tag+struct.pack('<I',len(data))+data+(b'\0' if len(data)%2 else b'')
def listing(tag,data):return chunk(b'LIST',tag+data)
stride=(W*3+3)&~3;size=stride*H;frames=[]
for n in range(N):
 image=bytearray(bytes([37,27,4])*W*H);dx=int(16*math.sin(n/N*math.tau))
 for xa,ya,xb,yb in [(65,15,95,40),(55,45,105,85),(40,45,50,85),(110,45,120,85),(60,88,72,112),(88,88,100,112)]:
  for y in range(ya,yb):
   for x in range(xa+dx,xb+dx):
    pos=((H-1-y)*W+x)*3;edge=x in (xa+dx,xb+dx-1) or y in (ya,yb-1);image[pos:pos+3]=bytes([55,175,212] if edge else [100,106,8])
 frames.append(chunk(b'00db',bytes(image)))
avih=struct.pack('<14I',1000000//FPS,size*FPS,0,0x10,N,0,1,size,W,H,0,0,0,0)
strh=struct.pack('<4s4sIHHIIIIIIIIhhhh',b'vids',b'DIB ',0,0,0,0,1,FPS,0,N,size,0xffffffff,0,0,0,W,H)
strf=struct.pack('<IiiHHIIiiII',40,W,H,1,24,0,size,0,0,0,0)
headers=listing(b'hdrl',chunk(b'avih',avih)+listing(b'strl',chunk(b'strh',strh)+chunk(b'strf',strf)))
offset=4;index=b''
for frame in frames:index+=struct.pack('<4sIII',b'00db',0x10,offset,size);offset+=len(frame)
body=b'AVI '+headers+listing(b'movi',b''.join(frames))+chunk(b'idx1',index)
(out/'robot-motion.avi').write_bytes(b'RIFF'+struct.pack('<I',len(body))+body)
html='''<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>شيخة · إنتاج الوسائط</title><style>body{background:#041b25;color:#eef5f2;font:18px Tahoma;margin:30px}canvas{width:min(100%,720px);background:#03151b}a{color:#d4af37}button{padding:12px}</style><h1>شيخة · مجسم وحركة و360°</h1><p>اسحب لتدوير المجسم. الحركة 4D تعني ثلاثي الأبعاد عبر الزمن. وحدات تجريبية.</p><canvas width="720" height="480" id="view" aria-label="مجسم شيخة"></canvas><br><button id="toggle">إيقاف / تشغيل الحركة</button><p><a href="identity.svg">الرسم SVG</a> · <a href="robot.obj">المجسم OBJ</a> · <a href="scene-4d.json">المشهد الزمني</a> · <a href="robot-motion.avi">الفيديو AVI</a></p><audio controls src="identity-tone.wav"></audio><p>الصوت نغمة صناعية، توليد الكلام UNKNOWN. AR/VR وتشغيل الضيف الأصلي UNKNOWN.</p><script>const vertices=VERTICES,faces=FACES;const canvas=document.getElementById('view'),ctx=canvas.getContext('2d');let angle=0,playing=true,last=null,drag=false;document.getElementById('toggle').onclick=()=>playing=!playing;canvas.onpointerdown=e=>{drag=true;canvas.setPointerCapture(e.pointerId)};canvas.onpointerup=()=>drag=false;canvas.onpointermove=e=>{if(drag)angle+=e.movementX*.01};function render(now){const dt=last===null?0:Math.min((now-last)/1000,.1);last=now;if(playing&&!drag)angle+=dt*Math.PI/2;ctx.clearRect(0,0,720,480);const p=vertices.map(([x,y,z])=>{const X=x*Math.cos(angle)+z*Math.sin(angle),Z=-x*Math.sin(angle)+z*Math.cos(angle);return [360+X*100,300-y*100,Z]});faces.slice().sort((a,b)=>b.reduce((s,i)=>s+p[i-1][2],0)-a.reduce((s,i)=>s+p[i-1][2],0)).forEach(f=>{ctx.beginPath();f.forEach((i,n)=>{const v=p[i-1];n?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1])});ctx.closePath();ctx.fillStyle='#086a64';ctx.fill();ctx.strokeStyle='#d4af37';ctx.stroke()});requestAnimationFrame(render)}requestAnimationFrame(render)</script></html>'''
(out/'index.html').write_text(html.replace('VERTICES',json.dumps(vertices)).replace('FACES',json.dumps(faces)))
artifacts=[{'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in sorted(out.iterdir()) if p.name in ['robot.obj','identity.svg','scene-4d.json','identity-tone.wav','robot-motion.avi','index.html']]
(out/'artifacts.json').write_text(json.dumps({'artifacts':artifacts,'video':'ORIGINAL_SCHEMATIC_AVI','audio':'SYNTHETIC_TONE_NOT_SPEECH'},indent=2))
print(json.dumps({'artifacts':len(artifacts),'frames':N,'videoSeconds':N/FPS}))
