/* ==========================================================================
   nav.js — header, menu do celular e microinterações de rolagem.
   ========================================================================== */

import { $, $$ } from './utils.js';

/* --------------------------- Menu do celular ----------------------------- */
export function initNav() {
  const botao = $('[data-nav-toggle]');
  const menu = $('#menu-principal');
  const fundo = $('[data-nav-backdrop]');
  if (!botao || !menu) return;

  const abrir = () => {
    menu.classList.add('is-open');
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar menu');
    if (fundo) fundo.hidden = false;
    document.body.classList.add('nav-open');
    menu.querySelector('a')?.focus();
  };

  const fechar = ({ devolverFoco = false } = {}) => {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
    if (fundo) fundo.hidden = true;
    document.body.classList.remove('nav-open');
    if (devolverFoco) botao.focus();
  };

  botao.addEventListener('click', () => {
    menu.classList.contains('is-open') ? fechar({ devolverFoco: true }) : abrir();
  });

  fundo?.addEventListener('click', () => fechar());

  // Fecha ao escolher um destino
  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) fechar();
  });

  // ESC fecha o menu
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') fechar({ devolverFoco: true });
  });

  // Se a tela crescer, o menu lateral não faz mais sentido
  const telaLarga = window.matchMedia?.('(min-width: 900px)');
  telaLarga?.addEventListener?.('change', (e) => { if (e.matches) fechar(); });
}

/* ------------------- Linha no header ao sair do topo --------------------- */
export function initHeaderScroll() {
  const header = $('[data-header]');
  if (!header) return;

  const atualizar = () => {
    header.classList.toggle('is-stuck', window.scrollY > 8);
  };
  window.addEventListener('scroll', atualizar, { passive: true });
  atualizar();
}

/* --------------------- Entrada suave das seções -------------------------- */
/**
 * Elementos com [data-reveal] aparecem com um deslocamento curto ao entrar
 * na tela. Se o navegador não tiver IntersectionObserver, tudo fica visível.
 */
export function initReveal(escopo = document) {
  const alvos = $$('[data-reveal]', escopo);
  if (!alvos.length) return;

  if (!('IntersectionObserver' in window)) {
    alvos.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada, indice) => {
      if (!entrada.isIntersecting) return;
      // Pequeno escalonamento para os itens que entram juntos
      entrada.target.style.transitionDelay = `${Math.min(indice, 4) * 55}ms`;
      entrada.target.classList.add('is-visible');
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  alvos.forEach((el) => observador.observe(el));
}
