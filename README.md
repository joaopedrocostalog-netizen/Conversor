# Conversor de Arquivos — COSTALOG

Site estático responsivo inspirado na interface operacional COSTALOG. Execute abrindo `index.html` ou hospede pelo GitHub Pages.

## Conversões disponíveis
- PDF digital → Word (.docx), Excel (.xlsx), texto (.txt), PNG/JPEG (primeira página)
- PNG/JPEG/WebP → PDF
- PNG/JPEG/WebP → PNG/JPEG/WebP

As conversões ocorrem no navegador. As bibliotecas são carregadas de CDN, exigindo internet. PDF → Word e PDF → Excel **extraem texto** e não recriam fielmente o layout, tabelas ou imagens. PDF digitalizado requer OCR, ainda não implementado. Para conversões complexas (Word/Excel → PDF, PDF escaneado, tabelas estruturadas) é necessário desenvolver um backend dedicado. Limite de 100 MB por arquivo.

## Publicação
No GitHub, abra **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)**. Após ativar, o endereço previsto é `https://joaopedrocostalog-netizen.github.io/Conversor/`.
