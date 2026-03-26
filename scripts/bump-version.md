# Bump de versión (básico)

Este repo tiene 2 `package.json` (backend y frontend). Para mantenerlas sincronizadas, el script:

- incrementa `patch`/`minor`/`major`
- actualiza `version` en `backend/package.json` y `frontend/package.json`
- opcionalmente crea un tag Git (`--tag`)
- opcionalmente crea un commit Git (`--commit`) si vos lo pedís explícitamente

## Uso

1. Incrementar patch (ej: 1.0.0 -> 1.0.1):

```bash
node scripts/bump-version.js patch
```

2. Crear tag:

```bash
node scripts/bump-version.js patch --tag
```

3. También commitear automáticamente (si querés):

```bash
node scripts/bump-version.js patch --tag --commit
```

## Nota

Por defecto **no** hace `git commit` ni `git push`. Solo ajusta los `package.json` para que el bump quede versionado por Git cuando vos confirmes.

