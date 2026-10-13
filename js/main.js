gsap.registerPlugin(ScrollTrigger);

// Плавная инерционная прокрутка, синхронизированная с GSAP
const lenis = new Lenis({ lerp: 0.08 });
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
        scrub: 1,               // анимация «догоняет» прокрутку за 1 секунду
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

// Из темноты проявляется амфитеатр: мы как будто идём дальше, к нему
const s2 = document.querySelector('.s2');

gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
        trigger: s2,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: 1,
    },
})
    .fromTo('.s2__img', { scale: 0.6 }, { scale: 1, duration: 1, ease: 'power2.out' }, 0)
    .to('.s2__dark', { autoAlpha: 0, duration: 0.7, ease: 'power1.in' }, 0)
    .fromTo('.s2__title', { autoAlpha: 0, y: () => vw(4) }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.6);

// Пересчитать позиции, когда загрузятся картинки
window.addEventListener('load', () => ScrollTrigger.refresh());
