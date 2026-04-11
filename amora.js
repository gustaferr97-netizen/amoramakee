// ── Header scroll ──
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
        header.style.padding = '12px 6%';
    } else {
        header.style.boxShadow = 'none';
        header.style.padding = '24px 6%';
    }

    // barra de progresso
    const doc = document.documentElement;
    const scrolled = doc.scrollTop || document.body.scrollTop;
    const total = doc.scrollHeight - doc.clientHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    document.getElementById('scrollProgress').style.width = pct + '%';
});

// ── Animação de letras nos títulos ──
function splitTitle(el) {
    const text = el.textContent.trim();
    el.textContent = '';
    el.style.perspective = '600px';

    [...text].forEach((char, i) => {
        const span = document.createElement('span');
        if (char === ' ') {
            span.className = 'char space';
        } else {
            span.className = 'char';
            span.textContent = char;
            // alterna esquerda/direita
            span.dataset.side = i % 2 === 0 ? 'left' : 'right';
        }
        el.appendChild(span);
    });
}

const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const chars = entry.target.querySelectorAll('.char[data-side]');
        chars.forEach((char, i) => {
            const side = char.dataset.side;
            setTimeout(() => {
                char.classList.add(side === 'left' ? 'animate-left' : 'animate-right');
            }, i * 60);
        });
        titleObserver.unobserve(entry.target);
    });
}, { threshold: 0.3 });

document.querySelectorAll('.section-title').forEach(el => {
    splitTitle(el);
    titleObserver.observe(el);
});

// ── Reveal ao scroll (Intersection Observer) ──
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.section-title, .section-label').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

document.querySelectorAll('.info-block').forEach(el => revealObserver.observe(el));

document.querySelectorAll('.oferta-header, .tabs-nav').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    mainNav.classList.toggle('open');
});

// fecha o menu ao clicar em um link
mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        navToggle.classList.remove('open');
        mainNav.classList.remove('open');
    });
});

// ── Abas ──
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById('tab-' + target).classList.add('active');

        // reinicia o carrossel da aba ativada
        const panel = document.getElementById('tab-' + target);
        const instance = panel._carousel;
        if (instance) instance.setup();
    });
});

// ── Carrossel (instância por painel) ──
function initCarousel(panel) {
    const track = panel.querySelector('.carousel-track');
    const container = panel.querySelector('.carousel-track-container');
    const dotsContainer = panel.querySelector('.carousel-dots');
    const cards = panel.querySelectorAll('.carousel-track .product-card');
    const prevBtn = panel.querySelector('.carousel-btn.prev');
    const nextBtn = panel.querySelector('.carousel-btn.next');

    let current = 0;
    let cardWidth = 0;
    let visible = 1;
    let timer = null;

    function getVisible() {
        const w = container.offsetWidth;
        if (w >= 1100) return 4;
        if (w >= 800) return 3;
        if (w >= 520) return 2;
        return 1;
    }

    function getGap() {
        return window.innerWidth <= 640 ? 12 : 20;
    }

    function buildDots() {
        dotsContainer.innerHTML = '';
        const total = cards.length - visible + 1;
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === current ? ' active' : '');
            dot.setAttribute('aria-label', 'Slide ' + (i + 1));
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function goTo(index) {
        const gap = getGap();
        const max = cards.length - visible;
        current = Math.max(0, Math.min(index, max));
        track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
        updateDots();
    }

    function startAutoplay() {
        clearInterval(timer);
        timer = setInterval(() => {
            goTo(current + 1 > cards.length - visible ? 0 : current + 1);
        }, 4000);
    }

    function setup() {
        const gap = getGap();
        visible = getVisible();
        track.style.gap = gap + 'px';
        cardWidth = (container.offsetWidth - gap * (visible - 1)) / visible;
        cards.forEach(c => (c.style.minWidth = cardWidth + 'px'));
        current = Math.min(current, Math.max(0, cards.length - visible));
        buildDots();
        goTo(current);
        startAutoplay();
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });

    window.addEventListener('resize', setup);
    setup();

    // expõe para reinicialização via aba
    panel._carousel = { setup };
}

// inicia carrosséis das abas
document.querySelectorAll('.tab-panel').forEach(initCarousel);

// inicia carrosséis das ofertas
document.querySelectorAll('.oferta-bloco').forEach(initCarousel);

// ── Carrinho ──
const cart = [];

function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
}

document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);

function getPrice(card) {
    // pega preço promocional se existir, senão preço normal
    const oferta = card.querySelector('.price-oferta');
    const normal = card.querySelector('.price:not(.price-oferta)');
    const raw = (oferta || normal).textContent.replace('R$', '').replace(',', '.').trim();
    return parseFloat(raw);
}

function getImg(card) {
    const img = card.querySelector('.product-img');
    const style = img ? img.getAttribute('style') : '';
    const match = style.match(/url\('([^']+)'\)/);
    return match ? match[1] : '';
}

function renderCart() {
    const itemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const countEl = document.getElementById('cartCount');
    const btnCheckout = document.getElementById('btnCheckout');

    if (cart.length === 0) {
        itemsEl.innerHTML = '<p class="cart-empty">Nenhum item adicionado ainda.</p>';
        totalEl.textContent = 'R$ 0,00';
        countEl.textContent = '0';
        btnCheckout.disabled = true;
        return;
    }

    btnCheckout.disabled = false;
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    countEl.textContent = totalQty;
    totalEl.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');

    itemsEl.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
            <div class="cart-item-img" style="background-image:url('${item.img}')"></div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                <div class="cart-item-qty">
                    <button onclick="changeQty(${idx}, -1)">−</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${idx}, 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeItem(${idx})">✕</button>
        </div>
    `).join('');
}

function changeQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    renderCart();
}

function removeItem(idx) {
    cart.splice(idx, 1);
    renderCart();
}

function addToCart(card) {
    const name = card.querySelector('h3').textContent;
    const price = getPrice(card);
    const img = getImg(card);
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, img, qty: 1 });
    }
    renderCart();
    openCart();
}

// delega cliques em todos os botões "Comprar"
document.addEventListener('click', function (e) {
    if (e.target.tagName === 'BUTTON' && e.target.textContent.trim() === 'Comprar') {
        const card = e.target.closest('.product-card');
        if (card) addToCart(card);
    }
});

// ── Finalizar Compra → WhatsApp ──
document.getElementById('btnCheckout').addEventListener('click', function () {
    if (cart.length === 0) return;

    // ⚠️ Substitua pelo número do WhatsApp da loja (com código do país, sem + ou espaços)
    const numero = '559884834689';

    const itens = cart.map(i =>
        `• ${i.name} x${i.qty} — R$ ${(i.price * i.qty).toFixed(2).replace('.', ',')}`
    ).join('\n');

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const mensagem =
        `Olá! Gostaria de fazer um pedido 🛍️\n\n` +
        `*Itens selecionados:*\n${itens}\n\n` +
        `*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\n` +
        `Poderia me ajudar com a finalização?`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
});

renderCart();
