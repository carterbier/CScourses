/* Course navigation only. Existing generators, graders, banks, and exercise sections stay in the page. */
const ChapterNavigation = (() => {
  'use strict';
  const chapters = [
    { id: 'ch2', title: 'Algorithm Analysis', topics: [
      ['runtime-quick-review', 'Runtime Quick Review', null, null] ] },
    { id: 'ch5', title: 'Hashing', topics: [
      ['hashing', 'Hashing, including Cuckoo Hashing', 'hashing', null] ] },
    { id: 'ch6', title: 'Priority Queues and Heaps', topics: [
      ['binary', 'Binary Heaps', 'binary-heaps', 'binary'],
      ['dheaps', 'd-Heaps', 'd-heaps', 'dheaps'],
      ['heaps', 'Leftist Heaps', 'leftist-heaps', 'heaps'],
      ['binomial', 'Binomial Trees & Binomial Queues', 'binomial-trees-binomial-queues', 'binomial'],
      ['fibonacci', 'Fibonacci & Pairing Heaps', 'fibonacci-pairing-heaps', null] ] },
    { id: 'ch7', title: 'Sorting', topics: [
      ['insertion', 'Insertion Sort', 'insertion-sort', 'insertion'],
      ['merge', 'Merge Sort', 'merge-sort', 'merge'],
      ['heapsort', 'Heapsort', 'heapsort', 'heapsort'],
      ['quicksort', 'Quicksort', 'quicksort', 'quicksort'],
      ['bounds', 'Sorting Lower Bounds', 'sorting-lower-bounds', 'bounds'],
      ['external', 'External Sorting', 'external-sorting', 'external'] ] },
    { id: 'ch9', title: 'Graph Algorithms', topics: [
      ['fundamentals', 'Graph Fundamentals', 'graph-fundamentals', 'fundamentals'],
      ['topo', 'Topological Sort / DAGs', 'topological-sort-dags', 'topo'],
      ['dijkstra', "Dijkstra's Algorithm", 'dijkstras-algorithm', 'dijkstra'],
      ['shortest', 'Shortest-Path Algorithms', 'shortest-path-algorithms', 'shortest'],
      ['activity', 'Activity Graphs', 'activity-graphs', 'activity'],
      ['pert', 'PERT / Critical-Path Timing', 'pert-critical-path', 'pert'],
      ['flow', 'Network Flow', 'network-flow', 'flow'],
      ['prim', "Prim's Algorithm", 'prims-algorithm', 'prim'] ] }
  ];
  const javaByTopic = {
    binary: [['heap-insert', 'Heap Insert'], ['heap-constructor', 'Heap Constructor'], ['build-heap', 'BuildHeap']],
    binomial: [['combine-trees', 'combineTrees']],
    quicksort: [['quick-sort', 'Quicksort']],
    topo: [['top-sort-simple', 'TopSort'], ['top-sort-queue', 'TopSort Queue']]
  };
  const home = document.getElementById('homeSection');
  const main = home.parentElement;
  const toolbar = document.createElement('nav');
  toolbar.className = 'sp-topic-toolbar';
  toolbar.setAttribute('aria-label', 'Current topic navigation');
  toolbar.hidden = true;
  main.prepend(toolbar);
  let currentTopic = null;
  const originalShowSection = showSection;
  showSection = function(section, ...args) {
    originalShowSection(section, ...args);
    toolbar.hidden = !currentTopic || ['home', 'chapter', 'interactivePractice'].includes(section);
  };
  const chapterPage = document.createElement('section');
  chapterPage.id = 'cs3345ChapterSection';
  chapterPage.className = 'sp-directory';
  chapterPage.hidden = true;
  const topicPage = document.createElement('section');
  topicPage.id = 'cs3345TopicSection';
  topicPage.className = 'sp-directory';
  topicPage.hidden = true;
  main.append(chapterPage, topicPage);
  const findChapter = id => chapters.find(chapter => chapter.id === id);
  const findTopic = id => chapters.flatMap(chapter => chapter.topics.map(topic => ({ chapter, topic }))).find(item => item.topic[0] === id);
  const make = (tag, className, text) => { const node = document.createElement(tag); node.className = className; if (text !== undefined) node.textContent = text; return node; };
  const button = (label, action, className = 'sp-directory-button') => { const node = make('button', className, label); node.type = 'button'; node.addEventListener('click', action); return node; };

  function route(kind, id) {
    const hash = '#' + kind + '/' + encodeURIComponent(id);
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    restore(kind + '/' + id);
    window.scrollTo(0, 0);
  }
  function directory() {
    home.replaceChildren();
    home.classList.add('sp-directory');
    home.append(make('p', 'sp-directory-eyebrow', 'CS 3345 · Data Structures and Algorithms'));
    home.append(make('h1', '', 'Chapters'));
    home.append(make('p', 'sp-directory-intro', 'Choose a chapter, then a topic to study or practice.'));
    const grid = make('div', 'sp-directory-grid');
    chapters.forEach(chapter => {
      const card = make('article', 'sp-directory-card');
      card.append(make('p', 'sp-directory-eyebrow', 'CHAPTER ' + chapter.id.slice(2)));
      card.append(make('h2', '', chapter.title));
      card.append(make('p', 'sp-directory-meta', chapter.topics.length + (chapter.topics.length === 1 ? ' topic' : ' topics')));
      card.append(button('View topics →', () => route('chapter', chapter.id), 'sp-directory-button primary'));
      grid.append(card);
    });
    home.append(grid);
  }
  function showChapter(chapter) {
    currentTopic = null;
    chapterPage.replaceChildren();
    chapterPage.append(button('← Chapters', () => route('home', ''), 'sp-back-button'));
    chapterPage.append(make('p', 'sp-directory-eyebrow', 'CHAPTER ' + chapter.id.slice(2)));
    chapterPage.append(make('h1', '', chapter.title));
    const list = make('div', 'sp-directory-list');
    chapter.topics.forEach(topic => list.append(button(topic[1] + ' →', () => route('topic', topic[0]))));
    chapterPage.append(list);
    showSection('chapter', false);
  }
  function showTopic(chapter, topic) {
    const [id, title, guide, exercise] = topic;
    currentTopic = id;
    toolbar.replaceChildren();
    toolbar.append(button('← Topic', () => route('topic', id), 'sp-back-button'));
    const selector = document.createElement('select');
    selector.setAttribute('aria-label', 'Switch topic');
    chapters.forEach(group => group.topics.forEach(item => {
      const option = document.createElement('option');
      option.value = item[0];
      option.textContent = 'Ch. ' + group.id.slice(2) + ' · ' + item[1];
      selector.append(option);
    }));
    selector.value = id;
    selector.addEventListener('change', () => route('topic', selector.value));
    toolbar.append(selector);
    topicPage.replaceChildren();
    topicPage.append(button('← ' + chapter.title, () => route('chapter', chapter.id), 'sp-back-button'));
    topicPage.append(make('p', 'sp-directory-eyebrow', 'CHAPTER ' + chapter.id.slice(2)));
    topicPage.append(make('h1', '', title));
    const choices = make('div', 'sp-topic-choices');
    function choice(label, description, action) {
      const card = make('article', 'sp-directory-card');
      card.append(make('h2', '', label), make('p', 'sp-directory-meta', description));
      if (action) card.append(button('Open ' + label + ' →', action, 'sp-directory-button primary'));
      else card.append(make('p', 'sp-directory-unavailable', 'No material in this section yet.'));
      choices.append(card);
    }
    const openGuide = guide ? () => StudyGuide.open(guide) : null;
    const openMCQ = () => {
      MCPractice.openTopics();
      showSection('mcPractice');
      const index = Q2_MCQ_DATA.topics.findIndex(item => item[0] === id);
      const row = document.querySelectorAll('#mcPracticeSection .mc-topic-row')[index];
      if (row) requestAnimationFrame(() => { row.scrollIntoView({ block: 'center' }); row.focus({ preventScroll: true }); });
    };
    const openExercise = exercise ? () => showSection(exercise) : null;
    choice('Study Guide', 'Read the topic explanation and worked examples.', openGuide);
    choice('Multiple Choice', 'Practice this topic and review your progress.', openMCQ);
    choice('Problem Solving', 'Work through the original interactive exercises.', openExercise);
    for (const [label, action] of [['Study Guide', openGuide], ['Multiple Choice', openMCQ], ['Problem Solving', openExercise]]) {
      const control = button(label, action || (() => {}));
      control.disabled = !action;
      toolbar.append(control);
    }
    topicPage.append(choices);
    if (javaByTopic[id]) {
      const references = make('section', 'sp-java-references');
      references.append(make('h2', '', 'Java code and questions'));
      references.append(make('p', 'sp-directory-meta', 'Topic-specific listings, explanations, and code questions.'));
      const links = make('div', 'sp-java-reference-links');
      for (const [referenceId, label] of javaByTopic[id]) {
        const entry = make('div', 'sp-java-reference-entry');
        entry.append(make('strong', '', label));
        const open = view => { showSection('javaReference'); JavaReference.show(referenceId); JavaReference.setView(view); };
        entry.append(button('Code and explanation', () => open('reference')));
        entry.append(button('Code questions', () => open('mcq')));
        links.append(entry);
      }
      references.append(links);
      topicPage.append(references);
    }
    showSection('topic', false);
  }
  function restore(hash = window.location.hash.slice(1)) {
    if (hash === 'home/' || hash === 'home') { currentTopic = null; showSection('home', false); return true; }
    const [kind, encoded] = hash.split('/');
    let id;
    try { id = decodeURIComponent(encoded || ''); } catch { return false; }
    if (kind === 'chapter') { const chapter = findChapter(id); if (!chapter) return false; showChapter(chapter); return true; }
    if (kind === 'topic') { const found = findTopic(id); if (!found) return false; showTopic(found.chapter, found.topic); return true; }
    return false;
  }
  directory();
  return { restore };
})();
