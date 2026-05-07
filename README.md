# Análisis de Pedidos en Comercio Electrónico — EDyA1

App web (instalable como **PWA en Android/iOS** y exportable como **APK** con PWABuilder) para resolver la **Tarea Final del curso Estructuras de Datos y Algoritmos 1**, Universidad Autónoma de Occidente, semestre 2026-1, profesor Orlando Arboleda Molina.

Implementa la función `calcularPedidos(caso)` requerida por el enunciado y la envuelve en un dashboard interactivo con visualizaciones, generador de casos sintéticos, benchmark de algoritmos de ordenamiento y suite de tests.

---

## Estructura

```
tareaAlgoritmos/
├── README.md
├── TareaFinal_EDyA1/             ← entrega original del compañero (baseline intacto)
│   ├── TareaFinal_EDyA1_2026_1.pdf
│   ├── index.html
│   └── util.js
├── app/                          ← aplicación web desplegable
│   ├── index.html                ← dashboard con 5 paneles
│   ├── manifest.json             ← PWA: instalable como app
│   ├── service-worker.js         ← funciona offline
│   ├── css/styles.css            ← dark theme, mobile-first
│   ├── icons/icon.svg            ← ícono SVG
│   └── js/
│       ├── algoritmos.js         ← MergeSort, QuickSort, Radix, Insertion (propios)
│       ├── parser.js             ← scan O(L) sin String.split
│       ├── util.js               ← calcularPedidos(caso) — exigida por el enunciado
│       ├── generador.js          ← casos sintéticos parametrizados (LCG)
│       ├── benchmark.js          ← comparación empírica de ordenamientos
│       ├── tests.js              ← suite de tests (Node + navegador)
│       └── app.js                ← lógica de UI
└── docs/COMPLEJIDAD.md           ← análisis de complejidad detallado
```

---

## Cómo correr

### Opción A — Localmente sin instalar nada
Abrir `app/index.html` directamente en el navegador. Funciona aunque algunas features de PWA (service worker) requieren servidor.

### Opción B — Con servidor estático local
```bash
# Cualquier servidor estático apuntando a app/. Por ejemplo:
npx http-server app -p 8080
# o
python -m http.server 8080 --directory app
```
Luego abrir http://localhost:8080.

### Opción C — Tests
```bash
node app/js/tests.js
# Salida esperada: 10/10 pasaron, 0 fallaron.
```

### Opción D — Benchmark CLI
```bash
node app/js/benchmark.js
```

---

## Despliegue remoto

### GitHub Pages (gratis, ideal para esta app)
1. Crear repo en GitHub (público o privado).
2. `git remote add origin https://github.com/<usuario>/<repo>.git && git push -u origin main`
3. En el repo: **Settings → Pages → Source: Deploy from a branch → main / `/app`** (la carpeta `app` será la raíz del sitio).
4. Esperar 1–2 min. La app queda en `https://<usuario>.github.io/<repo>/`.

### Vercel / Netlify
- Vercel: importar el repo, **Root Directory: `app`**, framework "Other", deploy.
- Netlify: idem, **Publish directory: `app`**.

---

## Convertir a APK (Android)

La app es una PWA estándar, así que cualquier herramienta de empaquetado funciona:

1. **PWABuilder** (recomendado, sin código): https://www.pwabuilder.com → pegar URL desplegada → "Package for stores" → Android → descargar APK firmada.
2. **Bubblewrap** (CLI oficial Google): `npm i -g @bubblewrap/cli && bubblewrap init --manifest=https://<url>/manifest.json && bubblewrap build`.

> Nota: PWABuilder genera automáticamente los iconos PNG en todas las resoluciones requeridas a partir del SVG.

---

## Función `calcularPedidos(caso)` — análisis

### Entrada
String con `m` records (m ≥ 5) separados por `;`. Cada record:
```
customer product category price quantity timestamp
```

### Salida
String de `n` líneas con formato `[a]) customer [totalSpent] [favoriteCategory]` ordenadas por:
1. `totalSpent` descendente
2. `favoriteCategory` descendente
3. `customer` ascendente

### Complejidad (n = customers, m = records, p = categorías, k = long. media de campo)

| Fragmento | Complejidad | Implementación |
|---|---|---|
| Parseo del caso | **O(m·k)** | `parser.js` — scan de un solo paso |
| Acumulación por cliente | **O(m)** | `Map` nativo, O(1) amortizado |
| `favoriteCategory` por cliente | **O(n·p)** | recorre las categorías del cliente |
| Ordenamiento (MergeSort) | **O(n log n)** | `algoritmos.js` — propio, estable |
| Formateo de salida | **O(n·k)** | concatenación + `join` |

**Complejidad total**: `O(m·k + n·p + n log n + n·k)` ≈ **O(m + n·p + n log n)** asumiendo `k` constante.

### Algoritmos implementados (todos propios, sin `Array.sort`)

| Algoritmo | Tiempo | Espacio | Estable | Uso |
|---|---|---|---|---|
| **MergeSort** bottom-up | O(n log n) | O(n) | sí | producción |
| **QuickSort 3-way** | O(n log n) prom. | O(log n) | no | comparativo |
| **RadixSort LSD** base 256 | O(d·n) | O(n+b) | sí | demostrativo (totalSpent) |
| **Insertion Sort** | O(n²) / O(n) | O(1) | sí | baseline |

---

## Decisión de diseño: `favoriteCategory`

El enunciado dice "la categoría en la que más compras realizó". Interpretamos **compra = transacción** (un record = una compra). El conteo es por número de records, no por `quantity`. En empate de frecuencia, gana la categoría lexicográficamente mayor (consistente con el criterio 2 del orden global). Esta decisión se justifica en el documento entregable.

---

## Entregable del curso

El documento PDF (≤5 páginas) requerido por la tarea debe incluir:
- Portada con códigos, nombres, grupo, asignatura, docente, facultad.
- Resumen del enunciado (≤10 líneas).
- Pseudocódigo / código de `calcularPedidos`.
- Complejidades individuales y total (ver `docs/COMPLEJIDAD.md`).

**Fecha límite**: domingo 17 de mayo de 2026, 11pm, en UAOVirtual.
