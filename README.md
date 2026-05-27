# Plataforma Integre Jr — Estrutura modular

Esta é a versão dividida em arquivos da plataforma, pronta pra ser editada por partes.

## Estrutura

```
plataforma-integre/
├── index.html          → casca (sidebar, topbar, modais) — quase nunca muda
├── styles.css          → todos os estilos compartilhados
├── script.js           → lógica de navegação, modais, toast, dados de permissões
└── pages/
    ├── dashboard.html
    ├── perfil.html
    ├── avisos.html
    ├── calendario.html
    ├── projetos.html
    ├── projeto-detalhe.html
    ├── capacitacoes.html
    ├── trainees.html
    ├── rnn.html
    ├── legado.html
    ├── drive.html
    └── permissoes.html
```

## Como rodar (passo a passo)

1. Coloque esta pasta inteira em algum lugar do seu computador (ex: `Documentos/`).
2. Abra o **VS Code**.
3. Menu **File → Open Folder** → selecione a pasta `plataforma-integre`.
4. Verifique se a extensão **Live Server** está instalada (Extensions → "Live Server" do autor Ritwick Dey).
5. Clique com o botão direito em `index.html` → **Open with Live Server**.
6. O navegador abre sozinho. A plataforma está rodando.

A partir daqui, **qualquer alteração que você salvar em qualquer arquivo recarrega automaticamente no navegador**.

## Como funciona a navegação

- O `index.html` é só uma "casca": sidebar, topbar e um `<div id="content">` vazio.
- Quando você clica em um item da sidebar, o `script.js` faz `fetch('pages/<nome>.html')` e injeta o HTML dentro do `#content`.
- Os modais e o toast ficam permanentemente no `index.html`, então funcionam em qualquer página.

## Fluxo de edição

- **Mudar o visual de algo (cores, espaçamentos, fontes):** edite `styles.css`.
- **Mudar o conteúdo de uma página específica:** edite o arquivo dela em `pages/`.
- **Mudar a sidebar ou topbar (que aparece em todas as páginas):** edite `index.html`.
- **Mudar lógica (navegação, modais, dados):** edite `script.js`.

## Notas técnicas

- A página padrão (mostrada ao abrir) é definida em `script.js` na constante `DEFAULT_PAGE`.
- A página de **Permissões** usa renderização via JavaScript (a tabela é montada pelo `script.js`). Por isso o `script.js` tem o mapa `pageInitializers` — adicione lá se outra página precisar de JS pra montar conteúdo dinâmico.
- A navegação não usa hash de URL ainda. Se quiser bookmarks/refresh mantendo a página, dá pra adicionar depois.

## Importante: precisa do Live Server (ou outro servidor local)

A função `fetch()` que carrega as páginas **não funciona** se você abrir o `index.html` direto com duplo clique (protocolo `file://`). Você verá uma tela em branco e um erro no console do navegador.

Sempre abra pelo Live Server (botão direito → Open with Live Server), ou rode qualquer outro servidor estático na pasta.
