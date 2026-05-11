# Guía de la App — Análisis de Pedidos en Comercio Electrónico

**Tarea Final EDyA1 · UAO 2026-1 · Prof. Orlando Arboleda Molina, Msc.**

Este documento describe qué es el proyecto, cómo está organizado y qué hace
cada página y cada módulo de código.

---

## 1. ¿Qué es la app?

Una **aplicación web instalable (PWA)** que resuelve el enunciado de la Tarea
Final del curso: dado un string con `m` records de pedidos, calcula el
**ranking de clientes** por gasto total, categoría favorita y nombre.

La función pedida por el profesor — `calcularPedidos(caso)` — es la misma en
todo el proyecto. Lo que cambia es **cómo se le presenta al usuario**:

| Cara del proyecto | Para quién | Tono |
|---|---|---|
| `TareaFinal_EDyA1/` | el profesor | académico, minimalista, igual al estilo de las prácticas |
| `app/index.html` | desarrollador / corrector técnico | dashboard con métricas, gráficos, benchmark y tests |
| `app/inicio.html` | dueño de tienda | wizard de 3 pasos, lenguaje cotidiano, insights |

---

## 2. Estructura del repositorio

```
tareaAlgoritmos/
├── TareaFinal_EDyA1/        ← Entregable académico al profesor
│   ├── index.html
│   ├── util.js              entry: calcularPedidos()
│   ├── TareaFinal_EDyA1_2026_1.pdf
│   └── Scripts/             módulos ES (estilo Práctica 5)
│       ├── Pedido.js
│       ├── Cliente.js
│       ├── comparadores.js
│       ├── ordenamientos.js
│       ├── busqueda.js
│       ├── recursividad.js
│       └── parser.js
│
├── app/                     ← App web completa (PWA)
│   ├── index.html           modo desarrollador (5 tabs)
│   ├── inicio.html          modo usuario final (wizard)
│   ├── 404.html             redirect
│   ├── manifest.json        manifest PWA
│   ├── service-worker.js    cache offline
│   ├── css/                 styles.css + inicio.css
│   ├── icons/               icon.svg
│   └── js/                  algoritmos, util, parser, ...
│
├── clases/                  Material del curso (referencia)
│   ├── PracticaEDyA1_4_Recursividad/
│   ├── PracticaEDyA1_5_Ordenamiento/
│   ├── PracticaEDyA1_5_OrdenamientoSort/
│   └── PracticaEDyA1_6_Busqueda/
│
└── docs/                    Documentación
    ├── COMPLEJIDAD.md
    ├── guia-de-la-app.md                       (este archivo)
    └── TareaFinal_EDyA1_Presentacion.pptx
```

---

## 3. Páginas

### 3.1 `TareaFinal_EDyA1/index.html` — Entregable académico

**URL:** abrir como módulo ES (servir por HTTP, no `file://`).

La página que el profesor evalúa. Idéntica en estilo a las prácticas del curso:
tabla de inputs, botón, área de salida.

| Elemento | Función |
|---|---|
| `<textarea id="inputCaso">` | el corrector pega el caso de prueba |
| `<button id="btnCalcular">` | dispara `calcularPedidos(caso)` |
| `<pre id="output">` | muestra el ranking en el formato exacto del enunciado |

Carga `util.js` como `<script type="module">`, que a su vez importa los
módulos de `Scripts/`. El módulo expone `window.calcularPedidos` para
permitir testing externo sin reimportar.

---

### 3.2 `app/index.html` — Modo Desarrollador

**URL:** `app/index.html`. Es el dashboard técnico con **5 pestañas**:

#### 📈 Tab "Análisis"
Resultado del último análisis ejecutado. Contiene:
- **Métricas tope:** total de records, número de clientes, total facturado, top cliente.
- **🏆 Ranking de clientes:** tabla con el resultado de `calcularPedidos`, con botón "Exportar CSV".
- **💰 Top clientes por gasto:** gráfico de barras (Chart.js).
- **🏷️ Distribución por categoría:** gráfico doughnut.
- **📜 Salida cruda:** el string exacto que devuelve `calcularPedidos`, con botón "Copiar".

