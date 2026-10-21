gsap.registerPlugin(ScrollTrigger);

// Плавная инерционная прокрутка, синхронизированная с GSAP:
// страница едет чуть медленнее колеса и мягко «докатывается»
const SCROLL_WEIGHT = {
    lerp: 0.07,             // чем меньше, тем вязче и дольше докатывается
    wheelMultiplier: 0.85,  // доля прокрутки колёсиком/тачпадом (1 — обычная)
    touchMultiplier: 0.9,   // то же для пальца на телефоне
};
// Сколько секунд анимации «догоняют» прокрутку — добавляет лёгкое ощущение веса
const SCRUB_LAG = 1.2;

const lenis = new Lenis(SCROLL_WEIGHT);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const vw = (value) => (window.innerWidth / 100) * value;

// Закреплённый экран: пока он стоит, анимация идёт за прокруткой
// на протяжении length% высоты экрана и тяжело её «догоняет»
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

// Элемент проявляется, поднимаясь снизу на by vw
const rise = (by = 3) => ({ autoAlpha: 0, y: () => vw(by) });
const risen = { autoAlpha: 1, y: 0 };

// Запас в конце экрана: анимация догоняет прокрутку с задержкой,
// и без него погасшие элементы уезжали бы вверх ещё видимыми
const TAIL = 0.7;

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

// Сдвиг, который ставит рот в центр экрана (offset* не зависят от трансформаций)
const mouthShiftX = () =>
    window.innerWidth / 2 - (maskCenter.offsetLeft + maskCenter.offsetWidth * MOUTH_X);
const mouthShiftY = () =>
    window.innerHeight / 2 - (maskCenter.offsetTop + maskCenter.offsetHeight * MOUTH_Y);

// Масштаб, при котором рот перекрывает весь экран
const maxScale = () =>
    (Math.hypot(window.innerWidth, window.innerHeight) / (maskCenter.offsetWidth * MOUTH_WIDTH)) * 1.6;

const tl = scene(section, 300);

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

scene(s2, 650)
    // Амфитеатр уже стоит на месте и только светлеет из темноты,
    // лёгкое затемнение остаётся
    .fromTo('.s2__dark', { opacity: 1 }, { opacity: S2_DIM, duration: 1.2, ease: 'power1.out' }, 0)
    // Текст — когда картинка проявилась
    .fromTo('.s2__title', rise(4), { ...risen, duration: 0.3 }, 1)
    // Сюда ведёт ссылка из навигации: картинка проявилась, заголовок на месте
    .addLabel('title', 1.4)
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
        rise(),
        { ...risen, duration: 0.4, stagger: 0.08 }, 1.8)

    // Первая картинка гаснет, на её месте из темноты выходит вторая.
    // Заголовок остаётся, а текст под ним сменяется
    .to([s2Img, '.s3__text--1'], { autoAlpha: 0, duration: 0.4 }, 4)
    .fromTo(s3Img2, appear, appeared, 4.3)
    .fromTo('.s3__text--2',
        rise(),
        { ...risen, duration: 0.3 }, 4.6)

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

scene(s4, 620)
    // Надпись проявляется
    .fromTo('.s4__title', rise(4), { ...risen, duration: 0.4 }, 0)
    .addLabel('title', 1.3)
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

const s5Tl = scene(s5, 940)
    // Левый заголовок и текст под ним
    .fromTo('.s5__title', rise(4), { ...risen, duration: 0.4 }, 0)
    .fromTo('.s5__lead', rise(), { ...risen, duration: 0.4 }, 0.15);

// Дальше по очереди, сверху вниз: появляется текст ряда, его успевают
// прочитать — и выезжает ряд, который его смывает. Только потом следующий
const ROW_STEP = 1.8;       // от одного текста до следующего
const ROW_READ = 0.8;       // сколько текст стоит, прежде чем выедет ряд
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

// «Рост театра»: картинка проявляется из темноты, слегка увеличиваясь
// от центра, а заголовок и текст просто проявляются на своих местах.
// Дальше текст гаснет, а картинка растёт и темнеет, пока не исчезнет

// Во сколько раз вырастает картинка, пока уходит в темноту
const S6_ZOOM = 1.8;

scene('.s6', 450)
    .fromTo('.s6__img', appear, appeared, 0)
    .fromTo(['.s6__title', '.s6__text'],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, stagger: 0.1 }, 0.4)
    // Даём посмотреть
    .to({}, { duration: 0.6 })

    // Листаем дальше: заголовок и текст просто гаснут на месте,
    // а картинка растёт от центра и постепенно уходит в темноту
    .to(['.s6__title', '.s6__text'], { autoAlpha: 0, duration: 0.4 }, 1.6)
    .to('.s6__img', { scale: S6_ZOOM, duration: 2, ease: 'power1.in' }, 1.6)
    .fromTo('.s6__img', { filter: 'brightness(1)' }, { filter: 'brightness(0)', duration: 2 }, 1.6)
    .to('.s6__img', { autoAlpha: 0, duration: 0.2 }, 3.4)
    .to({}, { duration: 0.2 });

