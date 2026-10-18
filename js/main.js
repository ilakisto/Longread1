gsap.registerPlugin(ScrollTrigger);

// Тяжёлая инерционная прокрутка, синхронизированная с GSAP:
// страница едет медленнее колеса и долго «дотягивается» — листать как будто с трудом
const SCROLL_WEIGHT = {
    lerp: 0.04,             // чем меньше, тем вязче и дольше докатывается (было 0.08)
    wheelMultiplier: 0.55,  // доля прокрутки колёсиком/тачпадом (1 — обычная)
    touchMultiplier: 0.7,   // то же для пальца на телефоне
};
// Сколько секунд анимации «догоняют» прокрутку — добавляет ощущение веса
const SCRUB_LAG = 2.5;

const lenis = new Lenis(SCROLL_WEIGHT);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const section = document.querySelector('.s1');
const title = section.querySelector('h1');
const maskLeft = section.querySelector('.mask--left');
const maskRight = section.querySelector('.mask--right');
const maskCenter = section.querySelector('.mask--center');

// Положение рта в картинке средней маски (в долях её размера)
const MOUTH_X = 0.52;
const MOUTH_Y = 0.78;
// Ширина отверстия рта относительно ширины маски
const MOUTH_WIDTH = 0.33;

const vw = (value) => (window.innerWidth / 100) * value;

// Сдвиг, который ставит рот в центр экрана (offset* не зависят от трансформаций)
const mouthShiftX = () =>
    window.innerWidth / 2 - (maskCenter.offsetLeft + maskCenter.offsetWidth * MOUTH_X);
const mouthShiftY = () =>
    window.innerHeight / 2 - (maskCenter.offsetTop + maskCenter.offsetHeight * MOUTH_Y);

// Масштаб, при котором рот перекрывает весь экран
const maxScale = () =>
    (Math.hypot(window.innerWidth, window.innerHeight) / (maskCenter.offsetWidth * MOUTH_WIDTH)) * 1.6;

const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=300%',          // длина анимации — три экрана прокрутки
        pin: true,
        scrub: SCRUB_LAG,       // анимация тяжело «догоняет» прокрутку
        invalidateOnRefresh: true,
    },
});

tl
    // Заголовок и боковые маски уходят
    .to(title, { y: () => -vw(8.3), autoAlpha: 0, duration: 0.4 }, 0)
    .to(maskLeft, { x: () => -vw(21), autoAlpha: 0, duration: 0.4 }, 0)
    .to(maskRight, { x: () => vw(21), autoAlpha: 0, duration: 0.4 }, 0)
    // Рот средней маски выезжает в центр экрана
    .to(maskCenter, { x: mouthShiftX, y: mouthShiftY, duration: 0.5, ease: 'power1.inOut' }, 0)
    // и маска растёт, пока мы не окажемся внутри
    .to(maskCenter, { scale: maxScale, duration: 1, ease: 'power3.in' }, 0)
    // Когда рот закрыл весь экран, прячем маску — дальше только темнота
    .to(maskCenter, { autoAlpha: 0, duration: 0.03 }, 0.97);

// Амфитеатр вылетает из глубины: крошечная точка в темноте растёт,
// пока не займёт весь экран, — будто мы идём к нему всё дальше
const s2 = document.querySelector('.s2');
// Насколько картинка в итоге поднята вверх (в долях высоты экрана).
// CSS берёт это значение, чтобы оставить под картинкой запас и не было щели
const S2_LIFT = 0.1;
s2.style.setProperty('--s2-lift', `${S2_LIFT * 100}vh`);
// Итоговое затемнение картинки: 0 — без затемнения, 1 — чёрный экран
const S2_DIM = 0.35;

const s2Img = s2.querySelector('.s2__img');
const s3Img2 = s2.querySelector('.s3__img--2');
// Место в «Начале театра», мимо которого проходит первая картинка
const s3Slot = s2.querySelector('.s3__img--1');

// Положение элемента внутри .s2 без учёта трансформаций
const offsetInS2 = (el) => {
    let left = 0;
    let top = 0;
    for (let node = el; node && node !== s2; node = node.offsetParent) {
        left += node.offsetLeft;
        top += node.offsetTop;
    }
    return { left, top, width: el.offsetWidth, height: el.offsetHeight };
};

