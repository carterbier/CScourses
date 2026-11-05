(() => {
  'use strict';
  const course = document.currentScript?.dataset.course;
  const config = {
    cs3345: { name: 'CS 3345', other: 'CS 4341', otherPath: '../cs4341/index.html' },
    cs4341: { name: 'CS 4341', other: 'CS 3345', otherPath: '../cs3345/index.html' }
  }[course];
  if (!config) return;

  const header = document.querySelector(course === 'cs3345' ? '#siteHeader .header-start' : 'header.top');
  const courseTitle = document.querySelector(course === 'cs3345' ? '#siteHeader .brand' : '#brandHome');
  const drawerLinks = document.querySelector(course === 'cs3345' ? '#globalNavItems' : '#drawerLinks');
  if (!header || !courseTitle || !drawerLinks) return;

  const siteTitle = document.createElement('a');
  siteTitle.className = 'sp-site-title';
  siteTitle.href = '../../index.html';
  siteTitle.textContent = 'Study Practice';
  siteTitle.setAttribute('aria-label', 'Study Practice course selection');
  header.insertBefore(siteTitle, courseTitle);

  const label = document.createElement('div');
  label.className = 'sp-nav-label';
  label.textContent = 'Courses';
  drawerLinks.append(label);
  for (const [text, href, current] of [
    ['All courses', '../../index.html', false],
    [config.name, 'index.html', true],
    [config.other, config.otherPath, false]
  ]) {
    const link = document.createElement('a');
    link.className = 'sp-course-link';
    link.href = href;
    link.textContent = text;
    if (current) link.setAttribute('aria-current', 'page');
    drawerLinks.append(link);
  }
})();
