/* ==========================================================================
   Academic Website Interactivity Script (Bernat Font Style)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dark / Light Theme Toggle
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  const savedTheme = localStorage.getItem('site-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('site-theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
      themeIcon.innerHTML = `
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg> Light Mode`;
    } else {
      themeIcon.innerHTML = `
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg> Dark Mode`;
    }
  }

  // 2. Publication Filter Tabs
  const filterBtns = document.querySelectorAll('.pub-filter-btn');
  const pubItems = document.querySelectorAll('.pub-item');
  const searchInput = document.getElementById('pub-search-input');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterPublications();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterPublications();
    });
  }

  function filterPublications() {
    const activeCategory = document.querySelector('.pub-filter-btn.active')?.dataset.category || 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    pubItems.forEach(item => {
      const itemCategory = item.dataset.category || '';
      const textContent = item.textContent.toLowerCase();

      const matchesCategory = activeCategory === 'all' || itemCategory === activeCategory;
      const matchesSearch = searchQuery === '' || textContent.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // 3. BibTeX Expander Drawer Toggles
  const bibtexBtns = document.querySelectorAll('.bibtex-toggle');
  bibtexBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.target;
      const bibtexBox = document.getElementById(targetId);
      if (bibtexBox) {
        bibtexBox.classList.toggle('open');
      }
    });
  });

  // 4. Smooth Navigation & Highlight Active Section
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section-block');

  window.addEventListener('scroll', () => {
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });
});
