gsap.registerPlugin(ScrollTrigger);

const SCROLL_WEIGHT = {
    lerp: 0.07, 
    wheelMultiplier: 0.85, 
    touchMultiplier: 0.9, 
};
const SCRUB_LAG = 1.2;

const lenis = new Lenis(SCROLL_WEIGHT);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const vw = (value) => (window.innerWidth / 100) * value;



const scene = (trigger, length) => gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
        trigger,
        start: 'top top',
        end: `+=${length}%`,
        pin: true,
        scrub: SCRUB_LAG,
        invalidateOnRefresh: true,
    },
});


const rise = (by = 3) => ({ autoAlpha: 0, y: () => vw(by) });
const risen = { autoAlpha: 1, y: 0 };


const TAIL = 0.7;

const section = document.querySelector('.s1');
const title = section.querySelector('h1');
const maskLeft = section.querySelector('.mask--left');
const maskRight = section.querySelector('.mask--right');
const maskCenter = section.querySelector('.mask--center');


const MOUTH_X = 0.52;
const MOUTH_Y = 0.78;
const MOUTH_WIDTH = 0.33;

const mouthShiftX = () =>
    window.innerWidth / 2 - (maskCenter.offsetLeft + maskCenter.offsetWidth * MOUTH_X);
const mouthShiftY = () =>
    window.innerHeight / 2 - (maskCenter.offsetTop + maskCenter.offsetHeight * MOUTH_Y);

const maxScale = () =>
    (Math.hypot(window.innerWidth, window.innerHeight) / (maskCenter.offsetWidth * MOUTH_WIDTH)) * 1.6;

const tl = scene(section, 300);

tl
    .to(title, { y: () => -vw(8.3), autoAlpha: 0, duration: 0.4 }, 0)
    .to(maskLeft, { x: () => -vw(21), autoAlpha: 0, duration: 0.4 }, 0)
    .to(maskRight, { x: () => vw(21), autoAlpha: 0, duration: 0.4 }, 0)
    .to(maskCenter, { x: mouthShiftX, y: mouthShiftY, duration: 0.5, ease: 'power1.inOut' }, 0)
    .to(maskCenter, { scale: maxScale, duration: 1, ease: 'power3.in' }, 0)
    .to(maskCenter, { autoAlpha: 0, duration: 0.03 }, 0.97);


const s2 = document.querySelector('.s2');
const S2_LIFT = 0.1;
const S2_DIM = 0.35;
const APPEAR_SCALE = 0.85;

const s2Img = s2.querySelector('.s2__img');

const s3Slot = s2.querySelector('.s3__img--1');
const s3Img2 = s2.querySelector('.s3__img--2');

const SLOT_FEATHER = 2.5;

gsap.set(s2Img, { transformOrigin: '0 0', y: () => -window.innerHeight * S2_LIFT });


const slotScale = () => s3Slot.offsetWidth / s2Img.offsetWidth;


