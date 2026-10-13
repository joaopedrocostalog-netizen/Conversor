# Backend opcional: assinatura A1 (.pfx/.p12)

A opção **ICP-Brasil / certificado A1** depende desta API Python. GitHub Pages sozinho não executa Python.

## Rodar localmente

```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
# Linux/macOS
ALLOWED_ORIGIN=https://joaopedrocostalog-netizen.github.io uvicorn main:app --host 127.0.0.1 --port 8000
```

Para produção, hospede em servidor próprio ou serviço Python com HTTPS, configurando `ALLOWED_ORIGIN` com a origem exata do site. Na interface, informe a URL pública dessa API (por exemplo `https://seu-servidor.example`). A API expõe `GET /health` e `POST /sign-a1`.

## Segurança e conformidade

- **NÃO use backend desconhecido**: a requisição entrega ao backend o PDF, o arquivo PFX/P12 e sua senha. O servidor precisa ser de sua confiança, com HTTPS, autenticação, logs sem dados sensíveis, política de descarte, isolamento e limitação de requisições. O código de exemplo não traz autenticação nem proteção contra abuso, e **não deve ser publicado em endpoint aberto antes desse endurecimento**.
- O processamento do PFX ocorre em memória, sem armazenamento intencional. A chave e a senha trafegam para o servidor. Não exponha senhas em logs.
- Realiza assinatura PDF criptográfica com certificado PKCS#12 usando pyHanko e subfiltro PAdES; **não comprova por si só** cadeia ICP-Brasil, revogação, carimbo do tempo ou conformidade PAdES-LT/LTA. Valide o resultado com um validador oficial e a cadeia de confiança atualizada.
- Não suporta A3/token/cartão neste fluxo. Para A3, use middleware/serviço PKCS#11 adequado.
- O formato de assinatura criptográfica é independente da imagem de assinatura visual. Modificar PDF **depois** da assinatura pode afetar a validação; caso necessário, adicione elementos visuais antes de aplicar certificado.
