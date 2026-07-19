(() => {
  const pages = Array.from(document.querySelectorAll('.page'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const counter = document.getElementById('pageCounter');
  const sndFlip = document.getElementById('sndFlip');
  const sndPencil = document.getElementById('sndPencil');

  let current = 0;
  let animating = false;
  const total = pages.length;

  function playFlip(){
    try { sndFlip.currentTime = 0; sndFlip.play().catch(()=>{}); } catch(e){}
  }
  function playPencilStart(){
    try { sndPencil.currentTime = 0; sndPencil.play().catch(()=>{}); } catch(e){}
  }
  function playPencilStop(){
    try { sndPencil.pause(); } catch(e){}
  }

  // --- typing animation, slower + slight randomness for a handwritten feel ---
  function typeElement(el, baseSpeed = 42){
    return new Promise(resolve => {
      const text = el.textContent;
      el.textContent = '';
      el.classList.add('show');
      let i = 0;
      function step(){
        if (i <= text.length){
          el.textContent = text.slice(0, i);
          i++;
          const jitter = Math.random() * 20 - 5;
          setTimeout(step, baseSpeed + jitter);
        } else {
          resolve();
        }
      }
      step();
    });
  }

  function revealPhoto(el, delay = 0){
    return new Promise(resolve => {
      setTimeout(() => {
        el.classList.add('show');
        resolve();
      }, delay);
    });
  }

  async function animatePage(page){
    const typeEls = Array.from(page.querySelectorAll('[data-type]'));
    const photoEls = Array.from(page.querySelectorAll('[data-photo]'));

    typeEls.forEach(el => el.classList.remove('show'));
    photoEls.forEach(el => el.classList.remove('show'));

    if (typeEls.length) playPencilStart();

    let photoIndex = 0;
    for (const el of typeEls){
      await typeElement(el);
      if (photoIndex < photoEls.length && Math.random() > 0.35){
        revealPhoto(photoEls[photoIndex]);
        photoIndex++;
      }
    }
    playPencilStop();

    let d = 0;
    while (photoIndex < photoEls.length){
      revealPhoto(photoEls[photoIndex], d);
      photoIndex++;
      d += 350;
    }
  }

  function updateCounter(){
    counter.textContent = `${current + 1} / ${total}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  function goTo(index, direction){
    if (animating || index < 0 || index >= total || index === current) return;
    animating = true;

    const from = pages[current];
    const to = pages[index];

    playFlip();

    // prep incoming page: place it off-angle, visible, before animating in
    to.classList.add(direction === 'next' ? 'entering-next' : 'entering-prev');
    to.classList.add('active');

    // force reflow so the entering transform is applied before we clear it
    void to.offsetWidth;

    requestAnimationFrame(() => {
      to.classList.remove('entering-next', 'entering-prev');
      from.classList.add(direction === 'next' ? 'leaving-next' : 'leaving-prev');
      from.classList.remove('active');
    });

    setTimeout(() => {
      from.classList.remove('leaving-next', 'leaving-prev');
      animating = false;
    }, 750);

    current = index;
    updateCounter();
    animatePage(to);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1, 'prev'));
  nextBtn.addEventListener('click', () => goTo(current + 1, 'next'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goTo(current + 1, 'next');
    if (e.key === 'ArrowLeft') goTo(current - 1, 'prev');
  });

  // init
  pages[0].classList.add('active');
  updateCounter();
  animatePage(pages[0]);

  // --- background music: browsers block autoplay with sound,
  // so start it on the first user interaction, with a manual mute toggle ---
  const bgMusic = document.getElementById('bgMusic');
  const soundToggle = document.getElementById('soundToggle');
  bgMusic.volume = 0.35;
  let musicStarted = false;
  let muted = false;

  function startMusicOnce(){
    if (musicStarted || muted) return;
    musicStarted = true;
    bgMusic.play().catch(() => { musicStarted = false; });
  }
  document.addEventListener('click', startMusicOnce, { once: false });

  soundToggle.addEventListener('click', () => {
    muted = !muted;
    soundToggle.classList.toggle('muted', muted);
    if (muted){
      bgMusic.pause();
    } else {
      musicStarted = true;
      bgMusic.play().catch(() => {});
    }
  });

  // --- page 6: answer submit ---
  const answerInput = document.getElementById('answerInput');
  const answerSubmit = document.getElementById('answerSubmit');
  const answerBox = document.getElementById('answerBox');
  const revealText = document.getElementById('revealText');
  const revealAnswer = document.getElementById('revealAnswer');

  async function submitAnswer(){
    const value = answerInput.value.trim();
    if (!value) return;
    answerSubmit.disabled = true;

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: value,
          page_url: window.location.href,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      // fail silently for the visitor
    }

    revealAnswer.textContent = value + '!';
    answerBox.style.display = 'none';
    revealText.style.opacity = '1';
  }

  answerSubmit.addEventListener('click', submitAnswer);
  answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitAnswer();
  });
})();
