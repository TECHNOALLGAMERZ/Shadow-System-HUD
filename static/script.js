const bgMusic = document.getElementById('bg-music');
const volSlider = document.getElementById('vol-slider');
let audioCtx, analyser, dataArray, source;

// --- MONARCH PROTECTION LAYER ---
// Blocks Right-Click
document.addEventListener('contextmenu', e => e.preventDefault());

// Blocks Keyboard Shortcuts for Inspect/Source
document.onkeydown = function(e) {
    if(e.keyCode == 123 || // F12
       (e.ctrlKey && e.shiftKey && e.keyCode == 73) || // Ctrl+Shift+I
       (e.ctrlKey && e.keyCode == 85) || // Ctrl+U (View Source)
       (e.ctrlKey && e.keyCode == 83)) { // Ctrl+S (Save Page)
        return false;
    }
};

// --- CORE SYSTEM LOGIC ---
function startVisualizer() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaElementSource(bgMusic);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 64;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        drawVisualizer();
    }
}

function drawVisualizer() {
    const vCanvas = document.getElementById('visualizer');
    const vCtx = vCanvas.getContext('2d');
    requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);
    vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);
    let barWidth = (vCanvas.width / dataArray.length) * 2;
    let x = 0;
    for(let i = 0; i < dataArray.length; i++) {
        let barHeight = dataArray[i] / 4;
        vCtx.fillStyle = '#00d4ff'; // Blue visualizer
        vCtx.fillRect(x, vCanvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
        // Central Box Pulse
        if (dataArray[i] > 200) document.getElementById('ui-window').style.boxShadow = `0 0 50px #00d4ff`;
        else document.getElementById('ui-window').style.boxShadow = `0 0 15px rgba(0, 212, 255, 0.1)`;
    }
}

function adjustVolume() { bgMusic.volume = volSlider.value; }
function toggleMusic() {
    if (bgMusic.paused) { startVisualizer(); bgMusic.play(); document.getElementById('bgm-label').innerText = "BGM: ON"; }
    else { bgMusic.pause(); document.getElementById('bgm-label').innerText = "BGM: OFF"; }
}

async function triggerLevelUp() {
    const res = await fetch('/gain-xp', { method: 'POST' });
    const d = await res.json();
    
    document.getElementById('lvl-display-num').innerText = d.stats.level;
    document.getElementById('str-val').innerText = d.stats.stats.STR;
    document.getElementById('agi-val').innerText = d.stats.stats.AGI;
    document.getElementById('int-val').innerText = d.stats.stats.INT;
    document.getElementById('xp-bar').style.width = (d.stats.xp / d.stats.xp_to_next) * 100 + "%";
    document.getElementById('rank').innerText = `[${d.stats.rank}]`;

    if (d.leveled_up) {
        const lvlSound = document.getElementById('level-up-sound');
        lvlSound.currentTime = 0;
        lvlSound.play();
        const overlay = document.getElementById('rank-up-overlay');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('hidden'), 3000);
    }
}

setInterval(() => { 
    document.getElementById('current-clock').innerText = new Date().toLocaleTimeString('en-GB'); 
}, 1000);

// --- PARTICLE SYSTEM ---
const canvas = document.getElementById('shadowCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let particles = [];
class P {
    constructor() { this.x = Math.random()*canvas.width; this.y = canvas.height+10; this.s = Math.random()*2+1; this.v = Math.random()*1.5+0.5; }
    update() { this.y -= this.v; if(this.s>0.1) this.s-=0.01; }
    draw() { ctx.fillStyle = 'rgba(106, 0, 255, 0.4)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI*2); ctx.fill(); }
}
function animate() {
    ctx.fillStyle = 'rgba(1, 1, 3, 0.1)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    if(particles.length < 70) particles.push(new P());
    particles.forEach((p,i) => { p.update(); p.draw(); if(p.s<=0.2) particles.splice(i,1); });
    requestAnimationFrame(animate);
}
animate();