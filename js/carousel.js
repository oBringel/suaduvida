/* ==========================================================================
   carousel.js — carrossel em JavaScript puro.

   Por que sem biblioteca: a rolagem horizontal nativa do navegador já entrega
   swipe no celular, inércia e acessibilidade de graça. O CSS cuida do encaixe
   (scroll-snap) e da quantidade de cards por tela (variável --per no style.css).
   Aqui ficam só os botões, os indicadores e o teclado.
   ========================================================================== */

import { $$, debounce } from './utils.js';

const semAnimacao = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/** Inicializa todos os carrosséis presentes no escopo informado. */
export function initializeCarousels(escopo = document) {
  $$('[data-carousel]', escopo).forEach(configurar);
}

function configurar(raiz) {
  const trilho = raiz.querySelector('[data-carousel-track]');
  if (!trilho || trilho.dataset.carouselReady) return;
  trilho.dataset.carouselReady = 'true';

  const btnAnterior = raiz.querySelector('[data-carousel-prev]');
  const btnProximo = raiz.querySelector('[data-carousel-next]');
  const navegacao = raiz.querySelector('.carousel-nav');
  const pontos = raiz.querySelector('[data-carousel-dots]');

  /** Largura de um card + o espaçamento entre eles. */
  function larguraDoPasso() {
    const card = trilho.firstElementChild;
    if (!card) return trilho.clientWidth || 1;
    const estilo = getComputedStyle(trilho);
    const espaco = parseFloat(estilo.columnGap || estilo.gap || '0') || 0;
    return card.getBoundingClientRect().width + espaco;
  }

  /** Quanto rolar por clique: uma "tela cheia" de cards, sem cortar nenhum. */
  function larguraDaPagina() {
    const passo = larguraDoPasso();
    const cabem = Math.max(1, Math.floor(trilho.clientWidth / passo));
    return passo * cabem;
  }

  function mover(direcao) {
    trilho.scrollBy({
      left: direcao * larguraDaPagina(),
      behavior: semAnimacao() ? 'auto' : 'smooth'
    });
  }

  function irParaPagina(indice) {
    trilho.scrollTo({
      left: indice * larguraDaPagina(),
      behavior: semAnimacao() ? 'auto' : 'smooth'
    });
  }

  /** Recalcula botões e indicadores conforme a posição da rolagem. */
  function atualizar() {
    const rolagemMaxima = trilho.scrollWidth - trilho.clientWidth;
    const temRolagem = rolagemMaxima > 4;

    if (navegacao) navegacao.hidden = !temRolagem;
    if (btnAnterior) btnAnterior.disabled = trilho.scrollLeft <= 4;
    if (btnProximo) btnProximo.disabled = trilho.scrollLeft >= rolagemMaxima - 4;

    if (!pontos) return;
    if (!temRolagem) { pontos.innerHTML = ''; pontos.hidden = true; return; }

    const totalPaginas = Math.ceil(rolagemMaxima / larguraDaPagina()) + 1;
    const paginaAtual = Math.min(
      totalPaginas - 1,
      Math.round(trilho.scrollLeft / larguraDaPagina())
    );

    pontos.hidden = false;
    if (pontos.children.length !== totalPaginas) {
      pontos.innerHTML = Array.from({ length: totalPaginas }, (_, i) =>
        `<button type="button" data-pagina="${i}" aria-label="Ir para a página ${i + 1} de ${totalPaginas}"></button>`
      ).join('');
    }
    Array.from(pontos.children).forEach((ponto, i) => {
      if (i === paginaAtual) ponto.setAttribute('aria-current', 'true');
      else ponto.removeAttribute('aria-current');
    });
  }

  /* --------------------------- Eventos --------------------------------- */
  btnAnterior?.addEventListener('click', () => mover(-1));
  btnProximo?.addEventListener('click', () => mover(1));

  pontos?.addEventListener('click', (evento) => {
    const alvo = evento.target.closest('[data-pagina]');
    if (alvo) irParaPagina(Number(alvo.dataset.pagina));
  });

  // Teclado: setas navegam, Home/End vão para as pontas.
  trilho.addEventListener('keydown', (evento) => {
    const acoes = {
      ArrowRight: () => mover(1),
      ArrowLeft: () => mover(-1),
      Home: () => irParaPagina(0),
      End: () => trilho.scrollTo({ left: trilho.scrollWidth, behavior: 'smooth' })
    };
    if (acoes[evento.key]) { evento.preventDefault(); acoes[evento.key](); }
  });

  trilho.addEventListener('scroll', () => {
    window.requestAnimationFrame(atualizar);
  }, { passive: true });

  window.addEventListener('resize', debounce(atualizar, 180));

  // Imagens que carregam depois mudam a largura do trilho.
  window.addEventListener('load', atualizar);
  atualizar();
}
