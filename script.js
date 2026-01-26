const commandBar = document.querySelector('.sticky-command .prompt');
const beans = Array.from(document.querySelectorAll('.bean'));
const toggle = document.querySelector('.theme-toggle');
const tagStatus = document.querySelector('#tag-status');

const storedTheme = localStorage.getItem('beans-theme');
if (storedTheme) {
  document.documentElement.setAttribute('data-theme', storedTheme);
}

toggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('beans-theme', next);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const command = entry.target.getAttribute('data-command');
        if (command && commandBar) {
          commandBar.textContent = command;
        }
      }
    });
  },
  {
    rootMargin: '-40% 0px -50% 0px',
    threshold: 0.1,
  }
);

beans.forEach((bean) => observer.observe(bean));

const updateTagFilter = () => {
  const hash = window.location.hash;
  const tagMatch = hash.match(/^#tag-(.+)$/);
  if (!tagMatch) {
    beans.forEach((bean) => bean.classList.remove('is-hidden'));
    if (tagStatus) {
      tagStatus.textContent = 'Showing all beans.';
    }
    return;
  }

  const tag = decodeURIComponent(tagMatch[1]);
  beans.forEach((bean) => {
    const tags = bean.dataset.tags?.split(',') ?? [];
    if (tags.includes(tag)) {
      bean.classList.remove('is-hidden');
    } else {
      bean.classList.add('is-hidden');
    }
  });

  if (tagStatus) {
    tagStatus.textContent = `Filtering by tag: ${tag}`;
  }
};

window.addEventListener('hashchange', updateTagFilter);
updateTagFilter();
