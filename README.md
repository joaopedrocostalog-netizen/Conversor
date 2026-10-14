# Conversor de Arquivos — COSTALOG

Site estático responsivo inspirado na interface operacional COSTALOG. Execute abrindo `index.html` ou hospede pelo GitHub Pages.

## Conversões disponíveis
- PDF digital → Word (.docx), Excel (.xlsx), texto (.txt), PNG/JPEG (primeira página)
- PNG/JPEG/WebP → PDF
- PNG/JPEG/WebP → PNG/JPEG/WebP

As conversões ocorrem no navegador. As bibliotecas são carregadas de CDN, exigindo internet. PDF → Word e PDF → Excel **extraem texto** e não recriam fielmente o layout, tabelas ou imagens. PDF digitalizado requer OCR, ainda não implementado. Para conversões complexas (Word/Excel → PDF, PDF escaneado, tabelas estruturadas) é necessário desenvolver um backend dedicado. Limite de 100 MB por arquivo.

## Publicação
No GitHub, abra **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)**. Após ativar, o endereço previsto é `https://joaopedrocostalog-netizen.github.io/Conversor/`.

## Análise de PDF (OCR com e sem IA)
- **OCR sem IA**: primeiro tenta extrair texto digital com PDF.js; quando uma página não contém texto suficiente, renderiza a página e executa Tesseract.js (português e inglês) no próprio navegador. Permite revisar e baixar o texto extraído.
- **OCR + IA**: executa a mesma extração e permite fazer perguntas sobre o texto. O usuário deve informar sua própria chave OpenAI, que não fica gravada no repositório nem em localStorage. A solicitação envia o **texto editável extraído** para a OpenAI via API; não envia o PDF integral. Pode haver cobrança pelo provedor.
- **Limitações**: documentos manuscritos ou com tabelas complexas podem precisar de revisão. Arquivos grandes consomem bastante memória. O modo IA usa chamada direta do navegador e pode depender de políticas CORS do provedor; implantação corporativa recomendada via backend com autenticação e gerenciamento seguro de credenciais. O sistema não oferece conta gratuita de IA e não garante respostas corretas.
- Este módulo é uma **implementação própria inspirada no fluxo OCR + análise de PDFs**, e não uma incorporação direta do backend Python do repositório pdfGPT.

## Assinar PDF

A opção **Assinar PDF** permite desenhar ou digitar uma assinatura, visualizar o documento, selecionar a página, clicar para definir a posição e ajustar a largura antes de salvar um novo PDF. Usa PDF.js e pdf-lib no navegador e não envia arquivos ao servidor. Esta é uma **assinatura visual**, sem certificação ICP-Brasil, prova criptográfica de integridade ou verificação de identidade. PDFs protegidos por senha podem não ser aceitos.

### Assinaturas múltiplas e importadas

A ferramenta permite importar imagem de assinatura (PNG, JPG ou WebP), desenhar ou digitar, clicar repetidas vezes na prévia para posicionar **várias assinaturas**, mudar de página, duplicar a última assinatura, remover a última ou limpar todas. As assinaturas são incorporadas como imagens ao novo PDF, localmente no navegador. **Importar uma imagem de assinatura NÃO equivale à assinatura digital criptográfica com certificado ICP-Brasil (PAdES)**. Este recurso de certificação não está implementado.

## Assinatura digital com certificado ICP-Brasil A1

Nova seção em **Assinar PDF**: envia o PDF, certificado PKCS#12 (.pfx/.p12) e senha para uma API Python **sob seu controle**, configurada manualmente. Veja instruções em [`backend/README.md`](backend/README.md). **GitHub Pages não executa esse backend**; sem URL de servidor em HTTPS, a função A1 não estará operacional. A implementação gera assinatura criptográfica, mas a conformidade ICP-Brasil e a validade do certificado devem ser verificadas com validador de confiança. Nunca envie certificado e senha a serviços desconhecidos. **Ainda não validado ponta a ponta com certificado real.**

## Categorias e formatos adicionais

O menu lateral agora tem grupos expansíveis de **PDF**, **Imagens**, **Documentos e texto**, e **Planilhas e dados**.

- PDF → DOCX/XLSX/TXT/CSV, PNG/JPEG/WebP (imagens só da primeira página).
- PNG/JPG/JPEG/WebP entre si e para PDF.
- DOCX → TXT/HTML: apenas texto e parágrafos simples; formatação e imagens podem ser perdidas.
- TXT → DOCX/PDF/HTML; HTML → TXT/PDF: conversão de texto, **não renderização fiel** de páginas HTML.
- XLSX/XLS → CSV/JSON/PDF: exporta **somente a primeira aba**; PDF com linhas de texto limitadas, sem preservar a formatação das células.
- CSV → XLSX/JSON; JSON → CSV/XLSX: JSON deve ser array de objetos (ou objeto simples); estruturas aninhadas não são preservadas com fidelidade.