#### 📥 Tab "Datos"
Tres formas de cargar entrada:
- **Textarea** para pegar manualmente el caso.
- **"Cargar ejemplo del PDF"** — caso de 5 records del enunciado oficial.
- **Subir CSV** o **arrastrar y soltar** un archivo (cabecera `customer,product,category,price,quantity,timestamp`).
- **Generador sintético:** parámetros `m`, `n`, `p`, `seed` para crear datos reproducibles a gran escala.

#### ⚡ Tab "Benchmark"
Compara empíricamente los **cuatro ordenamientos propios** contra `Array.sort`
nativo de V8. Parámetros: `m`, `n`, `p`.

Mide *solo* la fase de ordenamiento (parseo y agregación se hacen una vez
fuera del cronómetro) y reporta tiempo y velocidad relativa.

Algoritmos comparados:
- MergeSort bottom-up (estable)
- QuickSort 3-way (pivote aleatorio)
- RadixSort LSD base 256
- Insertion Sort
- Array.sort nativo (referencia)

#### 🧪 Tab "Tests"
Suite automatizada que valida correctitud:
- Caso del PDF (debe coincidir exactamente).
- Empate en `totalSpent` → desempate por `favoriteCategory` desc.
- Empate doble → desempate por `customer` asc.
- Entradas mal formadas (records sin 6 campos, separadores extra).
- Volumen alto (10.000 records) — verifica que no haya stack overflow.

#### ℹ️ Tab "Info"
Documentación inline para el corrector:
- **Sobre el proyecto:** contexto, equipo, propósito.
- **Análisis de complejidad:** tabla con la complejidad por fragmento.
- **Algoritmos implementados:** lista de los ordenamientos propios.

#### Acciones globales del header
- 🛍️ Icono que lleva a `inicio.html` (modo usuario final).
- 🌙/☀️ Toggle de tema claro/oscuro (se persiste en `localStorage`).
- ⬇ Instalar app (botón que aparece cuando el navegador detecta PWA instalable).

---

### 3.3 `app/inicio.html` — Modo Usuario Final (dueño de tienda)

**URL:** `app/inicio.html`. Misma lógica de cálculo, pero envuelta en un
**wizard de 3 pasos** con lenguaje cotidiano (sin jerga técnica).

#### Paso 1 — Bienvenida
Landing con hero, badges de "análisis simple en 3 clicks", y tres features:
- ⚡ Resultados al instante (procesamiento local)
- 🔒 Datos no salen del dispositivo
- 📱 Funciona en celular como app

Dos CTAs: **"Empezar ahora"** o **"Ver con datos de ejemplo"**.

#### Paso 2 — Cargar datos
Tres tarjetas de elección:
- **Probar con datos de ejemplo** → genera la "Tienda Demo" con 5.000 ventas sintéticas.
- **Subir mi archivo CSV** → file picker con cabecera esperada.
- **Pegar mis ventas a mano** → revela textarea con formato del enunciado.

#### Paso 3 — Resultados
Vista orientada a decisiones de negocio:
- **Big numbers:** total facturado, número de clientes, ticket promedio, categoría estrella.
- **🏆 Tus mejores clientes:** grilla de tarjetas (top N) con totalSpent + categoría favorita, exportable a CSV.
- **💡 Lo que descubrimos:** insights generados a partir del ranking (ej. "El 20% de tus clientes genera el X% de los ingresos").
- **🎯 Qué hacer ahora:** recomendaciones accionables (premiar al top, reactivar inactivos).
- **📈 Charts:** "¿De dónde vienen tus ingresos?" (categorías) y "Top clientes por gasto".

Acciones: **🔄 Nuevo análisis** y **⬇ Descargar reporte**.

Header con icono ⚙️ para volver al modo desarrollador.

---

### 3.4 `app/404.html` — Redirect

Página de respaldo. Hace `<meta http-equiv="refresh">` a `index.html`.
Permite a hostings tipo GitHub Pages devolver siempre la app aunque la URL
sea inválida.

---

## 4. Módulos JavaScript (`app/js/`)

### `algoritmos.js`
Cuatro ordenamientos propios + comparadores, **sin usar `Array.sort`**:
- `compararStrings(a, b)` — comparación lexicográfica por código de carácter (sin `localeCompare`).
- `comparadorClientes(a, b)` — comparador multi-criterio (totalSpent desc, favoriteCategory desc, name asc).
- `mergeSort(arr, cmp)` — bottom-up, estable, O(n log n) garantizado. **Usado en producción.**
- `quickSort3W(arr, cmp)` — Dutch National Flag con pivote aleatorio, in-place.
- `radixSortPorTotalSpentDesc(arr)` — LSD base 256, estable.
- `insertionSort(arr, cmp)` — baseline didáctico.