const appear = { autoAlpha: 0, scale: APPEAR_SCALE };
const appeared = { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power2.out' };

scene(s2, 650)
   
    .fromTo('.s2__dark', { opacity: 1 }, { opacity: S2_DIM, duration: 1.2, ease: 'power1.out' }, 0)

    .fromTo('.s2__title', rise(4), { ...risen, duration: 0.3 }, 1)
    .addLabel('title', 1.4)
    .to({}, { duration: 0.2 })

    .to('.s2__title', { autoAlpha: 0, y: () => -vw(4), duration: 0.3 }, 1.5)
    .to(s2Img, {
        x: () => s3Slot.offsetLeft - s2Img.offsetLeft,
        y: () => s3Slot.offsetTop - s2Img.offsetTop,
        scale: slotScale,
        '--feather': () => `${vw(SLOT_FEATHER) / slotScale()}px`,
        duration: 1.2,
        ease: 'power2.inOut',
    }, 1.7)
    .to('.s2__dark', { opacity: 0, duration: 1 }, 1.7)
    .fromTo(['.s3__title', '.s3__text--1'],
        rise(),
        { ...risen, duration: 0.4, stagger: 0.08 }, 1.8)

    .to([s2Img, '.s3__text--1'], { autoAlpha: 0, duration: 0.4 }, 4)
    .fromTo(s3Img2, appear, appeared, 4.3)
    .fromTo('.s3__text--2',
        rise(),
        { ...risen, duration: 0.3 }, 4.6)

    .to(['.s3__title', '.s3__text--2', s3Img2], { autoAlpha: 0, duration: 0.5 }, 5.8)
    .to({}, { duration: 0.2 });



const s4 = document.querySelector('.s4');
const spiral = s4.querySelector('.s4__spiral');

const SPIRAL_CENTER_X = 0.534;
const SPIRAL_CENTER_Y = 0.615;
const SPIRAL_TURN = -420;
const SPIRAL_ZOOM = 11;



const spiralShiftX = () =>
    window.innerWidth / 2 - (spiral.offsetLeft + spiral.offsetWidth * SPIRAL_CENTER_X);
const spiralShiftY = () =>
    window.innerHeight / 2 - (spiral.offsetTop + spiral.offsetHeight * SPIRAL_CENTER_Y);


gsap.set(spiral, { transformOrigin: `${SPIRAL_CENTER_X * 100}% ${SPIRAL_CENTER_Y * 100}%` });

scene(s4, 620)
    .fromTo('.s4__title', rise(4), { ...risen, duration: 0.4 }, 0)
    .addLabel('title', 1.3)
    .fromTo(spiral,
        { autoAlpha: 0, y: () => window.innerHeight * 0.5, rotation: 15, scale: 0.8 },
        { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 1, ease: 'power2.out' }, 0.2)
    .to({}, { duration: 0.3 })


    .to('.s4__title', { autoAlpha: 0, y: () => -vw(4), duration: 0.4 }, 1.5)
    .to(spiral, { x: spiralShiftX, y: spiralShiftY, duration: 2.2, ease: 'power2.inOut' }, 1.6)
    .to(spiral, { rotation: SPIRAL_TURN, duration: 3.5, ease: 'power1.inOut' }, 1.6)
    .to(spiral, { scale: SPIRAL_ZOOM, duration: 3.5, ease: 'power3.in' }, 1.6)
    .to(spiral, { autoAlpha: 0, duration: 0.3 }, 4.8)
    .to({}, { duration: 0.2 });


const s5 = document.querySelector('.s5');
const s5Rows = s5.querySelectorAll('.s5__row');
const s5Texts = s5.querySelectorAll('.s5__text');
const s5Labels = s5.querySelectorAll('.s5__label');


const WASH_DRIFT = 8;

const WASH_BLUR = 6;


const washText = (row, text) => {
    const rowLeft = row.getBoundingClientRect().left - s5.getBoundingClientRect().left;
    const left = text.offsetLeft;
    const width = text.offsetWidth;
    const covered = gsap.utils.clamp(0, 1, (left + width - rowLeft) / width);
    const drift = -vw(WASH_DRIFT) * covered;
   
    const hidden = gsap.utils.clamp(0, width, left + drift + width - rowLeft);
    gsap.set(text, {
        x: drift,
        clipPath: `inset(-20% ${hidden}px -20% 0)`,
        filter: `blur(${WASH_BLUR * covered}px)`,
        opacity: 1 - covered,
    });
};

const s5Tl = scene(s5, 940)
    .fromTo('.s5__title', rise(4), { ...risen, duration: 0.4 }, 0)
    .fromTo('.s5__lead', rise(), { ...risen, duration: 0.4 }, 0.15);



const ROW_STEP = 1.8;       
const ROW_READ = 0.8;       
s5Rows.forEach((row, i) => {
    const textAt = 0.7 + i * ROW_STEP;
    s5Tl
        .fromTo(s5Texts[i],
            rise(),
            { ...risen, duration: 0.35 }, textAt)
        .fromTo(row,
            { x: () => window.innerWidth - row.offsetLeft },
            {
                x: 0,
                duration: 1.2,
                ease: 'power2.out',
                onUpdate: () => washText(row, s5Texts[i]),
            },
            textAt + ROW_READ)
        .fromTo(s5Labels[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power1.inOut' }, textAt + ROW_READ + 0.8);
});
s5Tl.to({}, { duration: 0.3 });



const s5Exit = [
    { at: 7.1,  duration: 1.6, ease: 'power2.in', washes: '.s5__title' },
    { at: 6.85, duration: 1.3, ease: 'power3.in', washes: '.s5__lead' },
    { at: 7.4,  duration: 1.9, ease: 'power1.in' },
];
s5Rows.forEach((row, i) => {
    const { at, duration, ease, washes } = s5Exit[i];
    const text = washes && s5.querySelector(washes);
    s5Tl.to([row, s5Labels[i]], {
        x: () => -(row.offsetLeft + row.offsetWidth),
        duration,
        ease,
        onUpdate: text ? () => washText(row, text) : undefined,
    }, at);
});
s5Tl.to({}, { duration: 0.2 });




const S6_ZOOM = 1.8;

scene('.s6', 450)
    .fromTo('.s6__img', appear, appeared, 0)
    .fromTo(['.s6__title', '.s6__text'],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, stagger: 0.1 }, 0.4)

    .to({}, { duration: 0.6 })

   

    .to(['.s6__title', '.s6__text'], { autoAlpha: 0, duration: 0.4 }, 1.6)
    .to('.s6__img', { scale: S6_ZOOM, duration: 2, ease: 'power1.in' }, 1.6)
    .fromTo('.s6__img', { filter: 'brightness(1)' }, { filter: 'brightness(0)', duration: 2 }, 1.6)
    .to('.s6__img', { autoAlpha: 0, duration: 0.2 }, 3.4)
    .to({}, { duration: 0.2 });


const quote = (selector) => {
    const text = document.querySelector(`${selector} .quote`);
    scene(selector, 350)
        .fromTo(text, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .to({}, { duration: 0.5 })
        .to(text, { autoAlpha: 0, duration: 0.8, ease: 'power1.inOut' })
        .to({}, { duration: TAIL });
};



const SWAP = 2.2;          
const PULL = 1;
const PULL_GAP = 3;
const duo = (selector, length, puller) => {
    const box = document.querySelector(selector);
    const title = box.querySelector('.title');
    const photos = box.querySelectorAll('.photo');
    const texts = box.querySelectorAll('.text');
    const last = photos.length - 1;
    const o = puller ? PULL : 0;

    const tl = scene(box, length).fromTo(photos[0], appear, appeared, o);
    if (puller) {
        const behind = (x, el) =>
            `${Math.max(parseFloat(x), puller.getBoundingClientRect().right + vw(PULL_GAP) - el.offsetLeft)}px`;
        tl.fromTo([title, texts[0]],
            { x: (i, el) => window.innerWidth - el.offsetLeft },
            { x: 0, duration: 0.8, ease: 'power2.out', stagger: 0.06, modifiers: { x: behind } }, 0);
    } else {
        tl.fromTo([title, texts[0]], rise(), { ...risen, duration: 0.4, stagger: 0.08 }, 0.3);
    }

    for (let i = 1; i <= last; i++) {
        const at = o + 2 + (i - 1) * SWAP;
        tl.to([photos[i - 1], texts[i - 1]], { autoAlpha: 0, duration: 0.4 }, at)
            .fromTo(photos[i], appear, appeared, at + 0.3)
            .fromTo(texts[i], rise(), { ...risen, duration: 0.3 }, at + 0.6);
    }

    tl.to([title, texts[last], photos[last]],
        { autoAlpha: 0, duration: 0.6, ease: 'power1.inOut' }, o + (last + 1) * SWAP - 0.2)
        .to({}, { duration: TAIL });
};




quote('.s7');


scene('.s8', 250)
    .fromTo('.s8__dark', { opacity: 1 }, { opacity: S2_DIM, duration: 1.2, ease: 'power1.out' }, 0)
    .fromTo('.s8__title', rise(4), { ...risen, duration: 0.3 }, 1)
    .addLabel('title', 1.5)
    .to('.s8__title', { autoAlpha: 0, y: () => -vw(4), duration: 0.3 }, 1.7)
    .to('.s8__dark', { opacity: 1, duration: 0.8 }, 1.8)
    .to({}, { duration: 0.2 });

duo('.s9', 560);



const s10Img = document.querySelector('.s10__img');
const S10_LENGTH = 650;
const S10_PULL_AT = 4.9;

const s10Tl = scene('.s10', S10_LENGTH)
    .fromTo('.s10__title', rise(), { ...risen, duration: 0.5, ease: 'power1.out' }, 0.2)
    .fromTo(s10Img, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, 0.3)
    .addLabel('title', 0.95)
    .to('.s10__title', { autoAlpha: 0, duration: 0.5 }, 1.1)
    .to(s10Img, {
        y: () => (window.innerHeight - s10Img.offsetHeight) / 2 - s10Img.offsetTop,
        duration: 0.8,
        ease: 'power2.inOut',
    }, 1.1)
    .to(s10Img, { x: () => -s10Img.offsetWidth, duration: 4, ease: 'sine.in' }, 1.5)
    .to({}, { duration: 0.5 });


document.querySelector('.s11').style.setProperty('--pull',
    `${S10_LENGTH * (1 - S10_PULL_AT / s10Tl.duration())}vh`);
duo('.s11', 660, s10Img);
quote('.s12');


const S13_SWAY = 0.8;
const dark = { autoAlpha: 0, filter: 'brightness(0)' };
const lit = { autoAlpha: 1, filter: 'brightness(1)', duration: 1, ease: 'power2.out' };

scene('.s13', 500)
    .fromTo('.s13__hand', dark, { ...lit, duration: 1.4 }, 0)
    .fromTo('.s13__title', dark, lit, 0.4)
    .fromTo('.s13__text', dark, { ...lit, duration: 1.4, stagger: 1.6 })
    .to({}, { duration: 1 })
    .to('.s13 > *', { ...dark, duration: 0.8, ease: 'power1.inOut' })
    .to({}, { duration: 0.2 });

gsap.fromTo('.s13__hand',
    { y: (i) => vw((i ? 1 : -1) * S13_SWAY) },
    { y: (i) => vw((i ? -1 : 1) * S13_SWAY), duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });


const end = document.querySelector('.end');

scene('.s15', 200)
    .fromTo('.s15 .quote', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
    .to({}, { duration: 0.3 })
    .fromTo(end, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'power2.out' })
    .to('.s15 .quote', { y: () => -end.offsetHeight / 2, duration: 0.8, ease: 'power2.out' }, '<')
    .to({}, { duration: 0.2 });


document.querySelectorAll('.end a').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(link.hash);
    const st = ScrollTrigger.getAll().find((t) => t.trigger === target);
    lenis.scrollTo(st.labelToScroll('title'), { immediate: true, force: true });
    ScrollTrigger.update();
    ScrollTrigger.getAll().forEach((t) => t.getTween()?.progress(1));
}));


window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    s10Img.decode().catch(() => {});
});
