/* ==========================================================================
   affiliate.js — cliques nos links comerciais.

   Todo botão que leva à loja tem: target="_blank" e rel="nofollow sponsored
   noopener". O href vem exclusivamente do campo affiliateUrl do products.json.

   Este arquivo faz duas coisas:
   1) Impede um clique "no vazio" enquanto o link ainda não foi configurado.
   2) Deixa um ponto único para plugar métricas (Analytics, Pixel etc.).
   ========================================================================== */

import { aviso } from './utils.js';

/**
 * handleAffiliateClick
 * Chamado em qualquer clique dentro da página; só age em links de afiliado.
 */
export function handleAffiliateClick(evento) {
  const link = evento.target.closest('[data-affiliate]');
  if (!link) return;

  // Link ainda não preenchido no JSON: avisa em vez de abrir uma aba vazia.
  if (link.hasAttribute('data-affiliate-unset')) {
    evento.preventDefault();
    aviso('Link de afiliado ainda não configurado. Edite o campo "affiliateUrl" no products.json.');
    return;
  }

  registrarClique(link.dataset.productId, link.href);
}

/**
 * Ponto de integração com métricas.
 * Exemplo com Google Analytics 4 (descomente depois de instalar a tag):
 *
 *   window.gtag?.('event', 'select_item', {
 *     item_id: produtoId,
 *     link_url: url
 *   });
 */
function registrarClique(produtoId, url) {
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: 'clique_afiliado', produto: produtoId, url });
  }
}

/** Liga o tratamento uma única vez, por delegação de eventos. */
export function initAffiliateLinks() {
  document.addEventListener('click', handleAffiliateClick);
}