### `parser.js`
`parsearCaso(caso)` recibe el string completo y devuelve `Pedido[]`.
Scan **carácter a carácter** sin `split`, para evitar strings intermedios
y bajar presión sobre el GC en entradas grandes (O(L) un solo recorrido).

### `util.js`
La función pedida por el enunciado: **`calcularPedidos(caso)`**. Orquesta
parseo → agregación con `Map` → cálculo de favoriteCategory →
`mergeSort` → formateo. Análisis de complejidad inline en comentarios.

### `generador.js`
`Generador.generarCaso({ m, n, p, seed })` produce un caso sintético
reproducible. Usa un **LCG determinístico** (Numerical Recipes) para que
con la misma seed siempre se obtenga el mismo string.

### `benchmark.js`
Construye una vez la lista de clientes (sin ordenar) y ejecuta cada
algoritmo midiendo solo la fase de ordenamiento. Usa `performance.now()`
en navegador y `process.hrtime` en Node. Verifica correctitud cruzada.

### `tests.js`
Mini-framework `test/assertEq` con casos del enunciado, empates,
malformados y volumen alto. Corre en Node (`node app/js/tests.js`) y
desde la pestaña 🧪 Tests de la app.

### `app.js`
Lógica de la UI del **modo desarrollador**: navegación entre tabs,
manejo de tema, atajos de teclado, drag&drop CSV, integración con
Chart.js, exportación a CSV, gestión del botón de instalación PWA.

### `inicio.js`
Lógica de la UI del **modo usuario final**: navegación entre pasos del
wizard, generación de insights humanos a partir del ranking,
recomendaciones, render de gráficos con Chart.js, descarga de reporte.

### `service-worker.js`
Cachea todos los assets (HTML, CSS, JS, ícono) para uso **offline**.
Estrategia *cache-first* para assets locales y *network-first* para
Chart.js (CDN). Cache versionado en `pedidos-edya1-v3`.

---

## 5. Otros archivos

- **`app/manifest.json`** — Manifest PWA: nombre, ícono, color de tema,
  `display: standalone`. Permite instalar la app en el escritorio o
  celular como aplicación nativa.
- **`app/icons/icon.svg`** — Ícono escalable de la app.
- **`app/css/styles.css`** — Estilos base con tokens dual-theme (light/dark),
  glassmorphism, animaciones de blobs de fondo, layout responsive.
- **`app/css/inicio.css`** — Estilos específicos del wizard (hero, choice
  cards, big numbers, customer grid).

---

## 6. Flujos típicos

### Para el profesor (evaluación)
1. Abrir `TareaFinal_EDyA1/index.html` servido por HTTP.
2. Pegar el caso de prueba en el textarea.
3. Clic en "Calcular ranking" → ver el resultado.
4. Revisar `util.js` y `Scripts/` para auditar el código.
5. Leer el PDF de complejidades anexo al entregable.

### Para el desarrollador (auditoría técnica)
1. Abrir `app/index.html`.
2. Tab **Datos** → "Cargar ejemplo del PDF".
3. Tab **Análisis** → verificar ranking + gráficos.
4. Tab **Benchmark** → comparar algoritmos con `m=20000, n=500, p=8`.
5. Tab **Tests** → correr la suite, esperar todos en verde.

### Para el dueño de tienda (uso real)
1. Abrir `app/inicio.html`.
2. Clic en "Empezar ahora" → "Probar con datos de ejemplo".
3. Leer la página de resultados: top clientes, insights, recomendaciones.
4. Clic en "Descargar reporte" para guardar el análisis.

---

## 7. Cómo correr la app localmente

Por los módulos ES en `TareaFinal_EDyA1/`, abrir con `file://` no funciona.
Servir por HTTP:

```bash
# Desde la raíz del repo:
npx serve .
# o:
python -m http.server 8000
```

Luego abrir:
- `http://localhost:8000/TareaFinal_EDyA1/` (entregable académico)
- `http://localhost:8000/app/` (dashboard técnico)
- `http://localhost:8000/app/inicio.html` (modo usuario final)
