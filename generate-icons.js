/**
 * Gera os ícones PNG (192x192 e 512x512) necessários para o PWA.
 * Requer: npm install canvas
 * Uso:    node generate-icons.js
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const r = size * 0.188; // border-radius proporcional ao rx="96" em 512px

  // Fundo arredondado escuro
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  // Gradiente radial (igual ao SVG)
  const grad = ctx.createRadialGradient(
    size * 0.30, size * 0.25, 0,
    size * 0.30, size * 0.25, size * 0.70
  );
  grad.addColorStop(0, '#252540');
  grad.addColorStop(1, '#0f0e1a');
  ctx.fillStyle = grad;
  ctx.fill();

  // Círculo decorativo
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.352, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(202,138,4,0.25)';
  ctx.lineWidth = size * 0.003;
  ctx.stroke();

  // Aspas tipográficas
  ctx.font = `bold ${size * 0.508}px Georgia, serif`;
  ctx.fillStyle = 'rgba(202,138,4,0.9)';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('“', size * 0.205, size * 0.655);

  return canvas;
}

const outDir = path.join(__dirname, 'assets', 'icons');

for (const size of [192, 512]) {
  const canvas = drawIcon(size);
  const buf = canvas.toBuffer('image/png');
  const file = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(file, buf);
  console.log(`✓ ${file} (${(buf.length / 1024).toFixed(1)} KB)`);
}

console.log('\nÍcones gerados com sucesso!');