const centerOf = (el) => {
    const box = offsetInS2(el);
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

// Насколько картинка, уходя вглубь, смещается вправо (и чуть вверх)
const DRIFT_X = 18;     // в vw
const DRIFT_Y = -3;     // в vw
// Насколько первая картинка сначала уводится влево (изгиб дуги), в vw
const BOW_X = -15;
// Чем больше, тем быстрее картинка мельчает в начале и медленнее — в конце
const DEPTH_CURVE = 1.7;

// Картинка уходит вглубь: всё время уменьшается, пока не исчезнет, и летит
// по дуге — сначала к своему месту в макете, потом сворачивает вправо.
// p — прогресс от 0 до 1, start() — откуда она начинает (центр и масштаб)
const passBy = (el, slot, start, bowX = 0) => {
    let path;
    const measure = () => {
        const base = centerOf(el);
        const from = start(base);
        const via = centerOf(slot);
        path = {
            base,
            scale: from.scale,
            p0: from.center,
            p1: { x: via.x + vw(bowX), y: via.y },
            p2: { x: via.x + vw(DRIFT_X), y: via.y + vw(DRIFT_Y) },
        };
    };
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);

    return (p) => {
        const { base, scale, p0, p1, p2 } = path;
        // Квадратичная кривая Безье: p0 → (к p1) → p2
        const a = (1 - p) * (1 - p);
        const b = 2 * p * (1 - p);
        const c = p * p;
        gsap.set(el, {
            x: a * p0.x + b * p1.x + c * p2.x - base.x,
            y: a * p0.y + b * p1.y + c * p2.y - base.y,
            scale: scale * Math.pow(1 - p, DEPTH_CURVE),
            // В самом конце растворяется, вторая — ещё и проявляется в начале
            opacity: Math.min(1, (1 - p) / 0.15, el === s2Img ? 1 : p / 0.08),
        });
    };
};

// Первая картинка стартует там, где закончила приближение: во весь экран
const recede1 = passBy(s2Img, s3Slot, (base) => ({
    scale: 1,
    center: { x: base.x, y: base.y - window.innerHeight * S2_LIFT },
}), BOW_X);
// Вторая — огромная, выплывает из-за левого края экрана и проходит
// тем же путём, что и первая: мимо её места в макете и дальше вглубь
const recede2 = passBy(s3Img2, s3Slot, () => ({
    scale: Math.max(window.innerWidth / s3Img2.offsetWidth, window.innerHeight / s3Img2.offsetHeight) * 1.1,
    center: { x: -vw(15), y: window.innerHeight * 0.45 },
}));

// Точка, в которой вторая картинка тает вдали, — туда мы как будто идём следом.
// Текст, мимо которого проходим, разлетается от этой точки и уплывает за край экрана
const vanishOrigin = (i, el) => {
    const v = centerOf(s3Slot);
    const box = offsetInS2(el);
    const x = v.x + vw(DRIFT_X) - box.left;
    const y = v.y + vw(DRIFT_Y) - box.top;
    return `${x}px ${y}px`;
};
// Во сколько раз вырастает текст, пока проплывает мимо
const PASS_SCALE = 5;

const s2Recede1 = { p: 0 };
const s2Recede2 = { p: 0 };
gsap.set(s3Img2, { opacity: 0 });

gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
        trigger: s2,
        start: 'top top',
        end: '+=925%',
        pin: true,
        scrub: SCRUB_LAG,
        invalidateOnRefresh: true,  // пересчитать смещение при ресайзе
    },
})
    // Приближение идёт туго, как будто против сопротивления: картинка сразу
    // начинает расти, но тяжело, без рывка в конце — и с усилием дотягивается до экрана
    .fromTo('.s2__img', { scale: 0.03 }, { scale: 1, duration: 1, ease: 'power2.inOut' }, 0)
    // Точка появляется правее и чуть выше центра и по мере приближения
    // встаёт на место — немного выше исходного положения
    .fromTo('.s2__img',
        { x: () => vw(22), y: () => -window.innerHeight * 0.12 },
        { x: 0, y: () => -window.innerHeight * S2_LIFT, duration: 1, ease: 'power2.inOut' }, 0)
    // Издалека картинка тонет в темноте и проясняется по мере приближения,
    // но не до конца — лёгкое затемнение остаётся
    .to('.s2__dark', { opacity: S2_DIM, duration: 0.6, ease: 'power1.out' }, 0)
    // Текст — только когда картинка встала во весь экран
    .fromTo('.s2__title', { autoAlpha: 0, y: () => vw(4) }, { autoAlpha: 1, y: 0, duration: 0.3 }, 1)
    // Небольшая пауза, чтобы заголовок постоял
    .to({}, { duration: 0.2 })

    // Листаем дальше: заголовок уходит, картинка очень медленно уходит вглубь
    // и становится обычного цвета
    .to('.s2__title', { autoAlpha: 0, y: () => -vw(4), duration: 0.3 }, 1.5)
    .to(s2Recede1, { p: 1, duration: 3, onUpdate: () => recede1(s2Recede1.p) }, 1.6)
    .to('.s2__dark', { opacity: 0, duration: 0.8 }, 1.6)
    // Пока она проходит мимо своего места, рядом быстро проявляется текст
    .fromTo(['.s3__title', '.s3__text--1'],
        { autoAlpha: 0, y: () => vw(3) },
        { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.08 }, 2.6)

    // Пока первая ещё тает вдали — выплывает вторая: так же большая, всё меньше и меньше
    .to(s2Recede2, { p: 1, duration: 3, onUpdate: () => recede2(s2Recede2.p) }, 4)
    // Заголовок остаётся, а текст под ним сменяется на второй
    .to('.s3__text--1', { autoAlpha: 0, y: () => -vw(2), duration: 0.2 }, 4.25)
    .fromTo('.s3__text--2',
        { autoAlpha: 0, y: () => vw(3) },
        { autoAlpha: 1, y: 0, duration: 0.25 }, 4.45)
    // Идём за второй картинкой вглубь — заголовок и текст не исчезают,
    // а растут и проплывают мимо нас за правый край экрана
    .fromTo(['.s3__title', '.s3__text--2'],
        { scale: 1, transformOrigin: vanishOrigin },
        { scale: PASS_SCALE, duration: 1.5, ease: 'power2.in' }, 5.3)
    .to({}, { duration: 0.2 });

// «Несправедливость»: появляется надпись, за ней выплывает спираль и встаёт
// как в макете. Дальше надпись уходит, а мы проходим в самый центр спирали —
// она крутится и растёт вокруг своей середины
const s4 = document.querySelector('.s4');
const spiral = s4.querySelector('.s4__spiral');

// Центр спирали (дырка в середине) на картинке, в долях её размера
const SPIRAL_CENTER_X = 0.534;
const SPIRAL_CENTER_Y = 0.615;
// Сколько градусов спираль проворачивается, пока мы идём к центру
// (минус — против часовой стрелки)
const SPIRAL_TURN = -420;
// Во сколько раз она вырастает — к концу дырка закрывает весь экран
const SPIRAL_ZOOM = 11;

// Сдвиг, который приводит центр спирали в центр экрана
const spiralShiftX = () =>
    window.innerWidth / 2 - (spiral.offsetLeft + spiral.offsetWidth * SPIRAL_CENTER_X);
const spiralShiftY = () =>
    window.innerHeight / 2 - (spiral.offsetTop + spiral.offsetHeight * SPIRAL_CENTER_Y);

// Крутится и растёт спираль вокруг своего центра
gsap.set(spiral, { transformOrigin: `${SPIRAL_CENTER_X * 100}% ${SPIRAL_CENTER_Y * 100}%` });

gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
        trigger: s4,
        start: 'top top',
        end: '+=620%',
        pin: true,
        scrub: SCRUB_LAG,
        invalidateOnRefresh: true,
    },
})
    // Надпись проявляется
    .fromTo('.s4__title', { autoAlpha: 0, y: () => vw(4) }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0)
    // За ней снизу, чуть повёрнутая и издалека, выплывает спираль и встаёт на место
    .fromTo(spiral,
        { autoAlpha: 0, y: () => window.innerHeight * 0.5, rotation: 15, scale: 0.8 },
        { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 1, ease: 'power2.out' }, 0.2)
    // Даём посмотреть
    .to({}, { duration: 0.3 })

    // Листаем дальше: надпись уходит
    .to('.s4__title', { autoAlpha: 0, y: () => -vw(4), duration: 0.4 }, 1.5)
    // а мы идём в центр спирали: она подтягивает середину к центру экрана,
    // проворачивается и растёт, пока дырка не закроет весь экран
    .to(spiral, { x: spiralShiftX, y: spiralShiftY, duration: 2.2, ease: 'power2.inOut' }, 1.6)
    .to(spiral, { rotation: SPIRAL_TURN, duration: 3.5, ease: 'power1.inOut' }, 1.6)
    .to(spiral, { scale: SPIRAL_ZOOM, duration: 3.5, ease: 'power3.in' }, 1.6)
    // Последние края витков растворяются — мы внутри, вокруг темнота
    .to(spiral, { autoAlpha: 0, duration: 0.3 }, 4.8)
    .to({}, { duration: 0.2 });

