# suaduvida

Vitrine editorial de produtos de tecnologia. O site apresenta cada produto com
características, prós, contras e uma leitura de "vale a pena?" — e, quando a
pessoa decide, envia para a loja através de um link de afiliado.

**Não é loja.** Não existe carrinho, checkout ou simulação de compra.

---

## Como rodar

O site é estático (HTML + CSS + JS + JSON). Como ele lê o catálogo por `fetch`,
os navegadores exigem um servidor — abrir o `index.html` com dois cliques não
funciona (o próprio site avisa isso na tela, com o comando abaixo).

```bash
cd suaduvida
python3 -m http.server 8000
# abra http://localhost:8000
```

Outras opções: `npx serve`, extensão *Live Server* do VS Code, ou publicar
direto no GitHub Pages / Netlify — em qualquer hospedagem funciona normalmente.

---

## Estrutura

```
suaduvida/
├── index.html              estrutura da página (nenhum produto escrito aqui)
├── css/
│   └── style.css           design system + todos os componentes
├── js/
│   ├── app.js              orquestra tudo
│   ├── data.js             lê e normaliza o products.json
│   ├── products.js         monta cards, vitrines, categorias, destaque
│   ├── carousel.js         carrossel (botões, indicadores, teclado)
│   ├── modal.js            janela de detalhes + vídeo sob demanda
│   ├── affiliate.js        cliques nos links comerciais
│   ├── nav.js              menu do celular, header, animação de entrada
│   └── utils.js            atalhos, ícones e avisos
├── data/
│   └── products.json       ⭐ TODO O CONTEÚDO ESTÁ AQUI
├── assets/images/products/ imagens dos produtos
└── README.md
```

A regra do projeto: **o HTML é a estrutura, o JSON é o conteúdo.**
Nada de duplicar bloco de HTML para cada produto novo.

---

## Como adicionar um produto

1. Abra `data/products.json`.
2. Encontre a categoria desejada dentro de `categories`.
3. Copie um produto inteiro (das chaves `{` até `}`) e cole logo abaixo,
   separando com vírgula.
4. Altere os campos.
5. Salve e recarregue a página. Pronto — o card aparece no carrossel.

### Campos disponíveis

| Campo | Obrigatório | Para que serve |
|---|---|---|
| `id` | sim | Identificador único. Usado para abrir o modal. |
| `name` | sim | Nome exibido no card e no modal. |
| `variant` | não | Complemento após o nome (cor, capacidade). |
| `brand` | não | Marca. Reservado para o filtro futuro. |
| `shortDescription` | sim | Frase do card. Até ~3 linhas. |
| `description` | sim | Texto do modal. Aqui vai o conteúdo de verdade. |
| `image` | sim | Caminho da imagem principal. |
| `imageAlt` | sim | Descrição da imagem para leitores de tela e SEO. |
| `gallery` | não | Lista de imagens extras (viram miniaturas no modal). |
| `videoId` | não | ID do vídeo no YouTube. Veja a seção de vídeos. |
| `affiliateUrl` | sim | Seu link de afiliado. |
| `store` | não | Nome da loja, exibido no modal. |
| `price` / `oldPrice` | não | Texto do preço. Some do card se ficar vazio. |
| `priceValue` | não | Mesmo preço em número. Reservado para o filtro futuro. |
| `priceNote` | não | Observação curta abaixo do preço. |
| `rating` | não | Nota da curadoria, de 0 a 5. |
| `featured` | não | `true` coloca o produto no painel de destaque. |
| `tags` | não | Palavras-chave. Reservado para o filtro futuro. |
| `highlights` | não | Lista de características (aparecem no modal). |
| `pros` / `cons` | não | Pontos positivos e negativos. |
| `forWho` | não | "Faz sentido se…" no bloco de veredito. |
| `notForWho` | não | "Pense duas vezes se…" no bloco de veredito. |
| `tip` | não | A dica destacada no fim do modal. |

Remover um produto é apagar o bloco dele. Mudar preço, imagem ou link é editar
o campo correspondente. Nenhuma dessas ações exige mexer em HTML.

---

## Como adicionar uma categoria

Cole um bloco novo dentro de `categories`:

```json
{
  "id": "audio",
  "name": "Áudio",
  "description": "Fones, caixas e microfones.",
  "carouselTitle": "Som que vale a pena",
  "icon": "sparkle",
  "products": []
}
```

O que acontece sozinho ao salvar:

- um card novo na grade de categorias;
- uma vitrine nova com carrossel próprio, com âncora `#vitrine-audio`;
- um item novo na lista de categorias do rodapé.

Para colocar a categoria também no menu do topo, adicione uma linha em
`index.html` dentro de `.nav-list` (é a única edição manual do projeto):

