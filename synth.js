const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();
let oscillators = [];
const volume = context.createGain();
volume.gain.setValueAtTime(0.1, context.currentTime);
const wavebtn = document.querySelectorAll(".wave-btn");
let waveform = "square";
const biquadFilter = context.createBiquadFilter();
biquadFilter.frequency.setValueAtTime(11000, context.currentTime);
let analyser = context.createAnalyser();
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const handleClick = (e) => (waveform = e.target.dataset.key);

wavebtn.forEach((btn) => btn.addEventListener("click", handleClick));

const noteMap = {
  a: 200,
  s: 246.94,
  d: 261.63,
  f: 293.66,
  g: 329.23,
  h: 349.23,
  j: 392,
  k: 440,
  l: 493.88,
  ö: 523.25,
  ä: 587.33,
};

const play = (e) => {
  if (e.repeat || !noteMap[e.key]) return;
  const oscillator = context.createOscillator();
  oscillator.type = waveform;
  const frequency = noteMap[e.key];
  oscillator.frequency.setValueAtTime(noteMap[e.key], context.currentTime);
  oscillator.connect(volume);
  volume.connect(biquadFilter);
  biquadFilter.connect(analyser);
  analyser.connect(context.destination);
  draw();

  oscillator.start();
  oscillators.push({ oscillator, frequency });
};

const stop = (e) => {
  oscillators.forEach((osc) => {
    if (osc.frequency !== noteMap[e.key]) return;
    osc.oscillator.stop();
    osc.oscillator.disconnect();
  });
};

document.addEventListener("keypress", play);
document.addEventListener("keyup", stop);

const draw = () => {
  requestAnimationFrame(draw);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgb(255, 255, 255)";

  ctx.beginPath();

  const sliceWidth = (canvas.width * 1) / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128;
    const y = canvas.height - (v * canvas.height) / 2;

    ctx.rect(x, y, 1, 500);
    x += sliceWidth;
  }

  function random_rgba() {
    const o = Math.round,
      r = Math.random,
      s = 255;
    return (
      "rgba(" +
      o(r() * s) +
      "," +
      o(r() * s) +
      "," +
      o(r() * s) +
      "," +
      r().toFixed(1) +
      ")"
    );
  }
  const color = random_rgba();

  ctx.rect(canvas.width, canvas.height, 0, 0);
  ctx.fillStyle = `${color}`;
  ctx.fill();
};
