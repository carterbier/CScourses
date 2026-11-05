# CS 3345 chapter and content map

Development inventory for reorganizing the existing course page. This is not a runtime file. The chapter assignments follow the Fall 2026 Syllabus Version 2 calendar (PDF page 4) and the existing printed Weiss page references. Topic IDs identify distinct content streams and must remain stable during the navigation change.

| Weiss chapter | Topic | Interactive exercise ID | Study Guide section ID | Independent MCQ topic ID | Existing printed reference |
| --- | --- | --- | --- | --- | --- |
| 2 — Algorithm Analysis | Runtime Quick Review | — | — | `runtime-quick-review` | Syllabus pp. 29–32, 45–48 |
| 5 — Hashing | Hashing, including Cuckoo Hashing | — | `hashing` | `hashing` | Syllabus pp. 171–205 |
| 6 — Priority Queues | Binary Heaps | `binary` | `binary-heaps` | `binary` | pp. 225–232, 234–237 |
| 6 — Priority Queues | d-Heaps | `dheaps` | `d-heaps` | `dheaps` | pp. 240–241 |
| 6 — Priority Queues | Leftist Heaps | `heaps` | `leftist-heaps` | `heaps` | pp. 241–245 |
| 6 — Priority Queues | Binomial Trees & Binomial Queues | `binomial` | `binomial-trees-binomial-queues` | `binomial` | p. 252, pp. 253–259, p. 261 |
| 6 — Priority Queues | Fibonacci & Pairing Heaps (supplemental topic) | — | `fibonacci-pairing-heaps` | `fibonacci` | Grouped with the syllabus heap sequence; retain existing topic-specific references |
| 7 — Sorting | Insertion Sort | `insertion` | `insertion-sort` | `insertion` | p. 272 |
| 7 — Sorting | Merge Sort | `merge` | `merge-sort` | `merge` | pp. 282–284 |
| 7 — Sorting | Heapsort | `heapsort` | `heapsort` | `heapsort` | pp. 278–280, p. 282 |
| 7 — Sorting | Quicksort | `quicksort` | `quicksort` | `quicksort` | pp. 288–291, p. 294 |
| 7 — Sorting | Sorting Lower Bounds | `bounds` | `sorting-lower-bounds` | `bounds` | pp. 302–304 |
| 7 — Sorting | External Sorting | `external` | `external-sorting` | `external` | pp. 316–317 |
| 9 — Graph Algorithms | Graph Fundamentals | `fundamentals` | `graph-fundamentals` | `fundamentals` | pp. 359–362 |
| 9 — Graph Algorithms | Topological Sort / DAGs | `topo` | `topological-sort-dags` | `topo` | pp. 362–364 |
| 9 — Graph Algorithms | Dijkstra's Algorithm | `dijkstra` | `dijkstras-algorithm` | `dijkstra` | pp. 372–377 |
| 9 — Graph Algorithms | Shortest-Path Algorithms | `shortest` | `shortest-path-algorithms` | `shortest` | pp. 366–370, p. 372, pp. 380–381 |
| 9 — Graph Algorithms | Activity Graphs | `activity` | `activity-graphs` | `activity` | pp. 380–384 |
| 9 — Graph Algorithms | PERT / Critical-Path Timing | `pert` | `pert-critical-path` | `pert` | Existing page label pp. 381–384; syllabus lists PERT separately |
| 9 — Graph Algorithms | Network Flow | `flow` | `network-flow` | `flow` | pp. 386–392 |
| 9 — Graph Algorithms | Prim's Algorithm | `prim` | `prims-algorithm` | `prim` | pp. 393–397 |

The table accounts for **18 interactive exercise sections, 20 Study Guide sections, and 21 independent MCQ categories**. `runtime-quick-review` remains an MCQ category under Chapter 2; it does not create a new syllabus topic. Hashing and Fibonacci/Pairing Heaps remain accessible although they have no interactive exercise section. Every exercise mode stays under its existing interactive section. The separate syllabus MCQ tabs on interactive sections keep their existing IDs and question bank.

## Java reference inventory

The seven entries below contain 55 Java reference questions in total. Preserve each code listing, explanation, question ID, and answer verbatim while moving its presentation into the corresponding topic reference area. Questions and code stay outside procedural exercise workspaces.

| Reference ID | Listing | Questions | Destination topic | Source / qualification |
| --- | --- | ---: | --- | --- |
| `heap-insert` | Heap Insert | 10 | Binary Heaps | Weiss Figure 6.8, printed p. 231 |
| `heap-constructor` | Heap Constructor | 7 | Binary Heaps | Weiss Figure 6.14, printed p. 236 |
| `build-heap` | BuildHeap | 7 | Binary Heaps | Weiss Figure 6.14, printed p. 236 |
| `combine-trees` | combineTrees | 8 | Binomial Trees & Binomial Queues | Weiss Figure 6.54, printed p. 259 |
| `quick-sort` | Quicksort | 8 | Quicksort | Weiss Figure 7.11, printed p. 289 |
| `top-sort-simple` | TopSort | 8 | Topological Sort / DAGs | Weiss Figure 9.5, printed p. 364; Java-like pseudocode |
| `top-sort-queue` | TopSort Queue | 7 | Topological Sort / DAGs | Weiss Figure 9.7, printed p. 365; Java-like pseudocode, outside syllabus page range but retained |

## Navigation migration checks

1. Keep the three content lists independent; a topic may have only Study Guide or MCQ content.
2. Map the existing interactive topic IDs to Chapter 6, 7, or 9 without changing their generators, modes, graders, seed formats, or saved state.
3. Keep all seven Java entries and all 55 associated questions reachable through their topic links. The standalone Java Reference menu entry was removed after the local inventory check; the detail controller remains in use.
4. Preserve the current printed reading labels in the interface. The chapter grouping is metadata and does not revise the labels.
5. Verify counts and IDs against the embedded banks after code is extracted.
