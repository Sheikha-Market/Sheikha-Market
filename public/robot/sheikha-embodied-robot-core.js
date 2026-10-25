/* 🤖 SHEIKHA EMBODIED CORE - Three.js + AI Weights + Video + Computing - BOUND_BY_QURAN_SUNNAH */
class SheikhaEmbodiedRobotCore {
  constructor() {
    this.seal = "BOUND_BY_QURAN_SUNNAH - ATOM_WATER_RASUL_JANNAH_SEALED";
    this.weights = [];
    this.joints = ["foundation_robot","forging_robot","builder_robot","compute_robot","ledger_robot","trader_robot","carrier_robot","guardian_robot"];
    this.methodologies = ["quantum","cosmic","bio","sbc","trade","video","computing","governance"];
    this.phi = 1.618033988749; // النسبة الذهبية للهوية
  }
  
  async loadWeights() {
    try {
      const res = await fetch('/SHEIKHA-CORE/sheikhachain/robot/core/animation_weights.json');
      const data = await res.json();
      this.weights = data.frames;
      console.log(`🤖 Loaded ${data.total_weights} weights | ${data.total_shk} SHK - ${this.seal}`);
      return data;
    } catch(e) {
      console.log('Weights load:', e.message);
      // بيانات وهمية للعرض
      return { total_weights: 452, total_shk: 86750000, frames: Array.from({length:20}, (_,i)=>({joint_angle: (i*this.phi)%(2*Math.PI)-Math.PI, shk: 100000+i*1000})) };
    }
  }
  
  weightToJointAngle(idx) {
    // أوزان للتحريك - تحويل رياضي ذهبي
    return (idx * this.phi * Math.PI) % (2*Math.PI) - Math.PI;
  }
  
  initThreeJS(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.THREE) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // إضاءة ملكية
    scene.add(new THREE.AmbientLight(0xd4af37, 1.2));
    const p1 = new THREE.PointLight(0xffffff, 2, 50); p1.position.set(5,5,5); scene.add(p1);
    const p2 = new THREE.PointLight(0x10b981, 2.5, 30); p2.position.set(-5,-3,3); scene.add(p2);
    
    // روبوت متجسد - 7 مفاصل = 7 أدوار
    const group = new THREE.Group();
    const joints = [];
    
    this.joints.forEach((name, i) => {
      const geo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16);
      const mat = new THREE.MeshPhysicalMaterial({color: i%2?0x0a3d2a:0xd4af37, metalness:0.8, roughness:0.2});
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = i * 0.7 - 2;
      mesh.userData = {name, index: i, baseY: mesh.position.y};
      group.add(mesh);
      joints.push(mesh);
    });
    
    // رأس بتاج
    const headGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const headMat = new THREE.MeshPhysicalMaterial({color:0x061a14, metalness:0.9, roughness:0.1, clearcoat:1});
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 3; group.add(head);
    
    const haloGeo = new THREE.TorusGeometry(0.9, 0.05, 16, 100);
    const haloMat = new THREE.MeshStandardMaterial({color:0xd4af37, metalness:0.9});
    const halo = new THREE.Mesh(haloGeo, haloMat); halo.rotation.x = Math.PI/3; halo.position.y = 3.5; group.add(halo);
    
    scene.add(group);
    camera.position.set(0,2,8); camera.lookAt(0,0,0);
    
    // حركة بالأوزان
    let clock = new THREE.Clock();
    let mouseX = 0, mouseY = 0;
    container.addEventListener('mousemove', e=>{
      const r = container.getBoundingClientRect();
      mouseX = ((e.clientX-r.left)/container.clientWidth)*2-1;
      mouseY = -((e.clientY-r.top)/container.clientHeight)*2+1;
    });
    
    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      
      joints.forEach((j,i)=>{
        const weightAngle = this.weightToJointAngle(i + Math.floor(t));
        j.rotation.z = weightAngle * 0.3 + Math.sin(t + i)*0.2;
        j.position.x = Math.sin(t*0.5 + i)*0.2 + mouseX*0.3;
      });
      
      head.position.y = 3 + Math.sin(t*1.5)*0.1;
      halo.rotation.z += 0.01;
      group.rotation.y += (mouseX*0.5 - group.rotation.y)*0.05;
      group.rotation.x += (-mouseY*0.3 - group.rotation.x)*0.05;
      
      renderer.render(scene, camera);
    };
    animate();
    
    window.addEventListener('resize', ()=>{
      camera.aspect = container.clientWidth/container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    console.log(`🤖 Three.js Embodied Robot - ${joints.length} joints from ${this.weights.length} weights - ${this.seal}`);
  }
}

window.SheikhaEmbodiedRobotCore = SheikhaEmbodiedRobotCore;