Os formatos são manipulados localmente pelo navegador, com bibliotecas carregadas via CDN. Nem todas as combinações imagináveis são suportadas. Para PDF escaneado, a extração de texto exige OCR (Análise de PDF segue em manutenção). Arquivos complexos podem perder estilos, imagens ou estrutura.

## Ferramentas adicionais (2026-10)

- **Conversão em lote:** até 20 arquivos de formatos aceitos pela ferramenta selecionada. Executa sequencialmente no navegador e gera um ZIP com conversões bem-sucedidas, informando falhas individuais. O ZIP e o processamento podem consumir muita memória.
- **Pré-visualização:** imagens, primeira página de PDFs, TXT, CSV, JSON, HTML e primeira aba XLS/XLSX. Prévia não é renderização completa de arquivos DOCX.
- **Histórico de conversões:** data, nome do arquivo original, nome convertido e tamanho armazenados apenas em `localStorage`. Sem persistência do conteúdo do arquivo; apagar os dados do navegador remove o histórico.
- **PDF para XLSX (Tabelas):** reconstrói aproximadamente linhas/colunas a partir de coordenadas de texto extraível (PDF.js). Não realiza OCR e não garante fidelidade de tabelas complexas, mescladas ou digitalizadas.

Esses recursos dependem de bibliotecas externas via CDN. A implementação está no `extras.js` e utiliza o motor já existente no `index.html`. Faça testes em navegador antes de utilizar documentos críticos.

## Modo escuro e comparador de documentos

- **Modo escuro:** botão no cabeçalho para alternar tema claro/escuro. Preferência armazenada no `localStorage` deste navegador.
- **Comparar documentos:** nova opção no menu lateral e na Home. Compara o conteúdo textual de dois arquivos PDF digital, DOCX, TXT, HTML, CSV, JSON, XLS ou XLSX, destacando linhas adicionadas ou removidas. Diferenças são calculadas localmente no navegador por algoritmo de comparação de linhas, **sem IA** e sem upload a servidor.
- **Limitações:** até 30 MB por arquivo; comparação limitada às primeiras 500 linhas de cada documento, de modo a proteger o desempenho. Não compara aparência, imagens ou layout. PDFs escaneados precisam de OCR (não incluído neste comparador).

Implementação em `compare.js`, carregada após `extras.js`. As demais ferramentas continuam disponíveis.

## Proteger e desproteger PDF

Novas ferramentas **Proteger PDF** e **Desproteger PDF** disponíveis no menu Ferramentas e na página Início. Implementadas no `security.js` com a biblioteca `pdfstudio` (qpdf compilado para WebAssembly), carregada sob demanda através de CDN. A função Proteger adiciona **senha de abertura AES-256**, confirmada em dois campos; Desproteger solicita a **senha válida** e gera uma cópia sem criptografia. O arquivo é processado no navegador e o download é local. Não há recuperação de senhas esquecidas nem remoção sem credenciais válidas.

Requisitos: navegador com WebAssembly e acesso aos CDNs `esm.sh` e `cdn.jsdelivr.net`; limite de 100 MB por arquivo. É necessário testar as funções com PDFs reais depois do deploy. Senhas não são gravadas no histórico local.

## Digitalizar PDF (a partir de um PDF)

A ferramenta **Digitalizar PDF** transforma cada página de um PDF existente em uma imagem JPEG incorporada a um novo PDF, com resolução selecionável (compacta, equilibrada ou alta). Todas as páginas são processadas localmente com PDF.js e jsPDF, preservando aproximadamente as dimensões e a orientação originais. O documento resultante fica semelhante a um PDF escaneado: **perde a camada de texto selecionável/pesquisável e links**, e **não realiza OCR**. Limites: arquivo original de até 100 MB, máximo 200 páginas e até 24 milhões de pixels por página; memória disponível no dispositivo pode impor limites menores. O novo arquivo é baixado com o sufixo `-digitalizado.pdf`.

## Scanner de documentos usando câmera do celular

A ferramenta **Escanear documento** agora permite fotografar documentos de papel com a câmera traseira do celular (`<input type="file" accept="image/*" capture="environment">`), adicionar outras fotos, girar, reorganizar e excluir páginas, selecionar estilo (colorido, cinza ou preto e branco) e gerar um PDF multipágina localmente. Em navegadores que não seguem `capture`, o sistema pode oferecer a galeria no lugar da câmera. Também é possível adicionar imagens existentes pelo botão Galeria. O scanner **não faz detecção automática das bordas nem recorte perspectivo** e não realiza OCR. O arquivo não é enviado ao servidor. Limite: 60 páginas, 25 MB por foto.

**Atualização:** esta função substitui o fluxo anterior de rasterização de um PDF enviado. Agora é um scanner de documentos físicos pela câmera.
