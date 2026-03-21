# Documentación del Proyecto

En esta carpeta encontrarás toda la documentación relacionada con el Idle Clicker Game.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `README.md` | Documento principal del proyecto |
| `arquitectura.md` | Arquitectura del sistema |
| `mecanicas.md` | Mecánicas del juego |
| `economia.md` | Diseño económico del juego |
| `tecnologias.md` | Tecnologías y herramientas usadas |
| `roadmap.md` | Roadmap de desarrollo |
| `TODO.md` | Tareas pendientes por rol |
| `api-spec.md` | Especificación de API para el backend |

## Cómo contribuir

1. Crea un archivo `.md` para cada nueva documentación
2. Usa nombres descriptivos en minúsculas
3. Mantén el índice actualizado en `README.md`


# OpenCode + Ollama (LLM Local)

Este proyecto utiliza **OpenCode** conectado a **Ollama** para ejecutar agentes de IA usando modelos locales.

Esto permite trabajar **100% offline**, sin depender de APIs externas.

---

# Arquitectura

```
OpenCode
   │
   ▼
OpenAI-compatible API
   │
   ▼
Ollama (localhost:11434)
   │
   ▼
Modelos locales
```

Los agentes de OpenCode se comunican con Ollama usando la API compatible con OpenAI.

---

# Requisitos

Instalar:

* Node.js 18+
* npm
* Ollama

---

# 1. Instalar Ollama

Descargar desde:

https://ollama.com

Verificar instalación:

```bash
ollama --version
```

---

# 2. Descargar modelos

Ejemplo de modelos recomendados:

```bash
ollama pull llama3
ollama pull deepseek-coder:6.7b
ollama pull mistral
```

Ver modelos instalados:

```bash
ollama list
```

---

# 3. Ejecutar Ollama

Normalmente Ollama corre automáticamente en:

```
http://localhost:11434
```

Puedes probar con:

```bash
curl http://localhost:11434/api/tags
```

---

# 4. Configurar OpenCode

Crear archivo:

```
.opencode/config.json
```

Contenido:

```json
{
  "provider": "openai",
  "baseUrl": "http://localhost:11434/v1",
  "apiKey": "ollama"
}
```

Ollama no requiere API key, pero OpenCode espera que exista una.

---

# 5. Configurar agentes

Ejemplo de agente:

```
.opencode/agents/gameplay_programmer.md
```

```yaml
model: deepseek-coder:6.7b

Role: Gameplay Programmer
```

El campo `model` debe coincidir con el modelo instalado en Ollama.

---

# 6. Estructura del proyecto

```
.opencode/
 ├ agents/
 │   ├ gameplay_programmer.md
 │   ├ frontend_engineer.md
 │   └ backend_engineer.md
 │
 ├ skills/
 └ config.json
```

---

# 7. Ejecutar OpenCode

Iniciar el agente:

```bash
opencode
```

OpenCode cargará:

* agentes
* skills
* configuración

y comenzará a usar Ollama como proveedor de modelos.

---

# 8. Verificar conexión

Si todo funciona, OpenCode enviará requests a:

```
http://localhost:11434/v1/chat/completions
```

Puedes probar manualmente:

```bash
curl http://localhost:11434/api/generate \
-d '{
"model":"llama3",
"prompt":"Hello",
"stream":false
}'
```

---

# 9. Modelos recomendados

Para desarrollo:

```
deepseek-coder:6.7b
llama3
mistral
```

Uso sugerido:

| Rol        | Modelo         |
| ---------- | -------------- |
| Arquitecto | llama3         |
| Backend    | deepseek-coder |
| Frontend   | deepseek-coder |
| QA         | mistral        |

---

# 10. Solución de problemas

### Ollama no responde

Verificar que esté corriendo:

```bash
ollama list
```

---

### Error de conexión

Verificar endpoint:

```
http://localhost:11434/v1
```

---

### Modelo no encontrado

Verificar modelos instalados:

```bash
ollama list
```

---

# Ventajas de este setup

* 100% local
* sin costos de API
* privacidad total
* agentes multi-modelo
* compatible con MCP
* integración con herramientas de desarrollo

---


https://github.com/Gentleman-Programming/agent-teams-lite