// Надпись по центру экрана проявляется на месте, стоит и плавно гаснет там же
const quote = (selector) => {
    const text = document.querySelector(`${selector} .quote`);
    scene(selector, 350)
        .fromTo(text, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .to({}, { duration: 0.5 })
        .to(text, { autoAlpha: 0, duration: 0.8, ease: 'power1.inOut' })
        .to({}, { duration: TAIL });
};

// Картинка с текстом, как в «Начале театра»: первая картинка выходит из темноты,
// заголовок и текст проявляются. Каждые следующие картинка и текст сменяют
// предыдущие на том же месте, заголовок остаётся. В конце всё уходит в темноту
const SWAP = 2.2;           // шаг между сменами картинок
const duo = (selector, length) => {
    const box = document.querySelector(selector);
    const title = box.querySelector('.title');
    const photos = box.querySelectorAll('.photo');
    const texts = box.querySelectorAll('.text');
    const last = photos.length - 1;

    const tl = scene(box, length)
        .fromTo(photos[0], appear, appeared, 0)
        .fromTo([title, texts[0]], rise(), { ...risen, duration: 0.4, stagger: 0.08 }, 0.3);

    for (let i = 1; i <= last; i++) {
        const at = 2 + (i - 1) * SWAP;
        tl.to([photos[i - 1], texts[i - 1]], { autoAlpha: 0, duration: 0.4 }, at)
            .fromTo(photos[i], appear, appeared, at + 0.3)
            .fromTo(texts[i], rise(), { ...risen, duration: 0.3 }, at + 0.6);
    }

    tl.to([title, texts[last], photos[last]],
        { autoAlpha: 0, duration: 0.6, ease: 'power1.inOut' }, (last + 1) * SWAP - 0.2)
        .to({}, { duration: TAIL });
};

// Экраны создаются строго по порядку на странице — иначе закрепления
// неверно посчитают свои позиции

quote('.s7');

// «XVII век нашей эры»: как амфитеатр — картинка стоит на месте и светлеет
// из темноты, лёгкое затемнение остаётся, потом проявляется заголовок.
// Дальше заголовок уходит вверх, а картинка — в темноту
scene('.s8', 250)
    .fromTo('.s8__dark', { opacity: 1 }, { opacity: S2_DIM, duration: 1.2, ease: 'power1.out' }, 0)
    .fromTo('.s8__title', rise(4), { ...risen, duration: 0.3 }, 1)
    .addLabel('title', 1.5)
    .to('.s8__title', { autoAlpha: 0, y: () => -vw(4), duration: 0.3 }, 1.7)
    .to('.s8__dark', { opacity: 1, duration: 0.8 }, 1.8)
    .to({}, { duration: 0.2 });

duo('.s9', 560);

// «От сцены к царской ложе»: заголовок и картинка проявляются из темноты.
// Листаем дальше — заголовок гаснет, картинка встаёт по центру экрана
// и, не останавливаясь, уезжает влево целиком, за край экрана
const s10Img = document.querySelector('.s10__img');

scene('.s10', 650)
    .fromTo('.s10__title', rise(), { ...risen, duration: 0.5, ease: 'power1.out' }, 0.2)
    .fromTo(s10Img, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, 0.3)
    .addLabel('title', 0.95)
    .to('.s10__title', { autoAlpha: 0, duration: 0.5 }, 1.1)
    .to(s10Img, {
        y: () => (window.innerHeight - s10Img.offsetHeight) / 2 - s10Img.offsetTop,
        duration: 0.8,
        ease: 'power2.inOut',
    }, 1.1)
    // Ещё не встав на место, начинает плавно разгоняться влево
    .to(s10Img, { x: () => -s10Img.offsetWidth, duration: 4, ease: 'sine.in' }, 1.5)
    .to({}, { duration: 0.5 });

duo('.s11', 560);
quote('.s12');
duo('.s13', 350);

// Последняя надпись не гаснет: снизу выезжает конец страницы и чуть
// приподнимает её — надпись встаёт по центру оставшегося над ним места
const end = document.querySelector('.end');

scene('.s14', 200)
    .fromTo('.s14 .quote', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
    .to({}, { duration: 0.3 })
    .fromTo(end, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'power2.out' })
    .to('.s14 .quote', { y: () => -end.offsetHeight / 2, duration: 0.8, ease: 'power2.out' }, '<')
    .to({}, { duration: 0.2 });

// Ссылки навигации: сразу переносят к разделу, в момент, когда виден его
// заголовок (метка 'title'), и без «догоняния» — иначе по пути на экране
// прокручивалась бы назад вся анимация раздела
document.querySelectorAll('.end a').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(link.hash);
    const st = ScrollTrigger.getAll().find((t) => t.trigger === target);
    lenis.scrollTo(st.labelToScroll('title'), { immediate: true, force: true });
    ScrollTrigger.update();
    ScrollTrigger.getAll().forEach((t) => t.getTween()?.progress(1));
}));

// Пересчитать позиции, когда загрузятся картинки
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    // Огромную картинку лож разжимаем заранее, а не в момент её появления —
    // иначе на переходе к ней прокрутка запинается
    s10Img.decode().catch(() => {});
});
