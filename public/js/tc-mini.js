// Calculadora de timecode chiquita para la home.
// Usa la misma librería que la tool completa (js/tools/tc-lib.js).
(function () {
  const box = document.querySelector('[data-tc-mini]');
  if (!box || !window.MajaguaTC) return;
  const TC = window.MajaguaTC;
  const fps = box.querySelector('[name="fps"]');
  const a = box.querySelector('[name="a"]');
  const b = box.querySelector('[name="b"]');
  const op = box.querySelector('[name="op"]');
  const out = box.querySelector('[data-result]');
  const sub = box.querySelector('[data-sub]');

  TC.fillSelect(fps, '24');

  function calc() {
    const k = fps.value;
    const fa = TC.tcToFrames(a.value, k), fb = TC.tcToFrames(b.value, k);
    a.classList.toggle('invalid', !!fa.error);
    b.classList.toggle('invalid', !!fb.error);
    if (fa.error || fb.error) { out.textContent = '--:--:--:--'; sub.textContent = fa.error || fb.error; return; }
    const total = op.value === '-' ? fa.frames - fb.frames : fa.frames + fb.frames;
    out.textContent = TC.framesToTC(total, k);
    sub.textContent = `${total.toLocaleString('es')} frames, ${TC.framesToClock(total, k)} reales`;
  }
  box.addEventListener('input', calc);
  box.addEventListener('change', calc);
  calc();
})();
