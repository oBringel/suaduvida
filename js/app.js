/* ==========================================================================
   app.js — ponto de entrada.

   Ordem do que acontece aqui:
   1. lê o products.json
   2. monta destaque, categorias, vitrines, editorial e rodapé
   3. liga carrossel, modal, links de afiliado e menu

   Para adicionar produtos você NÃO precisa tocar neste arquivo:
   tudo vem de data/products.json.
   ========================================================================== */

import { $, aoOcioso } from './utils.js';
import { loadProducts } from './data.js';
import {
  renderCategories,
  renderShelves,
  renderFeatured,
  renderEditorial,
  renderFooterCategories
} from './products.js';
import { initializeCarousels } from './carousel.js';
import { initModal } from './modal.js';
import { initAffiliateLinks } from './affiliate.js';
import { initNav, initHeaderScroll, initReveal } from './nav.js';

// Marca que o JavaScript está ativo (o CSS usa isso para animar a entrada
// das seções apenas quando há JS — sem JS, o conteúdo já nasce visível).
document.documentElement.classList.add('js');

async function iniciar() {
  // O que não depende do catálogo pode ligar imediatamente.
  initNav();
  initHeaderScroll();
  initAffiliateLinks();

  try {
    const catalogo = await loadProducts();

    renderFeatured(catalogo);
    renderCategories(catalogo);
    renderShelves(catalogo);
    renderEditorial(catalogo);
    renderFooterCategories(catalogo);

    initializeCarousels();
    initModal(catalogo);
    initReveal();

    // Sinaliza para o script de emergência do index.html que deu tudo certo.
    document.body.dataset.appReady = 'true';

    aoOcioso(() => {
      console.info(
        `[suaduvida] ${catalogo.todosProdutos().length} produtos em ${catalogo.categorias.length} categorias.`
      );
    });
  } catch (erro) {
    mostrarFalha(erro);
  }
}

/** Tela de erro legível quando o catálogo não pôde ser lido. */
function mostrarFalha(erro) {
  console.error('[suaduvida] Falha ao carregar o catálogo:', erro);
  const caixa = $('[data-boot-error]');
  const mensagem = $('[data-boot-error-msg]');
  if (!caixa) return;
  if (mensagem) mensagem.textContent = erro.message;
  caixa.hidden = false;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
