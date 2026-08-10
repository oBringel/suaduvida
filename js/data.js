/* ==========================================================================
   data.js — leitura e normalização do catálogo.

   Este é o único ponto do site que conhece o formato do products.json.
   Se um dia o arquivo mudar de lugar (ou virar uma API), só este arquivo muda.
   ========================================================================== */

const CAMINHO_JSON = 'data/products.json';

/** Valor que marca um link de afiliado ainda não configurado. */
export const LINK_NAO_CONFIGURADO = 'SUBSTITUA_PELO_LINK_DE_AFILIADO';

/**
 * Extrai o ID do YouTube a partir de um ID puro ou de uma URL de embed/watch.
 * Aceita: "abc123", "https://www.youtube.com/embed/abc123",
 *         "https://youtu.be/abc123", "https://www.youtube.com/watch?v=abc123".
 */
function extrairVideoId(produto) {
  const bruto = (produto.videoId || produto.video || '').trim();
  if (!bruto) return '';
  if (!bruto.includes('/') && !bruto.includes('?')) return bruto;
  const padrao = bruto.match(/(?:embed\/|youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{6,})/);
  return padrao ? padrao[1] : '';
}

/** Garante que um campo do JSON seja sempre um array. */
const comoLista = (valor) => (Array.isArray(valor) ? valor.filter(Boolean) : []);

/**
 * Normaliza um produto: preenche o que faltou e deriva campos calculados.
 * Assim o restante do código nunca precisa checar se um campo existe.
 */
function normalizarProduto(produto, categoria) {
  const linkBruto = (produto.affiliateUrl || '').trim();
  const linkPendente = !linkBruto || linkBruto === LINK_NAO_CONFIGURADO || linkBruto === '#';

  return {
    id: String(produto.id),
    nome: produto.name || 'Produto sem nome',
    variante: produto.variant || '',
    marca: produto.brand || '',
    resumo: produto.shortDescription || '',
    descricao: produto.description || '',
    imagem: produto.image || '',
    imagemAlt: produto.imageAlt || produto.name || '',
    galeria: comoLista(produto.gallery),
    videoId: extrairVideoId(produto),
    link: linkPendente ? '' : linkBruto,
    linkPendente,
    loja: produto.store || '',
    preco: produto.price || '',
    precoValor: typeof produto.priceValue === 'number' ? produto.priceValue : null,
    precoAntigo: produto.oldPrice || '',
    precoNota: produto.priceNote || '',
    nota: typeof produto.rating === 'number' ? produto.rating : null,
    destaque: produto.featured === true,
    tags: comoLista(produto.tags),
    destaques: comoLista(produto.highlights),
    pros: comoLista(produto.pros),
    contras: comoLista(produto.cons),
    paraQuem: produto.forWho || '',
    naoParaQuem: produto.notForWho || '',
    dica: produto.tip || '',
    categoriaId: categoria.id,
    categoriaNome: categoria.name
  };
}

/**
 * loadProducts()
 * Lê o JSON e devolve o catálogo já normalizado.
 * Em caso de falha, lança um erro com mensagem legível (o app.js trata).
 */
export async function loadProducts(caminho = CAMINHO_JSON) {
  let resposta;
  try {
    resposta = await fetch(caminho, { cache: 'no-cache' });
  } catch (erro) {
    throw new Error('Não foi possível acessar o arquivo ' + caminho + '.');
  }
  if (!resposta.ok) {
    throw new Error('O servidor respondeu ' + resposta.status + ' ao buscar ' + caminho + '.');
  }

  let bruto;
  try {
    bruto = await resposta.json();
  } catch (erro) {
    throw new Error('O arquivo ' + caminho + ' existe, mas não é um JSON válido. Verifique vírgulas e aspas.');
  }

  const categorias = (bruto.categories || []).map((categoria) => ({
    id: categoria.id,
    nome: categoria.name,
    descricao: categoria.description || '',
    tituloVitrine: categoria.carouselTitle || categoria.name,
    icone: categoria.icon || 'sparkle',
    imagem: categoria.image || '',
    produtos: (categoria.products || []).map((p) => normalizarProduto(p, categoria))
  }));

  return criarCatalogo(categorias, bruto.editorial || [], bruto.meta || {});
}

/** Monta o objeto com os métodos de consulta usados pelo resto do site. */
function criarCatalogo(categorias, editorial, meta) {
  const todos = categorias.flatMap((c) => c.produtos);
  const porId = new Map(todos.map((p) => [p.id, p]));

  return {
    meta,
    categorias,
    editorial,

    /** Todos os produtos, de todas as categorias. */
    todosProdutos: () => todos,

    /** Busca um produto pelo id (usado ao abrir o modal). */
    produto: (id) => porId.get(String(id)) || null,

    /** Primeiro produto marcado com "featured": true. */
    emDestaque: () => todos.find((p) => p.destaque) || null,

    /**
     * Base pronta para os filtros futuros (categoria, preço, nota, marca, tag).
     * Ainda não há interface para isso — a função já existe para não precisar
     * reescrever nada quando os filtros forem adicionados.
     */
    filtrar: ({ categoria, precoMax, notaMin, marca, tag } = {}) =>
      todos.filter((p) =>
        (!categoria || p.categoriaId === categoria) &&
        (precoMax == null || (p.precoValor != null && p.precoValor <= precoMax)) &&
        (notaMin == null || (p.nota != null && p.nota >= notaMin)) &&
        (!marca || p.marca.toLowerCase() === String(marca).toLowerCase()) &&
        (!tag || p.tags.includes(tag))
      )
  };
}
