# Análisis de Pedidos en Comercio Electrónico

**Tarea Final — Estructuras de Datos y Algoritmos 1**
Universidad Autónoma de Occidente · Facultad de Ingeniería y Ciencias Básicas · 2026‑1
Profesor: Orlando Arboleda Molina, Msc.

| Grupo EDyA1 | Integrantes | Código UAO |
|---|---|---|
| **1** | Joan Mateo Cardona | 2243431 |
| | Danna Villegas | 2240027 |
| | Jorge Eduardo Álvarez | 2230610 |

**Demo en vivo:** [`tarea-final-e-dy-a1.vercel.app/app/index.html`](https://tarea-final-e-dy-a1.vercel.app/app/index.html)
**Repositorio:** [`github.com/jorgeeduquinones-boop/TareaFinal_EDyA1`](https://github.com/jorgeeduquinones-boop/TareaFinal_EDyA1)
**Entrega:** 17 de mayo de 2026 — 11:00 PM (UAOVirtual) · Sustentación: semana 16.

---

## 1. Resumen del enunciado

Dado un caso compuesto por `m` records (`m ≥ 5`) separados por punto y coma, donde cada record sigue el formato

```
customer product category price quantity timestamp
```

la función `calcularPedidos(caso)` debe retornar el ranking de los `n` clientes únicos (`n ≥ 3`) en el formato:

```
[a]) customer [totalSpent] [favoriteCategory]
```

Criterios de orden:

1. `totalSpent` descendente — suma de `price · quantity`.
2. `favoriteCategory` descendente — categoría con más transacciones del cliente.
3. `customer` ascendente — desempate final.

Restricciones del enunciado: la función debe estar escrita en `util.js`, debe usar algoritmos vistos en clase (Prácticas 4, 5 y 6) y el aplicativo debe correr en JavaScript sin errores de compilación.

## 2. Estructura del proyecto

El repositorio contiene **dos implementaciones** complementarias que comparten la misma especificación:

| Carpeta | Audiencia | Propósito |
|---|---|---|
| `TareaFinal_EDyA1/` | Profesor / evaluador | Entregable académico. Misma estructura modular que las prácticas del curso. |
| `app/` | Evaluador técnico / usuario | Aplicación web instalable (PWA) con dashboard, generador de casos, benchmark y suite de pruebas. |

Ambas resuelven el enunciado de forma idéntica; difieren únicamente en presentación y en el algoritmo de orden seleccionado (ver §4).

```
.
├── README.md
├── index.html                            ← landing
├── vercel.json
├── .github/workflows/deploy-pages.yml    ← CI/CD a GitHub Pages
├── docs/
│   ├── Tarea_Final_EDyA1_Entregable.docx ← documento de entrega
│   ├── COMPLEJIDAD.md                    ← análisis ampliado
│   ├── TareaFinal_EDyA1_Presentacion.pptx
│   └── _build_docx.py                    ← regenerador del .docx
├── TareaFinal_EDyA1/                     ← entregable académico
│   ├── TareaFinal_EDyA1_2026_1.pdf
│   ├── index.html
│   ├── util.js                           ← calcularPedidos (QuickSort recursivo)
│   └── Scripts/
│       ├── Pedido.js
│       ├── Cliente.js                    ← clase con toString() (Práctica 5)
│       ├── parser.js
│       ├── comparadores.js
│       ├── ordenamientos.js              ← QuickSort recursivo (Práctica 5)
│       ├── busqueda.js                   ← búsqueda binaria recursiva (Práctica 6)
│       └── recursividad.js               ← funciones recursivas (Práctica 4)
├── app/                                  ← aplicación web (PWA)
│   ├── index.html
│   ├── inicio.html
│   ├── manifest.json
│   ├── service-worker.js
│   ├── icons/icon.svg
│   ├── css/
│   └── js/
│       ├── algoritmos.js                 ← MergeSort · QuickSort 3-way · Radix · Insertion
│       ├── parser.js
│       ├── util.js                       ← calcularPedidos (MergeSort estable)
│       ├── generador.js                  ← LCG determinístico
│       ├── benchmark.js
│       ├── tests.js                      ← suite de pruebas
│       ├── app.js
│       ├── inicio.js
│       └── icons.js
└── clases/                               ← material de prácticas del curso
```

## 3. Cómo correr el proyecto

### Entregable académico (`TareaFinal_EDyA1/`)

`util.js` se carga como módulo ES, por lo que no funciona con `file://`. Servir por HTTP desde la raíz del repositorio:

```bash
python3 -m http.server 8000
```

Abrir `http://localhost:8000/TareaFinal_EDyA1/` y usar el textarea para pegar un caso.

### Dashboard PWA (`app/`)

```bash
# Opción 1: servir solo la carpeta de la app
npx http-server app -p 8080 -o

# Opción 2: servir todo el repo
python3 -m http.server 8080
```

Abrir `http://localhost:8080/app/`. En Chrome aparece el botón **Instalar app** en el encabezado.

### Suite de pruebas

```bash
node app/js/tests.js
```

Resultado esperado:

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

### Benchmark

```bash
node app/js/benchmark.js
```

Compara MergeSort, QuickSort 3‑way, RadixSort, Insertion Sort y `Array.sort` nativo sobre tres escenarios (1 000 / 10 000 / 100 000 records). Mide únicamente la fase de ordenamiento.

## 4. Función `calcularPedidos(caso)`

Firma:

```js
calcularPedidos(caso: string): string
```

Ejemplo del enunciado:

```js
const caso =
  'Customer1 Laptop Technology 3000 1 10;' +
  'Customer2 Shirt Clothing 50 2 12;' +
  'Customer1 Mouse Technology 100 1 15;' +
  'Customer2 Shoes Clothing 200 1 20;' +
  'Customer3 TV Technology 2500 1 25';

calcularPedidos(caso);
// '1) Customer1 3100 Technology
//  2) Customer3 2500 Technology
//  3) Customer2 300 Clothing'
```

Contrato:

| Aspecto | Descripción |
|---|---|
| Entrada | String con `m ≥ 5` records separados por `;`. |
| Salida | String con `n` líneas en formato `[a]) customer [totalSpent] [favoriteCategory]`. |
| Orden | (1) `totalSpent` descendente · (2) `favoriteCategory` descendente · (3) `customer` ascendente. |
| Robustez | Records mal formados, espacios extra y `;` final se ignoran sin lanzar excepción. |

## 5. Algoritmos implementados

Las dos versiones de `calcularPedidos` usan algoritmos vistos en clase, sin recurrir a `Array.sort`:

| Implementación | Archivo | Ordenamiento | Justificación |
|---|---|---|---|
| Entregable académico | `TareaFinal_EDyA1/util.js` + `Scripts/ordenamientos.js` | QuickSort recursivo con mediana de tres + Insertion Sort en particiones pequeñas | Sigue el esquema `particion_por_Nombre` / `quickSort_por_Nombre` de la Práctica 5. |
| Dashboard PWA | `app/js/util.js` + `app/js/algoritmos.js` | MergeSort bottom‑up estable | Garantiza `O(n log n)` en el peor caso y permite comparación multi‑criterio sin desempates secundarios. |

El entregable incluye además los módulos de las Prácticas 4 y 6 expuestos desde `util.js`:

| Módulo | Función | Práctica |
|---|---|---|
| `Scripts/busqueda.js` | `busquedaBinariaPorNombre` (recursiva), `consultarRanking` | 6 |
| `Scripts/recursividad.js` | `sumaTotalRecursiva`, `contarClientesPremium`, `topClienteRecursivo` | 4 |

Las utilidades `posicionDeCliente(ranking, name)` y `resumenAgregado(ranking, umbral)` exportadas por `util.js` aplican estos módulos sobre el ranking ya calculado.

El dashboard expone cuatro ordenamientos propios para el benchmark:

| Algoritmo | Tiempo | Espacio | Estable | Uso |
|---|---|---|---|---|
| MergeSort bottom‑up | `O(n log n)` | `O(n)` | Sí | Producción del dashboard |
| QuickSort 3‑way (Dutch flag) | `O(n log n)` prom · `O(n²)` peor | `O(log n)` | No | Comparativo |
| RadixSort LSD base 256 | `O(d · n)` | `O(n + b)` | Sí | Demostrativo (solo `totalSpent`) |
| Insertion Sort | `O(n²)` peor · `O(n)` mejor | `O(1)` | Sí | Baseline didáctico |

## 6. Análisis de complejidad

Sean `m` = número de records, `n` = número de clientes únicos, `p` = número de categorías, `k` = longitud media de un campo.

| Fragmento | Tiempo | Espacio |
|---|---|---|
| `parsearCaso(caso)` | `O(m · k)` | `O(m)` |
| Acumulación por cliente | `O(m)` | `O(n · p)` |
| Cálculo de `favoriteCategory` | `O(n · p)` | — |
| Ordenamiento (QuickSort o MergeSort) | `O(n log n)` | `O(log n)` o `O(n)` |
| Formateo de salida | `O(n · k)` | `O(n · k)` |

**Complejidad temporal total:** `O(m·k + n·p + n log n)` ≈ `O(m + n·p + n log n)` asumiendo `k` constante.
**Complejidad espacial total:** `O(m + n·p)`.

Análisis ampliado en [`docs/COMPLEJIDAD.md`](docs/COMPLEJIDAD.md).

## 7. Resultados de benchmark

Mediciones obtenidas con `node app/js/benchmark.js` sobre un escenario de 100 000 records y 2 000 clientes:

```
== m=100000, n=2000, p=10 → 2000 clientes ==
   1.482 ms  MergeSort propio (estable)
   1.479 ms  QuickSort 3-way propio
   0.384 ms  Array.sort nativo (V8 — TimSort en C++)
   6.095 ms  Insertion Sort propio
   1.128 ms  RadixSort LSD (solo criterio 1)
```

El MergeSort propio se mantiene competitivo: aproximadamente cuatro veces más lento que `Array.sort` nativo (compilado en C++), lo cual es esperado al implementar el algoritmo en JavaScript puro. Para volúmenes de hasta 100 000 records el cuello de botella real es el parseo, no el ordenamiento.

## 8. Arquitectura del proyecto

```
                ┌──────────────────────────────────┐
                │           UI (app.js)            │
                │  Tabs: Resultados · Datos ·      │
                │  Benchmark · Tests · Docs        │
                └──────┬───────────────────┬───────┘
                       │                   │
                       ▼                   ▼
              ┌─────────────────┐   ┌────────────────┐
              │ calcularPedidos │   │   Generador    │
              │   (util.js)     │   │ (LCG seeded)   │
              └────┬────────────┘   └────────────────┘
                   │
         ┌─────────┼─────────────┐
         ▼         ▼             ▼
   ┌───────────┐ ┌──────────────────┐ ┌───────────────┐
   │  Parser   │ │   Algoritmos     │ │ Comparadores  │
   │ (scan L)  │ │ MergeSort/Quick/ │ │   y orden     │
   │           │ │ Radix/Insertion  │ │  multi‑crit.  │
   └───────────┘ └──────────────────┘ └───────────────┘
                   ▲                ▲
                   └──────┬─────────┘
                          │
                  ┌───────┴────────┐    ┌──────────┐
                  │   Benchmark    │    │  Tests   │
                  │  (5 algoritmos)│    │   (10)   │
                  └────────────────┘    └──────────┘
```

Sin dependencias en runtime salvo Chart.js (cargado desde CDN, no rompe si falla). Sin paso de build: los `<script>` se cargan en orden directo desde HTML.

## 9. Decisiones de diseño

**Definición de `favoriteCategory`.** Se interpretó "categoría en la que más compras realizó" como el número de transacciones (un record = una compra), no la suma de `quantity` ni del gasto. En el ejemplo del enunciado las tres interpretaciones coinciden; esta es la más sencilla de defender. En caso de empate por frecuencia, gana la categoría lexicográficamente mayor, consistente con el criterio 2 del orden global.

**MergeSort en el dashboard.** El enunciado exige usar algoritmos vistos en clase. MergeSort garantiza `O(n log n)` en el peor caso, es estable, y soporta comparación multi‑criterio sin reordenamientos sucesivos.

**QuickSort en el entregable académico.** El esquema `particion_por_Nombre` / `quickSort_por_Nombre` de la Práctica 5 es el patrón canónico del curso. Se añadieron tres mejoras: pivote por mediana de tres, cambio a Insertion Sort en particiones menores a 16 elementos, y recursión optimizada en cola para garantizar profundidad de pila `O(log n)`.

**Parser sin `String.split`.** Un `split(';')` seguido de un `split(' ')` por record genera aproximadamente `7m` strings intermedios. El parser hace un único scan carácter a carácter en `O(L)` con asignaciones mínimas.

**Hash por inserción.** Tanto `Map` (dashboard) como `Object.create(null)` (entregable) garantizan `O(1)` amortizado para inserción y lookup, además de preservar el orden de aparición de los clientes.

**Vanilla JavaScript, sin paso de build.** El proyecto no requiere `npm install`. Cualquier hosting estático lo sirve sin configuración y el evaluador puede leer el código fuente sin bundlers de por medio.

## 10. Despliegue

### GitHub Pages (automático)

`.github/workflows/deploy-pages.yml` ejecuta la suite de pruebas y publica el repositorio en cada push a `master`. La configuración inicial requiere activar GitHub Pages una sola vez en *Settings → Pages → Source → GitHub Actions*.

URL pública: `https://jorgeeduquinones-boop.github.io/TareaFinal_EDyA1/`

### Vercel

`vercel.json` configura el repositorio como sitio estático (sin paso de build), con cabeceras correctas para el service worker y el manifest PWA. El despliegue está activo en:

```
https://tarea-final-e-dy-a1.vercel.app/app/index.html
```

## 11. Documento de entrega

El documento Word exigido por el enunciado se encuentra en `docs/Tarea_Final_EDyA1_Entregable.docx`. Su contenido sigue la estructura solicitada:

1. Portada con códigos, nombres, grupo, asignatura, facultad y profesor.
2. Resumen del enunciado en un párrafo (≤10 líneas).
3. Pseudocódigo de `calcularPedidos(caso)` con las complejidades individuales en columna lateral.
4. Tabla de complejidad total con justificación.
5. Complejidad espacial.
6. Algoritmos del curso aplicados (Prácticas 4, 5, 6).
7. Verificación con el caso del enunciado.

El documento puede regenerarse con `python3 docs/_build_docx.py` tras editar el script.
