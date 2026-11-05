# Combined study site code map

This is a staged migration. The course chooser is `index.html`. Each course page remains directly reachable under `courses/`. CSS and navigation added during the migration live under `shared/`. No backend or build process is required to serve the current site.

| Entry point | Responsibility |
| --- | --- |
| `index.html` | Course selection |
| `shared/styles.css` | Course selector styling |
| `shared/navigation.js` and `shared/navigation.css` | Clickable site title and course links in both existing drawers |
| `shared/components.css` | Shared palette, header, button, panel, input, MCQ, feedback, and directory styles |
| `courses/cs3345/index.html` | Course markup and remaining inline controllers; `showSection` still controls the existing routes |
| `courses/cs3345/exercises.js` | The six original contiguous exercise scripts in their original order: heap, sorting, graph, lab, and shared exercise controllers |
| `courses/cs3345/questions.js` | Syllabus MCQ and Java reference scripts plus the original independent MCQ JSON data |
| `courses/cs3345/study-guide.js` | Original Study Guide JSON data, reader, and topic-link controller |
| `courses/cs3345/chapters.js` | Chapter and topic directory, topic links into existing controllers, and `#chapter/<id>` / `#topic/<id>` routes |
| `courses/cs3345/TOPIC-MAP.md` | Development mapping of all content streams to textbook chapters |
| `courses/cs4341/index.html` and its local assets | Existing chapter, reference, MCQ, problem, K-map, and history behavior |

The CS 3345 route handler delegates chapter and topic hashes to `ChapterNavigation.restore`; existing hashes continue through `showSection`. New directory links call `StudyGuide.open`, `MCPractice.openTopics`, or `showSection` without changing their grading logic. Topic-specific Java links call `JavaReference.show` and `JavaReference.setView`, keeping the seven original listings and 55 code questions in their existing controller. The standalone Java Reference destination remains available until browser verification confirms the topic links.

Current verification is static: source copy integrity, script syntax, asset paths, CS 4341's source validation, and CS 3345 topic coverage. Browser visual and interaction checks remain outstanding because the browser tool blocks the local `file://` page.

Fresh combined-site progress is isolated by `study-practice:cs3345:` and `study-practice:cs4341:` storage prefixes. The CS 3345 adapter wraps its existing reads and writes; the CS 4341 controller uses its existing `PREFIX` mechanism. Historical local-file progress is not migrated.
