/* ==========================================================================
   products.js — transforma os dados do JSON em HTML.

   Nenhum produto está escrito no index.html: tudo o que aparece nas vitrines,
   nas categorias e no destaque nasce aqui, a partir do products.json.
   ========================================================================== */

import { $, escapeHtml, icone } from './utils.js';

/* ----------------------------- Peças reutilizáveis ----------------------- */

/** Estrela + nota. A nota é editorial (curadoria), não média de compradores. */
function selo(nota) {
  if (nota == null) return '';
  return `<span class="product-rating" title="Nota da curadoria suaduvida">
    ${icone('star')}${escapeHtml(nota.toFixed(1))}
    <span class="sr-only">de nota na curadoria</span>
  </span>`;
}

/** Bloco de preço. Se não houver preço no JSON, some por completo. */
function preco(p, classe = 'product-price') {
  if (!p.preco) return '';
  return `<p class="${classe}">
    <strong>${escapeHtml(p.preco)}</strong>
    ${p.precoAntigo ? `<s>${escapeHtml(p.precoAntigo)}</s>` : ''}
  </p>`;
}

/**
 * Botão de afiliado.
 * O href sai direto do JSON. Enquanto o link não for configurado, o clique é
 * interceptado por affiliate.js e vira um aviso — nunca uma navegação quebrada.
 */
export function botaoAfiliado(p, rotulo = 'Ver produto', classes = 'btn btn-go') {
  return `<a class="${classes}"
     href="${escapeHtml(p.link || '#')}"
     target="_blank"
     rel="nofollow sponsored noopener"
     data-affiliate
     data-product-id="${escapeHtml(p.id)}"
     ${p.linkPendente ? 'data-affiliate-unset="true"' : ''}>
     ${escapeHtml(rotulo)} 
   </a>`;
   //${icone('external')
}

/* ------------------------------ createProductCard ------------------------ */
/**
 * Monta o card de um produto.
 * Para mudar o visual do card, edite este HTML e as classes .product-* no CSS.
 */
export function createProductCard(p) {
  return `
  <article class="product-card" data-reveal>
    <div class="product-media">
      ${p.precoAntigo ? '<span class="product-flag product-flag-go">Oferta</span>' : ''}
      <img src="${escapeHtml(p.imagem)}" alt="${escapeHtml(p.imagemAlt)}"
           loading="lazy" decoding="async" width="1200" height="1200">
    </div>

    <div class="product-body">
      <div class="product-top">
        <span class="tag">${escapeHtml(p.categoriaNome)}</span>
        ${selo(p.nota)}
      </div>

      <h3>
        ${escapeHtml(p.nome)}
        ${p.variante ? `<span class="product-variant">· ${escapeHtml(p.variante)}</span>` : ''}
      </h3>

      <p class="product-desc">${escapeHtml(p.resumo)}</p>

      ${preco(p)}
      ${p.precoNota ? `<p class="product-pricenote">${escapeHtml(p.precoNota)}</p>` : ''}

      <div class="product-actions">
        <button class="btn btn-outline btn-block" type="button" data-open-product="${escapeHtml(p.id)}">
          Ver detalhes
        </button>
        ${botaoAfiliado(p, 'Ver na loja', 'btn btn-go btn-block')}
      </div>
    </div>
  </article>`;
}

/* ------------------------------ renderCategories ------------------------- */
/** Grade de categorias. Cada card leva para a vitrine correspondente. */
export function renderCategories(catalogo, alvo = $('[data-categories]')) {
  if (!alvo) return;

  alvo.innerHTML = catalogo.categorias.map((c) => {
    const miniaturas = c.produtos.slice(0, 3).map((p) =>
      `<img src="${escapeHtml(p.imagem)}" alt="" loading="lazy" width="46" height="46">`
    ).join('');

    return `
    <li data-reveal>
      <a class="category-card" href="#vitrine-${escapeHtml(c.id)}">
        <span class="category-icon" aria-hidden="true">${icone(c.icone)}</span>
        <h3>${escapeHtml(c.nome)}</h3>
        <p>${escapeHtml(c.descricao)}</p>
        <div class="category-thumbs" aria-hidden="true">${miniaturas}</div>
        <div class="category-foot">
          <span>${c.produtos.length} ${c.produtos.length === 1 ? 'produto' : 'produtos'}</span>
          <span>Ver vitrine →</span>
        </div>
      </a>
    </li>`;
  }).join('');
}

/* --------------------------- renderProductCarousel ----------------------- */
/**
 * Uma categoria do JSON vira uma <section> completa com carrossel.
 * Adicionar uma categoria nova no JSON cria automaticamente uma vitrine nova.
 */
