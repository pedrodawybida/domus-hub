# Apresentações Domus

Os três decks são apresentações HTML interativas com navegação por slides, reprodução automática, tela cheia e retorno à central.

Os arquivos editáveis ficam em `src/`, com fontes, imagens e o SVG da marca em `src/fonts/`, `src/` e `ref/DOMUS_svg/`.

Para reconstruir os decks após editar os templates ou assets:

```sh
python3 presentations-src/build_sobre_nos.py
python3 presentations-src/build.py
python3 presentations-src/build_curitiba.py
```

Os scripts geram os arquivos autocontidos em `dist-vercel/slides/`. Pela web, a plataforma os incorpora aos cards; ao abrir o HTML diretamente pelo Finder, os cards abrem o deck como página própria para evitar restrições de `file://` em iframes.
