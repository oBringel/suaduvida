/* ==========================================================================
   modal.js — janela de detalhes do produto.

   Abre em "Ver detalhes", fecha no X, no ESC e no clique fora.
   O vídeo do YouTube NÃO é carregado junto com a página: mostramos só a
   miniatura e o iframe nasce quando a pessoa clica no play. Com 20 ou 30
   produtos na página, isso é a diferença entre um site leve e um travado.
   ========================================================================== */

import { $, $$, escapeHtml, icone } from './utils.js';
import { botaoAfiliado } from './products.js';

let catalogoAtual = null;
let elementoAnterior = null;
let overflowAnterior = '';

const modal = () => $('[data-modal]');

/* ---------------------------- Blocos do conteúdo ------------------------- */

function blocoGaleria(p) {
  const imagens = [p.imagem, ...p.galeria].filter(Boolean);
  const miniaturas = imagens.length > 1
    ? `<div class="modal-thumbs" role="group" aria-label="Outras imagens do produto">
        ${imagens.map((src, i) => `
          <button type="button" data-troca-imagem="${escapeHtml(src)}"
                  ${i === 0 ? 'aria-current="true"' : ''}
                  aria-label="Ver imagem ${i + 1} de ${imagens.length}">
            <img src="${escapeHtml(src)}" alt="" loading="lazy">
          </button>`).join('')}
      </div>`
    : '';

  return `
  <div class="modal-media">
    <img src="${escapeHtml(p.imagem)}" alt="${escapeHtml(p.imagemAlt)}"
         width="1200" height="1200" data-imagem-principal>
    ${miniaturas}
  </div>`;
}

function blocoVideo(p) {
  if (!p.videoId) {
    return `<div class="modal-block">
      <h3>Vídeo</h3>
      <p class="video-empty">
        Nenhum vídeo cadastrado. Preencha o campo <strong>videoId</strong> deste produto
        no products.json para exibir o vídeo aqui.
      </p>
    </div>`;
  }

  const capa = `https://img.youtube.com/vi/${encodeURIComponent(p.videoId)}/hqdefault.jpg`;
  return `<div class="modal-block">
    <h3>Vídeo</h3>
    <button class="video-facade" type="button"
            data-carregar-video="${escapeHtml(p.videoId)}"
            style="background-image:url('${escapeHtml(capa)}')"
            aria-label="Carregar e reproduzir o vídeo de ${escapeHtml(p.nome)}">
      <span class="video-facade-play" aria-hidden="true">${icone('play')}</span>
      <span class="video-facade-label">Carregar vídeo</span>
    </button>
  </div>`;
}

/** Elemento-assinatura do site: o veredito em duas colunas. */
function blocoVeredito(p) {
  const temAlgo = p.paraQuem || p.naoParaQuem || p.pros.length || p.contras.length;
  if (!temAlgo) return '';

  const lista = (itens) => itens.length
    ? `<ul>${itens.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>` : '';

  return `
  <div class="modal-block">
    <h3>Vale a pena?</h3>
    <div class="verdict">
      <div class="verdict-card verdict-go">
        <h4>Faz sentido se…</h4>
        ${p.paraQuem ? `<p>${escapeHtml(p.paraQuem)}</p>` : ''}
        ${lista(p.pros)}
      </div>
      <div class="verdict-card verdict-wait">
        <h4>Pense duas vezes se…</h4>
        ${p.naoParaQuem ? `<p>${escapeHtml(p.naoParaQuem)}</p>` : ''}
        ${lista(p.contras)}
      </div>
    </div>
  </div>`;
}