```html
<li><a href="#vitrine-audio">Áudio</a></li>
```

Ícones disponíveis em `icon`: `chip`, `monitor`, `desk`, `home`, `keyboard`,
`sparkle`. Para criar outros, adicione a chave no objeto `ICONES` de
`js/utils.js`.

---

## Como trocar as imagens

Coloque os arquivos em `assets/images/products/` e aponte o caminho no JSON.

- **Formato:** prefira `.webp`. `.jpg` e `.png` também funcionam.
- **Proporção:** quadrada. Recomendado **1200 × 1200 px**.
- **Fundo:** claro ou transparente. O card usa `object-fit: contain`, então a
  imagem nunca é esticada nem cortada.
- **Peso:** procure ficar abaixo de 150 KB por imagem.

As imagens já vêm com `loading="lazy"` e `width`/`height` definidos, o que evita
o layout "pular" enquanto carrega (CLS).

Para converter uma pasta inteira de JPG para WebP:

```bash
# com ImageMagick
mogrify -format webp -quality 82 -resize 1200x1200 *.jpg
```

---

## Como adicionar vídeos

1. Abra o vídeo no YouTube e copie o ID — é o trecho depois de `v=`.
   Em `https://www.youtube.com/watch?v=AbC123xyz`, o ID é `AbC123xyz`.
2. Coloque no produto: `"videoId": "AbC123xyz"`.

Também funciona colar a URL completa em `video` (`watch`, `youtu.be` ou
`embed`) — o `data.js` extrai o ID sozinho.

**Como o carregamento funciona:** o site mostra apenas a miniatura do vídeo.
O `iframe` do YouTube só é criado quando a pessoa clica no play, dentro do
modal. Com 30 produtos na página, isso evita 30 players carregando de uma vez.
Ao fechar o modal, o iframe é destruído e o vídeo para.

---

## Como configurar os links de afiliado

No JSON, troque o valor de `affiliateUrl`:

```json
"affiliateUrl": "https://www.loja.com.br/produto?tag=seu-codigo"
```

Enquanto o valor continuar `SUBSTITUA_PELO_LINK_DE_AFILIADO`, o botão não
navega: ele mostra um aviso na tela lembrando de configurar. Isso evita
publicar o site com botões quebrados.

Todos os links comerciais saem com `target="_blank"` e
`rel="nofollow sponsored noopener"`, como pedem as diretrizes do Google para
conteúdo patrocinado.

### Métricas de clique

`js/affiliate.js` tem a função `registrarClique()`, que já envia um evento para
`window.dataLayer` quando ele existe (Google Tag Manager). Se preferir GA4
direto, há um exemplo comentado no mesmo arquivo.

---

## Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "primeira versão do suaduvida"
git branch -M main
git remote add origin git@github.com:SEU-USUARIO/suaduvida.git
git push -u origin main
```

Depois: **Settings → Pages → Source: `main` / root**.

Antes de publicar, ajuste em `index.html`:

- `<link rel="canonical">` e `og:url` para o domínio real;
- o e-mail de contato e os links de redes sociais no rodapé.

---

## Antes de ir para o ar

- [ ] Todos os `affiliateUrl` preenchidos
- [ ] Preços conferidos (ou os campos `price` removidos, se você não quiser mantê-los atualizados)
- [ ] Imagens próprias no lugar dos placeholders `.svg`
- [ ] Textos de `description`, `pros` e `cons` revisados
- [ ] Domínio atualizado no canonical e no Open Graph
- [ ] Aviso de afiliados visível no rodapé (já está)

---

## Notas técnicas

- **Sem framework e sem build.** HTML, CSS e JavaScript ES6 modules. Nada para
  compilar, nada para instalar.
- **Sem biblioteca de carrossel.** A rolagem nativa com `scroll-snap` entrega
  swipe, inércia e acessibilidade sem nenhum kilobyte extra. O JavaScript
  cuida só dos botões, dos indicadores e das setas do teclado.
- **Acessibilidade:** HTML semântico, foco visível, navegação por teclado no
  carrossel e no modal, `aria-*` nos controles e respeito a
  `prefers-reduced-motion`.
- **Preparado para filtros:** `js/data.js` já expõe `catalogo.filtrar({ categoria,
  precoMax, notaMin, marca, tag })`. Falta só a interface.

### Os produtos de exemplo

Os textos e preços incluídos servem de demonstração e devem ser revisados antes
de publicar. Os itens com imagem `.svg` são placeholders. Os preços marcados
como "preço de referência" precisam ser conferidos na loja — preço em página de
afiliado desatualiza rápido, e por isso o site mostra um lembrete discreto de
conferir o valor atual.
