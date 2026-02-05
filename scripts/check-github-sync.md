# Cómo verificar si el proyecto está actualizado con GitHub

## 1. Traer la información más reciente del remoto

```bash
git fetch origin
```

Si pide usuario/contraseña, usa tu usuario de GitHub y un **Personal Access Token** (no la contraseña de la cuenta).

---

## 2. Comparar tu rama con la remota

### ¿Tienes commits locales que no están en GitHub?

```bash
git log origin/main..HEAD --oneline
```

- **Salida vacía**: no tienes commits locales por delante de GitHub.
- **Con líneas**: esos commits están solo en tu máquina (no se han pusheado).

### ¿Hay commits en GitHub que no tienes tú?

```bash
git log HEAD..origin/main --oneline
```

- **Salida vacía**: estás al día con GitHub.
- **Con líneas**: hay commits en GitHub que no tienes (necesitas `git pull`).

---

## 3. Resumen en un solo comando

```bash
git fetch origin
git status
```

Mensajes típicos:

- **"Your branch is up to date with 'origin/main'"**  
  Tu `main` local está al mismo commit que `origin/main` (según el último `fetch`).
- **"Your branch is ahead of 'origin/main' by X commits"**  
  Tienes X commits locales que no están en GitHub → puedes hacer `git push`.
- **"Your branch is behind 'origin/main' by X commits"**  
  GitHub tiene X commits que tú no tienes → haz `git pull`.

---

## 4. Ver diferencias de archivos (sin hacer pull)

Para ver qué archivos cambiaron en GitHub respecto a tu rama actual:

```bash
git fetch origin
git diff --stat HEAD origin/main
```

---

## 5. Comandos rápidos de referencia

| Objetivo                         | Comando                    |
|----------------------------------|----------------------------|
| Actualizar referencias del remoto| `git fetch origin`         |
| Ver estado vs origin/main        | `git status`               |
| Ver commits solo en GitHub       | `git log HEAD..origin/main --oneline` |
| Traer y mezclar cambios          | `git pull origin main`     |
| Enviar tus commits               | `git push origin main`     |

---

## 6. Resumen "¿Estoy al día?"

Ejecuta en la raíz del repo:

```bash
git fetch origin
echo "=== Commits solo en GitHub (no los tienes) ==="
git log HEAD..origin/main --oneline
echo "=== Commits solo locales (no están en GitHub) ==="
git log origin/main..HEAD --oneline
```

- Si **ambos** salen vacíos: tu repo está **sincronizado** con GitHub.
- Si solo el primero tiene líneas: estás **atrasado** → `git pull`.
- Si solo el segundo tiene líneas: estás **adelantado** → `git push`.