function conteudoDoModal(p) {
  return `
  <div class="modal-grid">
    ${blocoGaleria(p)}

    <div class="modal-content">
      <span class="tag">${escapeHtml(p.categoriaNome)}</span>
      <h2 id="modal-titulo">
        ${escapeHtml(p.nome)}${p.variante ? ` · ${escapeHtml(p.variante)}` : ''}
      </h2>
      ${p.descricao ? `<p class="modal-lead">${escapeHtml(p.descricao)}</p>` : ''}

      ${p.preco ? `<p class="modal-price">
        <strong>${escapeHtml(p.preco)}</strong>
        ${p.precoAntigo ? `<s>${escapeHtml(p.precoAntigo)}</s>` : ''}
        ${p.loja ? `<em>${escapeHtml(p.loja)}</em>` : ''}
      </p>` : ''}
      ${p.precoNota ? `<p class="product-pricenote">${escapeHtml(p.precoNota)}</p>` : ''}

      ${p.destaques.length ? `<div class="modal-block">
        <h3>Características</h3>
        <ul class="spec-list">${p.destaques.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>
      </div>` : ''}

      ${blocoVideo(p)}
      ${blocoVeredito(p)}

      ${p.dica ? `<div class="modal-tip">
        <span class="modal-tip-mark" aria-hidden="true">?</span>
        <div><strong>A dica que resolve a dúvida</strong><p>${escapeHtml(p.dica)}</p></div>
      </div>` : ''}

      <div class="modal-cta">
        ${botaoAfiliado(p, 'Ver produto na loja')}
        <small>Você sai do suaduvida e vai para a página do lojista. Link de afiliado.</small>
      </div>
    </div>
  </div>`;
}

/* ------------------------------ Abrir e fechar --------------------------- */

export function openProductModal(id) {
  const p = catalogoAtual?.produto(id);
  const caixa = modal();
  if (!p || !caixa) return;

  elementoAnterior = document.activeElement;
  $('[data-modal-body]', caixa).innerHTML = conteudoDoModal(p);
  caixa.hidden = false;

  overflowAnterior = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const dialogo = $('[data-modal-dialog]', caixa);
  dialogo.scrollTop = 0;
  dialogo.focus();
}

export function closeProductModal() {
  const caixa = modal();
  if (!caixa || caixa.hidden) return;

  caixa.hidden = true;
  // Zera o conteúdo para descarregar qualquer iframe de vídeo que tenha sido criado.
  $('[data-modal-body]', caixa).innerHTML = '';
  document.body.style.overflow = overflowAnterior;
  elementoAnterior?.focus?.();
}

/** Mantém o foco do teclado dentro do modal enquanto ele estiver aberto. */
function prenderFoco(evento) {
  const caixa = modal();
  if (!caixa || caixa.hidden || evento.key !== 'Tab') return;

  const focaveis = $$(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    caixa
  ).filter((el) => el.offsetParent !== null || el.hasAttribute('data-modal-dialog'));

  if (!focaveis.length) return;
  const primeiro = focaveis[0];
  const ultimo = focaveis[focaveis.length - 1];

  if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault(); ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault(); primeiro.focus();
  }
}

/* ------------------------------ Inicialização ---------------------------- */

export function initModal(catalogo) {
  catalogoAtual = catalogo;
  const caixa = modal();
  if (!caixa) return;

  // Abre a partir de qualquer botão "Ver detalhes" da página (delegação).
  document.addEventListener('click', (evento) => {
    const gatilho = evento.target.closest('[data-open-product]');
    if (gatilho) openProductModal(gatilho.dataset.openProduct);
  });

  caixa.addEventListener('click', (evento) => {
    // Fechar (X ou fundo)
    if (evento.target.closest('[data-modal-close]')) { closeProductModal(); return; }

    // Trocar a imagem principal pela miniatura clicada
    const miniatura = evento.target.closest('[data-troca-imagem]');
    if (miniatura) {
      $('[data-imagem-principal]', caixa).src = miniatura.dataset.trocaImagem;
      $$('[data-troca-imagem]', caixa).forEach((b) => b.removeAttribute('aria-current'));
      miniatura.setAttribute('aria-current', 'true');
      return;
    }

    // Criar o iframe do YouTube só agora, no clique
    const play = evento.target.closest('[data-carregar-video]');
    if (play) {
      const id = encodeURIComponent(play.dataset.carregarVideo);
      const moldura = document.createElement('div');
      moldura.className = 'video-frame';
      moldura.innerHTML = `<iframe
        src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0"
        title="Vídeo de demonstração do produto"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowfullscreen></iframe>`;
      play.replaceWith(moldura);
    }
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') closeProductModal();
    prenderFoco(evento);
  });
}