// «Иерархия рядов»: сначала левый текст, потом сверху вниз тексты рядов.
// Дальше ряды-картинки по очереди выезжают справа и смывают свой текст:
// край ряда стирает буквы, а то, что осталось, утаскивает влево и размывает
const s5 = document.querySelector('.s5');
const s5Rows = s5.querySelectorAll('.s5__row');
const s5Texts = s5.querySelectorAll('.s5__text');

// Насколько ряд утаскивает текст влево, пока смывает его, в vw
const WASH_DRIFT = 8;
// Насколько размывается текст к моменту, когда ряд его накрыл, в px
const WASH_BLUR = 6;

// Текст стирается ровно по краю ряда: всё, что правее края, уже смыто
const washText = (row, text) => {
    const rowLeft = row.getBoundingClientRect().left - s5.getBoundingClientRect().left;
    const left = text.offsetLeft;
    const width = text.offsetWidth;
    // Какая доля текста уже под рядом (0 — ещё не задет, 1 — весь смыт)
    const covered = gsap.utils.clamp(0, 1, (left + width - rowLeft) / width);
    const drift = -vw(WASH_DRIFT) * covered;
    // Видна только часть текста левее края ряда
    const hidden = gsap.utils.clamp(0, width, left + drift + width - rowLeft);
    gsap.set(text, {
        x: drift,
        clipPath: `inset(-20% ${hidden}px -20% 0)`,
        filter: `blur(${WASH_BLUR * covered}px)`,
        // и то, что ряд утащил с собой, растворяется
        opacity: 1 - covered,
    });
};

const s5Tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
        trigger: s5,
        start: 'top top',
        end: '+=760%',
        pin: true,
        scrub: SCRUB_LAG,
        invalidateOnRefresh: true,
    },
})
    // Левый заголовок и текст под ним
    .fromTo('.s5__title', { autoAlpha: 0, y: () => vw(4) }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0)
    .fromTo('.s5__lead', { autoAlpha: 0, y: () => vw(3) }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.15)
    // Тексты рядов — один за другим, сверху вниз
    .fromTo(s5Texts,
        { autoAlpha: 0, y: () => vw(3) },
        { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.3 }, 0.7)
    // Даём прочитать
    .to({}, { duration: 0.6 });

// Ряды выезжают из-за правого края по очереди, сверху вниз, и смывают тексты
s5Rows.forEach((row, i) => {
    s5Tl.fromTo(row,
        { x: () => window.innerWidth - row.offsetLeft },
        {
            x: 0,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => washText(row, s5Texts[i]),
        },
        2.2 + i * 0.7);
});
s5Tl.to({}, { duration: 0.3 });

// Листаем дальше: ряды целиком уезжают за левый край и смывают всё,
// что осталось, — заголовок и левый текст. Уходят вразнобой: каждый
// со своим запаздыванием, скоростью и разгоном
const s5Exit = [
    { at: 5.3,  duration: 1.6, ease: 'power2.in', washes: '.s5__title' },
    { at: 5.05, duration: 1.3, ease: 'power3.in', washes: '.s5__lead' },
    { at: 5.6,  duration: 1.9, ease: 'power1.in' },
];
s5Rows.forEach((row, i) => {
    const { at, duration, ease, washes } = s5Exit[i];
    const text = washes && s5.querySelector(washes);
    s5Tl.to(row, {
        x: () => -(row.offsetLeft + row.offsetWidth),
        duration,
        ease,
        onUpdate: text ? () => washText(row, text) : undefined,
    }, at);
});
s5Tl.to({}, { duration: 0.2 });

// Пересчитать позиции, когда загрузятся картинки
window.addEventListener('load', () => ScrollTrigger.refresh());
