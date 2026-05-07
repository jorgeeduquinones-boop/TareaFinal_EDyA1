# Análisis de complejidad — `calcularPedidos(caso)`

**Tarea Final EDyA1 — UAO 2026-1**

## Variables

| Símbolo | Significado |
|---|---|
| **m** | Número de records en el caso de entrada |
| **n** | Número de customers únicos (m ≥ n) |
| **p** | Número de categorías distintas |
| **k** | Longitud media de un campo (acotada en la práctica) |
| **L** | Longitud total del string de entrada ≈ m·k |

## Pseudocódigo

```
calcularPedidos(caso):
  records   ← parsearCaso(caso)                              # O(m·k)
  porCliente ← Map vacío
  para cada r en records:                                    # O(m)
    info ← porCliente[r.customer]   o nuevo
    info.totalSpent += r.price * r.quantity
    info.categorias[r.category] += 1
  clientes ← lista vacía
  para cada (name, info) en porCliente:                      # O(n)
    mejorCat, mejorFreq ← '', -1
    para cada (cat, freq) en info.categorias:                # O(p) por cliente
      si freq > mejorFreq o (freq = mejorFreq y cat > mejorCat):
        mejorCat ← cat; mejorFreq ← freq
    agregar a clientes {name, totalSpent, mejorCat}
  mergeSort(clientes, comparadorMultiCriterio)               # O(n log n)
  retornar formatearSalida(clientes)                         # O(n·k)
```

## Complejidad por fragmento

| Fragmento | Complejidad | Justificación |
|---|---|---|
| `parsearCaso(caso)` | **O(m·k)** | Un solo recorrido del string de longitud L = m·k. |
| Acumulación por cliente | **O(m)** | `Map.get`/`set` son O(1) amortizado. |
| Cálculo de `favoriteCategory` | **O(n·p)** | Cada cliente recorre ≤ p categorías distintas. |
| `mergeSort` (multi-criterio) | **O(n log n)** | MergeSort bottom-up estable. La comparación es O(1) en promedio. |
| Formateo y `join` | **O(n·k)** | n strings de longitud O(k). |

## Complejidad total

```
T(m, n, p) = O(m·k) + O(m) + O(n·p) + O(n log n) + O(n·k)
           = O(m·k + n·p + n log n)
```

Asumiendo k constante (longitudes de nombres acotadas en la práctica):

> **T(m, n, p) = O(m + n·p + n log n)**

## Complejidad espacial

- `records`: O(m)
- `porCliente`: O(n + n·p) = O(n·p)
- `clientes`: O(n)
- buffer auxiliar de MergeSort: O(n)

> **S(m, n, p) = O(m + n·p)**

## Comparación de algoritmos de ordenamiento (Benchmark)

| Algoritmo | Tiempo | Espacio | Estable |
|---|---|---|---|
| **MergeSort** (en producción) | O(n log n) | O(n) | sí |
| QuickSort 3-way | O(n log n) prom., O(n²) peor | O(log n) | no |
| RadixSort LSD (sólo totalSpent) | O(d·n) | O(n+b) | sí |
| Insertion Sort | O(n²) peor, O(n) mejor | O(1) | sí |

Resultados empíricos (medidos con `node app/js/benchmark.js`, n=2000 clientes):

```
== m=100000, n=2000, p=10 → 2000 clientes ==
   1.482 ms  MergeSort propio (estable)
   1.479 ms  QuickSort 3-way propio
   0.384 ms  Array.sort nativo (V8)
   6.095 ms  Insertion Sort propio
   1.128 ms  RadixSort LSD (sólo criterio 1)
```

Conclusión: para n moderado (≤ 10k clientes) MergeSort y QuickSort propios son competitivos. Array.sort nativo es ~3-4× más rápido por estar implementado en C++ (TimSort), pero el enunciado exige usar algoritmos vistos en clase, así que MergeSort es la elección de producción.
