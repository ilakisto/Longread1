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

// Амфитеатр проявляется из темноты: стоит на своём месте и плавно светлеет
const s2 = document.querySelector('.s2');
// Насколько картинка поднята вверх (в долях высоты экрана)
const S2_LIFT = 0.1;
// Итоговое затемнение картинки: 0 — без затемнения, 1 — чёрный экран
const S2_DIM = 0.35;
// С какого размера картинки «Начала театра» начинают расти (1 — сразу в полный размер)
const APPEAR_SCALE = 0.85;

const s2Img = s2.querySelector('.s2__img');
// Место рядом с текстом, куда встаёт большая картинка (сама заглушка невидима)
const s3Slot = s2.querySelector('.s3__img--1');
const s3Img2 = s2.querySelector('.s3__img--2');
// Ширина размытых краёв, когда картинка встала на место, в vw (как у .s3__img)
const SLOT_FEATHER = 2.5;

// Масштабируем от левого верхнего угла — так проще попасть в место
gsap.set(s2Img, { transformOrigin: '0 0', y: () => -window.innerHeight * S2_LIFT });

// Во сколько раз картинка уменьшается, чтобы встать на место
const slotScale = () => s3Slot.offsetWidth / s2Img.offsetWidth;

// Картинка выходит из темноты и немного растёт
const appear = { autoAlpha: 0, scale: APPEAR_SCALE };
const appeared = { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power2.out' };

gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
        trigger: s2,
        start: 'top top',
        end: '+=650%',
        pin: true,
        scrub: SCRUB_LAG,
        invalidateOnRefresh: true,
    },
})
    // Амфитеатр уже стоит на месте и только светлеет из темноты,
    // лёгкое затемнение остаётся
    .fromTo('.s2__dark', { opacity: 1 }, { opacity: S2_DIM, duration: 1.2, ease: 'power1.out' }, 0)
    // Текст — когда картинка проявилась
    .fromTo('.s2__title', { autoAlpha: 0, y: () => vw(4) }, { autoAlpha: 1, y: 0, duration: 0.3 }, 1)
    // Небольшая пауза, чтобы заголовок постоял
    .to({}, { duration: 0.2 })

    // Листаем дальше: заголовок уходит, а амфитеатр уменьшается и встаёт
    // на своё место рядом с текстом — по пути светлеет и края размываются
    .to('.s2__title', { autoAlpha: 0, y: () => -vw(4), duration: 0.3 }, 1.5)
    .to(s2Img, {
        x: () => s3Slot.offsetLeft - s2Img.offsetLeft,
        y: () => s3Slot.offsetTop - s2Img.offsetTop,
        scale: slotScale,
        // Размытие задаётся в размере самой картинки, поэтому делим на масштаб
        '--feather': () => `${vw(SLOT_FEATHER) / slotScale()}px`,
        duration: 1.2,
        ease: 'power2.inOut',
    }, 1.7)
    .to('.s2__dark', { opacity: 0, duration: 1 }, 1.7)
    // Как только картинка начала уменьшаться, за ней уже проявляется текст
    .fromTo(['.s3__title', '.s3__text--1'],
        { autoAlpha: 0, y: () => vw(3) },
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, 1.8)

    // Первая картинка гаснет, на её месте из темноты выходит вторая.
    // Заголовок остаётся, а текст под ним сменяется
    .to([s2Img, '.s3__text--1'], { autoAlpha: 0, duration: 0.4 }, 4)
    .fromTo(s3Img2, appear, appeared, 4.3)
    .fromTo('.s3__text--2',
        { autoAlpha: 0, y: () => vw(3) },
        { autoAlpha: 1, y: 0, duration: 0.3 }, 4.6)

    // Всё уходит в темноту перед следующим экраном
    .to(['.s3__title', '.s3__text--2', s3Img2], { autoAlpha: 0, duration: 0.5 }, 5.8)
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
        end: '+=940%',
        pin: true,
        scrub: SCRUB_LAG,
        invalidateOnRefresh: true,
    },
})
    // Левый заголовок и текст под ним
    .fromTo('.s5__title', { autoAlpha: 0, y: () => vw(4) }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0)
    .fromTo('.s5__lead', { autoAlpha: 0, y: () => vw(3) }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.15);

// Дальше по очереди, сверху вниз: появляется текст ряда, его успевают
// прочитать — и выезжает ряд, который его смывает. Только потом следующий
const ROW_STEP = 1.8;       // от одного текста до следующего
const ROW_READ = 0.8;       // сколько текст стоит, прежде чем выедет ряд
s5Rows.forEach((row, i) => {
    const textAt = 0.7 + i * ROW_STEP;
    s5Tl
        .fromTo(s5Texts[i],
            { autoAlpha: 0, y: () => vw(3) },
            { autoAlpha: 1, y: 0, duration: 0.35 }, textAt)
        .fromTo(row,
            { x: () => window.innerWidth - row.offsetLeft },
            {
                x: 0,
                duration: 1.2,
                ease: 'power2.out',
                onUpdate: () => washText(row, s5Texts[i]),
            },
            textAt + ROW_READ);
});
s5Tl.to({}, { duration: 0.3 });

// Листаем дальше: ряды целиком уезжают за левый край и смывают всё,
// что осталось, — заголовок и левый текст. Уходят вразнобой: каждый
// со своим запаздыванием, скоростью и разгоном
const s5Exit = [
    { at: 7.1,  duration: 1.6, ease: 'power2.in', washes: '.s5__title' },
    { at: 6.85, duration: 1.3, ease: 'power3.in', washes: '.s5__lead' },
    { at: 7.4,  duration: 1.9, ease: 'power1.in' },
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
