<div align="center">

# 📊 E-Commerce Analytics

**Análisis de Pedidos en Comercio Electrónico**
*Tarea Final · Estructuras de Datos y Algoritmos 1 · UAO 2026-1*

[![Tests](https://img.shields.io/badge/tests-10%2F10%20passing-brightgreen)]()
[![PWA](https://img.shields.io/badge/PWA-installable-blueviolet)]()
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow)]()
[![Sin dependencias](https://img.shields.io/badge/dependencies-0-success)]()
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-black)]()

Aplicación web instalable como **PWA en Android e iOS** y exportable como **APK**, que resuelve el problema de ranking de clientes a partir de un alto volumen de transacciones de comercio electrónico, usando algoritmos de ordenamiento implementados desde cero.

[Demo en vivo](#-demo-y-despliegue) · [Uso rápido](#-cómo-probar) · [Arquitectura](#-arquitectura) · [Complejidad](#-análisis-de-complejidad)

</div>

---

## 📌 Tabla de contenidos

1. [Resumen del problema](#-resumen-del-problema)
2. [Características](#-características)
3. [Cómo probar](#-cómo-probar) ← *empieza aquí*
4. [Arquitectura](#-arquitectura)
5. [API: `calcularPedidos(caso)`](#-api-calcularpedidoscaso)
6. [Algoritmos implementados](#-algoritmos-implementados)
7. [Análisis de complejidad](#-análisis-de-complejidad)
8. [Resultados de benchmark](#-resultados-de-benchmark)
9. [Demo y despliegue](#-demo-y-despliegue)
10. [Generar APK](#-generar-apk-android)
11. [Estructura del repositorio](#-estructura-del-repositorio)
12. [Decisiones de diseño](#-decisiones-de-diseño)
13. [Equipo](#-equipo)

---

## 🎯 Resumen del problema

El comercio electrónico genera enormes volúmenes de transacciones. A partir de un string con `m` records (m ≥ 5):

```
customer producto categoría precio cantidad timestamp;customer ...
```

debemos producir un ranking de los `n` clientes únicos con su total gastado y su categoría favorita, ordenado por:

1. `totalSpent` ↓ *(descendente)*
2. `favoriteCategory` ↓
3. `customer` ↑ *(ascendente)*

**Restricciones del enunciado:**
- ✅ Función obligatoria `calcularPedidos(caso)` en `util.js`.
- ✅ App web frontend o backend en JavaScript con datos iniciales de prueba.
- ✅ Documento ≤5 páginas con análisis de complejidad en términos de `n`, `m`, `p`.
- ✅ Uso de algoritmos vistos en clase (no `Array.sort` nativo).

---

## ✨ Características

| | |
|---|---|
| 🧮 **Algoritmos propios** | MergeSort estable, QuickSort 3-way, RadixSort LSD, Insertion Sort. Cero dependencia del `sort` nativo. |
| 📈 **Dashboard interactivo** | Métricas en vivo, ranking en tabla, gráficos con Chart.js, salida cruda en formato del enunciado. |
| 🔬 **Benchmark integrado** | Compara los 5 algoritmos sobre escenarios m=1k–100k. Mide la fase de orden aislada. |
| 🧪 **Suite de tests** | 10 tests automatizados que corren tanto en Node como en el navegador. |
| 🎲 **Generador de casos** | LCG determinístico, parametrizado por (m, n, p, seed). |
| 📦 **PWA instalable** | Manifest + Service Worker con cache offline. Instala como app nativa en Android/iOS. |
| 📱 **Mobile-first** | Diseño responsive dark theme. Touch targets de ≥44px. |
| 🚀 **Sin build step** | Vanilla JS, HTML, CSS. Cero `npm install`. Deploy directo a cualquier hosting estático. |
| ⚙️ **CI/CD** | GitHub Actions corre los tests y despliega a Pages en cada push a `master`. |

---

## 🚀 Cómo probar

> **TL;DR**: para verlo funcionando en 30 segundos, abre `app/index.html` directamente en el navegador.

### Opción 1 — Abrir el HTML directo *(más rápido, sin requisitos)*

```bash
# Windows
start app/index.html
# macOS
open app/index.html
# Linux
xdg-open app/index.html
```

La app carga el ejemplo del PDF automáticamente y muestra el ranking, métricas y gráfico.

> ⚠️ El Service Worker (modo offline) no se activa con `file://`. Para probar PWA completa, usa la Opción 2.

---

### Opción 2 — Servidor estático local *(recomendado, prueba PWA)*

```bash
# Con Node (no requiere instalación previa)
npx http-server app -p 8080 -o

# o con Python 3
python -m http.server 8080 --directory app
```

Abre `http://localhost:8080`. En Chrome verás el botón **"Instalar app"** en el header → instalable como PWA.

---

### Opción 3 — Correr la suite de tests

```bash
node app/js/tests.js
```

Salida esperada:

```
  OK  Ejemplo del enunciado
  OK  Empate totalSpent → favoriteCategory desc
  OK  Empate doble → customer asc
  OK  Acumulación price*quantity
  OK  favoriteCategory = categoría con más transacciones
  OK  Tolerancia a espacios extra y ; al final
  OK  Ignora records mal formados
  OK  String vacío → salida vacía
  OK  Volumen 10k records sin errores
  OK  Estabilidad: orden determinístico ante empates

10/10 pasaron, 0 fallaron.
```

También puedes correr los tests desde la UI: tab **Tests → Correr tests**.

---

### Opción 4 — Benchmark CLI

```bash
node app/js/benchmark.js
```

Compara MergeSort vs QuickSort vs Array.sort vs Insertion vs Radix sobre tres escenarios (1k / 10k / 100k records).

---

### Opción 5 — Probar con tus propios datos

1. Abre la app, ve al tab **Datos**.
2. Pega un caso en el textarea, o:
3. Carga un CSV con cabecera `customer,product,category,price,quantity,timestamp`.
4. O genera datos sintéticos con sliders de m, n, p, seed.
5. Click en **Analizar**.

---

### Opción 6 — Probar como app móvil (PWA)

1. Despliega a GitHub Pages (ver [Demo y despliegue](#-demo-y-despliegue)).
2. Abre la URL en Chrome móvil.
3. Menú ⋮ → **"Agregar a pantalla de inicio"** → la app queda como un ícono más.
4. Funciona offline después de la primera carga.

---

## 🏗 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                       UI (app.js)                            │
│  Tabs: Análisis · Datos · Benchmark · Tests · Info           │
└──────┬──────────────────────────────────────────┬───────────┘
       │                                          │
       ▼                                          ▼
┌──────────────────┐                      ┌─────────────────┐
│  calcularPedidos │ ←── núcleo del       │   Generador     │
│    (util.js)     │     enunciado        │  (LCG seeded)   │
└──────┬───────────┘                      └─────────────────┘
       │ usa
       ├───────────────┐
       ▼               ▼
┌─────────────┐  ┌──────────────────┐
│   Parser    │  │   Algoritmos     │
│ (scan O(L)) │  │ MergeSort/Quick/ │
│             │  │ Radix/Insertion  │
└─────────────┘  └──────────────────┘
       ▲                  ▲
       │                  │
       └──────┬───────────┘
              │
       ┌──────┴────────┐         ┌──────────┐
       │  Benchmark    │         │  Tests   │
       │ (5 algos)     │         │  (10)    │
       └───────────────┘         └──────────┘
```

**Sin dependencias en runtime**: solo Chart.js (CDN, opcional, no rompe sin él).
**Sin build**: los `<script>` se cargan en orden directo desde HTML.

---

## 📐 API: `calcularPedidos(caso)`

### Firma

```js
calcularPedidos(caso: string): string
```

### Ejemplo

```js
const caso = 'Customer1 Laptop Technology 3000 1 10;'
           + 'Customer2 Shirt Clothing 50 2 12;'
           + 'Customer1 Mouse Technology 100 1 15;'
           + 'Customer2 Shoes Clothing 200 1 20;'
           + 'Customer3 TV Technology 2500 1 25';

calcularPedidos(caso);
// → '1) Customer1 3100 Technology
//    2) Customer3 2500 Technology
//    3) Customer2 300 Clothing'
```

### Contrato

| | |
|---|---|
| **Entrada** | String con `m ≥ 5` records separados por `;`. Cada record: `customer product category price quantity timestamp`. |
| **Salida** | String con `n` líneas: `[a]) customer [totalSpent] [favoriteCategory]`. |
| **Orden** | (1) totalSpent ↓ · (2) favoriteCategory ↓ · (3) customer ↑ |
| **Tolerancia** | Espacios extra, `;` final, records mal formados se ignoran sin lanzar excepción. |

---

## 🧮 Algoritmos implementados

Todos en `app/js/algoritmos.js`, sin librerías externas:

| Algoritmo | Tiempo | Espacio | Estable | Rol en el proyecto |
|---|---|---|---|---|
| **MergeSort** bottom-up | O(n log n) | O(n) | ✅ | Producción — ordena el ranking final |
| **QuickSort** 3-way (Dutch flag) | O(n log n) prom · O(n²) peor | O(log n) | ❌ | Comparativo en benchmark |
| **RadixSort** LSD base 256 | O(d·n) | O(n+b) | ✅ | Demostrativo (sólo `totalSpent`) |
| **Insertion Sort** | O(n²) peor · O(n) mejor | O(1) | ✅ | Baseline didáctico |

Más utilidades:
- `compararStrings(a, b)` — comparación lexicográfica O(min) sin `localeCompare`.
- `comparadorClientes(a, b)` — encapsula los 3 criterios del enunciado.

---

## 📊 Análisis de complejidad

Sea **m** = #records, **n** = #customers, **p** = #categorías, **k** = longitud media de campo.

| Fragmento | Tiempo | Espacio |
|---|---|---|
| `parsearCaso(caso)` | O(m·k) | O(m) |
| Acumulación por cliente (`Map`) | O(m) | O(n·p) |
| Cálculo de `favoriteCategory` | O(n·p) | — |
| `mergeSort(clientes, cmp)` | O(n log n) | O(n) |
| Formateo + `join` | O(n·k) | O(n·k) |

**Total temporal**: `O(m·k + n·p + n log n + n·k)` ≈ **`O(m + n·p + n log n)`** asumiendo `k` constante.

**Total espacial**: `O(m + n·p)`.

> Análisis detallado en [`docs/COMPLEJIDAD.md`](docs/COMPLEJIDAD.md).

---

## ⏱ Resultados de benchmark

Mediciones reales con `node app/js/benchmark.js` en escenario realista:

```
== m=100000, n=2000, p=10 → 2000 clientes ==
   1.482 ms  MergeSort propio (estable)        ← producción
   1.479 ms  QuickSort 3-way propio
   0.384 ms  Array.sort nativo (V8 — TimSort en C++)
   6.095 ms  Insertion Sort propio
   1.128 ms  RadixSort LSD (sólo criterio 1)
```

**Conclusión**: nuestro MergeSort propio es **competitivo** (~4× más lento que el nativo de C++, esperable). Para volúmenes ≤100k registros, el cuello de botella **no** es el orden sino el parseo.

---

## 🌐 Demo y despliegue

### GitHub Pages (configurado y automático)

El workflow `.github/workflows/deploy-pages.yml` despliega `app/` en cada push a `master`.

**Activación (una sola vez)**:

1. Ir a `Settings → Pages` del repo.
2. En **Source** seleccionar **"GitHub Actions"**.
3. Guardar.

**URL final**: `https://jorgeeduquinones-boop.github.io/TareaFinal_EDyA1/`

### Otros hostings (opcional)

| Plataforma | Comando / Config |
|---|---|
| **Vercel** | Importar repo · Root Dir: `app` · Framework: Other |
| **Netlify** | Importar repo · Publish dir: `app` |
| **Cloudflare Pages** | Importar repo · Build output: `app` |
| **Firebase Hosting** | `firebase init hosting` con `public: app` |

---

## 📱 Generar APK (Android)

La app es PWA estándar, así que cualquier empaquetador funciona:

### Opción A — PWABuilder *(sin código, recomendado)*

1. Visitar https://www.pwabuilder.com.
2. Pegar la URL pública de la app.
3. **Package for stores → Android**.
4. Descargar la APK firmada.

> PWABuilder genera automáticamente los iconos PNG en todas las resoluciones a partir del `icon.svg`.

### Opción B — Bubblewrap CLI *(oficial de Google)*

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://<url>/manifest.json
bubblewrap build
```

---

## 📁 Estructura del repositorio

```
.
├── README.md
├── vercel.json
├── .github/workflows/deploy-pages.yml    ← CI/CD
├── docs/
│   └── COMPLEJIDAD.md                    ← análisis detallado
├── TareaFinal_EDyA1/                     ← entrega original (baseline preservado)
│   ├── TareaFinal_EDyA1_2026_1.pdf
│   ├── index.html
│   └── util.js
└── app/                                  ← aplicación web desplegable
    ├── index.html                        ← dashboard (5 paneles)
    ├── manifest.json                     ← PWA manifest
    ├── service-worker.js                 ← cache offline
    ├── 404.html
    ├── icons/icon.svg
    ├── css/styles.css                    ← dark theme · mobile-first
    └── js/
        ├── algoritmos.js                 ← MergeSort · Quick · Radix · Insertion
        ├── parser.js                     ← scan O(L)
        ├── util.js                       ← calcularPedidos (REQUERIDA)
        ├── generador.js                  ← LCG seeded
        ├── benchmark.js                  ← compara 5 algoritmos
        ├── tests.js                      ← 10 tests (Node + browser)
        └── app.js                        ← UI logic
```

---

## 🧠 Decisiones de diseño

### 1. `favoriteCategory` = categoría con más **transacciones**

Interpretamos "categoría en la que más compras realizó" como número de records (= transacciones), no suma de `quantity` ni gasto. **Justificación**: una compra = una transacción. En el ejemplo del PDF las tres interpretaciones coinciden, así que esta es la más simple y defendible.

**Empate de frecuencia** → gana la categoría lexicográficamente mayor (consistente con el criterio 2 del orden global).

### 2. MergeSort estable como ordenamiento de producción

El enunciado exige usar algoritmos vistos en clase. MergeSort:
- Garantiza O(n log n) en el peor caso (vs QuickSort O(n²) peor).
- Es **estable** → la implementación bottom-up con un solo comparador multi-criterio es eficiente y predecible.

### 3. Parser sin `String.split`

`split(';')` seguido de `split(' ')` por record genera ~7m strings intermedios y dispara presión de GC. El scan manual carácter a carácter es O(L) con asignaciones mínimas (solo `m` strings finales).

### 4. Vanilla JS, sin build step

- Cero `package.json` → cero `npm install` → cero supply chain.
- Cualquier hosting estático lo sirve sin configuración.
- El profe puede leer todo el código sin pelearse con bundlers.

### 5. PWA sobre Capacitor/React Native

- Una sola codebase corre en web + Android + iOS.
- Sin SDKs nativos, sin Android Studio, sin Xcode.
- Instalable directamente desde el navegador.

---

## 👥 Equipo

| Rol | Nombre | Código |
|---|---|---|
| Integrante 1 | _por completar_ | _por completar_ |
| Integrante 2 | _por completar_ | _por completar_ |
| Integrante 3 | _por completar_ | _por completar_ |

**Curso**: Estructuras de Datos y Algoritmos 1 · UAO 2026-1
**Docente**: Orlando Arboleda Molina, Msc.
**Entrega**: 17 de mayo de 2026, 11pm · UAOVirtual.

---

<div align="center">

*Construido con HTML, CSS y JavaScript puro. Sin frameworks. Sin excusas.*

</div>
