# ui-login

## Escopo

- Módulo de autenticação e entrada do usuario.
- Cobre sign-in, create-account, confirm-account, reset-password e guardas de acesso publicas.

## Regras de branding

- A empresa base da tela de login deve vir de `people.defaultCompany` com fallback para `currentCompany`.
- Logo, fundo e outros arquivos de branding vindos do backend devem usar `DefaultFile` de `ui-default`, nunca `Image` direto quando o contrato for de arquivo.
- Arquivos de download do backend devem carregar o dominio no path (`/{dominio}/files/{id}/download`) quando nao for possivel enviar header e, quando a plataforma suportar, tambem devem enviar esse valor em `headers`.
- A tela de login deve acionar `peopleActions.defaultCompany()` ao ganhar foco para atualizar o branding da empresa principal.

## Regras de fluxo

- Login com Google so pode aparecer quando a empresa atual expuser `clientId` valido.
- O modulo deve manter o tema vindo de `themeStore.getters.colors` e nao introduzir cores fixas no fluxo.
- Qualquer mudanca visivel no browser precisa manter cobertura em `src/tests/browser` quando houver impacto no login.