export function renderProductCarousel(categoria, indice = 0) {
  const idTitulo = `vitrine-${categoria.id}-titulo`;

  return `
  <section class="shelf ${indice % 2 === 1 ? 'shelf-alt' : ''}"
           id="vitrine-${escapeHtml(categoria.id)}"
           aria-labelledby="${idTitulo}"
           data-carousel>
    <div class="container">
      <header class="shelf-head">
        <div>
          <p class="eyebrow">${escapeHtml(categoria.nome)}</p>
          <h2 id="${idTitulo}">${escapeHtml(categoria.tituloVitrine)}</h2>
          ${categoria.descricao ? `<p>${escapeHtml(categoria.descricao)}</p>` : ''}
        </div>

        <div class="carousel-nav">
          <button class="carousel-btn" type="button" data-carousel-prev
                  aria-label="Ver produtos anteriores de ${escapeHtml(categoria.nome)}">
            ${icone('arrowLeft')}
          </button>
          <button class="carousel-btn" type="button" data-carousel-next
                  aria-label="Ver mais produtos de ${escapeHtml(categoria.nome)}">
            ${icone('arrowRight')}
          </button>
        </div>
      </header>

      <div class="carousel-track" data-carousel-track tabindex="0" role="group"
           aria-label="Produtos de ${escapeHtml(categoria.nome)}. Use as setas do teclado para navegar.">
        ${categoria.produtos.map(createProductCard).join('')}
      </div>

      <div class="carousel-dots" data-carousel-dots></div>
    </div>
  </section>`;
}

/** Renderiza todas as vitrines de uma vez. */
export function renderShelves(catalogo, alvo = $('[data-shelves]')) {
  if (!alvo) return;
  alvo.innerHTML = catalogo.categorias
    .filter((c) => c.produtos.length > 0)
    .map(renderProductCarousel)
    .join('');
}

/* ------------------------------ renderFeatured --------------------------- */
/** Painel grande do produto com "featured": true no JSON. */
export function renderFeatured(catalogo, alvo = $('[data-featured]')) {
  if (!alvo) return;
  const p = catalogo.emDestaque();
  if (!p) { alvo.hidden = true; return; }

  alvo.hidden = false;
  alvo.insertAdjacentHTML('beforeend', `
    <div class="container">
      <div class="featured-panel" data-reveal>
        <div class="featured-media">
          <img src="${escapeHtml(p.imagem)}" alt="${escapeHtml(p.imagemAlt)}"
               loading="lazy" decoding="async" width="1200" height="1200">
        </div>

        <div class="featured-body">
          <p class="eyebrow eyebrow-light">Produto em destaque</p>
          <h3>${escapeHtml(p.nome)}${p.variante ? ` · ${escapeHtml(p.variante)}` : ''}</h3>
          <p>${escapeHtml(p.resumo || p.descricao)}</p>

          ${p.destaques.length ? `<ul class="featured-highlights">
            ${p.destaques.slice(0, 4).map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>` : ''}

          <div class="featured-meta">
            ${p.preco ? `<span class="featured-price">${escapeHtml(p.preco)}</span>` : ''}
            ${p.precoAntigo ? `<span class="featured-oldprice">${escapeHtml(p.precoAntigo)}</span>` : ''}
            ${selo(p.nota)}
          </div>

          <div class="featured-actions">
            ${botaoAfiliado(p, 'Ver na loja')}
            <button class="btn btn-outline" type="button" data-open-product="${escapeHtml(p.id)}">
              Ver análise completa
            </button>
          </div>

          ${p.precoNota ? `<p class="featured-note">${escapeHtml(p.precoNota)}</p>` : ''}
        </div>
      </div>
    </div>
  `);
}

/* ------------------------------ renderEditorial -------------------------- */
/** Cards de conteúdo. Base pronta para virar um blog depois. */
export function renderEditorial(catalogo, alvo = $('[data-editorial]')) {
  if (!alvo || !catalogo.editorial.length) return;

  alvo.innerHTML = catalogo.editorial.map((artigo) => `
    <li data-reveal>
      <article class="editorial-card">
        <span class="editorial-kicker">${escapeHtml(artigo.kicker || 'Conteúdo')}</span>
        <h3>${escapeHtml(artigo.title)}</h3>
        <p>${escapeHtml(artigo.excerpt)}</p>
        <div class="editorial-foot">
          <span>${escapeHtml(artigo.readingTime || '')}</span>
          <span class="editorial-soon">Em breve</span>
        </div>
      </article>
    </li>
  `).join('');
}

/** Lista de categorias do rodapé — também sai do JSON. */
export function renderFooterCategories(catalogo, alvo = $('[data-footer-categories]')) {
  if (!alvo) return;
  alvo.innerHTML = catalogo.categorias.map((c) =>
    `<li><a href="#vitrine-${escapeHtml(c.id)}">${escapeHtml(c.nome)}</a></li>`
  ).join('');
}

