const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

let w, h;
let time = 0;
let rotation = 0;
let dragging = false;
let lastX = 0;

function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
}

resize();
window.addEventListener("resize", resize);

// Estrellas
const stars = [];

for (let i = 0; i < 400; i++) {
    stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2,
        phase: Math.random() * 7
    });
}

// Corazón de partículas
const heart = [];

for (let i = 0; i < 2200; i++) {
    const t = Math.random() * Math.PI * 2;

    const x = 16 * Math.pow(Math.sin(t), 3);

    const y = -(
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t)
    );

    const scale = Math.random() * 10 + 1;

    heart.push({
        x: x * scale,
        y: y * scale,
        z: (Math.random() - 0.5) * 40,
        size: Math.random() * 2 + 1
    });
}

// Proyección 3D
function project(x, y, z) {
    const a = rotation;

    const X = x * Math.cos(a) - z * Math.sin(a);
    const Z = z * Math.cos(a) + x * Math.sin(a);

    const depth = 700 + Z;
    const scale = 650 / depth;

    return {
        x: w / 2 + X * scale,
        y: h / 2 + y * scale,
        scale
    };
}

// Animación
function animate() {
    time += 0.016;
    rotation += 0.002;

    ctx.fillStyle = "#080313";
    ctx.fillRect(0, 0, w, h);

    // Dibujar estrellas
    stars.forEach(s => {
        const alpha = 0.4 + Math.sin(time * 2 + s.phase) * 0.4;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Latido
    const pulse = 1 + Math.sin(time * 3) * 0.035;

    // Dibujar corazón
    heart.forEach(p => {
        const point = project(
            p.x * pulse,
            p.y * pulse,
            p.z
        );

        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#f5d9ff";
        ctx.shadowColor = "#e88bff";
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(
            point.x,
            point.y,
            Math.max(0.7, p.size * point.scale * 3),
            0,
            Math.PI * 2
        );

        ctx.fill();
    });

    // Texto central
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff80e8";
    ctx.textAlign = "center";

    ctx.fillStyle = "white";
    ctx.font = "38px 'Great Vibes'";
    ctx.fillText("Te amo mucho", w / 2, h / 2 - 15);

    ctx.fillStyle = "#ffc9ee";
    ctx.font = "44px 'Great Vibes'";
    ctx.fillText("Nahiara", w / 2, h / 2 + 30);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    requestAnimationFrame(animate);
}

animate();

// Rotación táctil y mouse
canvas.addEventListener("pointerdown", e => {
    dragging = true;
    lastX = e.clientX;
});

window.addEventListener("pointermove", e => {
    if (!dragging) return;

    rotation += (e.clientX - lastX) * 0.006;
    lastX = e.clientX;
});

window.addEventListener("pointerup", () => {
    dragging = false;
});

// Carta secreta
const letter = document.getElementById("letter");

document.getElementById("open").onclick = () => {
    letter.style.display = "flex";
};

document.getElementById("close").onclick = () => {
    letter.style.display = "none";
};

// Música ambiental original
let audio;
let playing = false;
let timer;

document.getElementById("music").onclick = async () => {

    if (!playing) {
        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        audio = new AudioContext();
        await audio.resume();

        const notes = [261.63, 329.63, 392, 440, 392, 329.63];
        let index = 0;
        playing = true;

        function playNote() {
            if (!playing) return;

            const oscillator = audio.createOscillator();
            const gain = audio.createGain();

            oscillator.frequency.value =
                notes[index++ % notes.length];

            oscillator.type = "sine";

            gain.gain.setValueAtTime(0.08, audio.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audio.currentTime + 1.2
            );

            oscillator.connect(gain);
            gain.connect(audio.destination);

            oscillator.start();
            oscillator.stop(audio.currentTime + 1.3);

            timer = setTimeout(playNote, 650);
        }

        playNote();
        document.getElementById("music").textContent =
            "♫ Apagar música";

    } else {
        playing = false;
        clearTimeout(timer);
        await audio.close();

        document.getElementById("music").textContent =
            "♫ Música";
    }
};