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
