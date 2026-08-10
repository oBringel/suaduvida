/* ==========================================================================
   utils.js — funções pequenas usadas pelos outros módulos.
   Nada aqui depende de dados: são só atalhos de DOM, texto e ícones.
   ========================================================================== */

/** Atalho para querySelector. */
export const $ = (seletor, escopo = document) => escopo.querySelector(seletor);

/** Atalho para querySelectorAll já convertido em array. */
export const $$ = (seletor, escopo = document) => Array.from(escopo.querySelectorAll(seletor));

/**
 * Escapa texto antes de injetar no HTML.
 * IMPORTANTE: todo conteúdo vindo do products.json passa por aqui.
 * Sem isso, um caractere como "<" no nome de um produto quebraria a página.
 */
export function escapeHtml(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Junta partes de HTML ignorando valores vazios. */
export const juntar = (...partes) => partes.filter(Boolean).join('');

/** Espera o navegador ficar ocioso antes de rodar algo não urgente. */
export function aoOcioso(fn) {
  if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1200 });
  else setTimeout(fn, 200);
}

/** Executa a função no máximo uma vez a cada `espera` milissegundos. */
export function debounce(fn, espera = 150) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), espera);
  };
}

/* ------------------------------- Ícones ---------------------------------- */
/* Ícones inline em SVG: evitam uma requisição extra e herdam a cor do texto.
   Para usar um ícone novo em uma categoria, adicione a chave aqui e informe
   o nome dela no campo "icon" da categoria no products.json.               */
const ICONES = {
  chip: '<path d="M7 3v3M12 3v3M17 3v3M7 18v3M12 18v3M17 18v3M3 7h3M3 12h3M3 17h3M18 7h3M18 12h3M18 17h3"/><rect x="6" y="6" width="12" height="12" rx="2"/>',
  monitor: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  desk: '<path d="M3 8h18M4 8v12M20 8v12M4 4h16v4H4zM8 12h5"/>',
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
  sparkle: '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M18 15.5 18.8 18l2.2.8-2.2.8-.8 2.2-.8-2.2L15 18l2.2-.8.8-1.7Z"/>',
  play: '<path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none"/>',
  arrowLeft: '<path d="M15 19 8 12l7-7"/>',
  arrowRight: '<path d="m9 5 7 7-7 7"/>',
  star: '<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9 2.9-6Z" fill="currentColor" stroke="none"/>',
  external: '<path d="M14 2h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
};

/** Devolve um <svg> pronto para uso. `nome` é uma chave do objeto ICONES. */
export function icone(nome, classe = '') {
  const desenho = ICONES[nome] || ICONES.sparkle;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    ${classe ? `class="${classe}"` : ''}>${desenho}</svg>`;
}

/* ------------------------------- Avisos ---------------------------------- */
let temporizadorAviso;

/** Mostra um aviso curto no rodapé da tela (some sozinho). */
export function aviso(mensagem, duracao = 4200) {
  const caixa = $('[data-toast]');
  if (!caixa) return;
  caixa.textContent = mensagem;
  caixa.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { caixa.hidden = true; }, duracao);
}
