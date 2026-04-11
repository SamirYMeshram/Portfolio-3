
(function () {
  const body = document.body;
  const progressBar = document.querySelector('.page-progress-bar');
  const backToTop = document.querySelector('.back-to-top');
  const toast = document.querySelector('.toast');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileMenu = document.querySelector('.mobile-menu');
  const revealItems = document.querySelectorAll('.reveal');
  const counters = document.querySelectorAll('[data-counter]');
  const filterButtons = document.querySelectorAll('[data-filter]');
  const projectCards = document.querySelectorAll('.project-card[data-tags]');
  const faqButtons = document.querySelectorAll('.faq-question');
  const contactForm = document.querySelector('[data-contact-form]');
  const copyButtons = document.querySelectorAll('[data-copy-email]');
  const yearNodes = document.querySelectorAll('[data-year]');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  }

  yearNodes.forEach(function (node) {
    node.textContent = new Date().getFullYear();
  });

  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    if (progressBar) {
      progressBar.style.transform = 'scaleX(' + Math.min(Math.max(progress, 0), 1) + ')';
    }
    if (backToTop) {
      backToTop.classList.toggle('show', scrollTop > 420);
    }
  }

  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setMenuState(open) {
    body.classList.toggle('menu-open', open);
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', String(open));
    }
    if (mobileMenu) {
      mobileMenu.setAttribute('aria-hidden', String(!open));
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setMenuState(!body.classList.contains('menu-open'));
    });
  }

  document.querySelectorAll('.mobile-menu a').forEach(function (link) {
    link.addEventListener('click', function () {
      setMenuState(false);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });

  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-link]').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });

    const counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.counter || 0);
        const pad = Number(el.dataset.pad || 0);
        const duration = 900;
        const start = performance.now();

        function frame(now) {
          const progress = Math.min((now - start) / duration, 1);
          const value = Math.round(target * progress);
          el.textContent = pad ? String(value).padStart(pad, '0') : String(value);
          if (progress < 1) {
            window.requestAnimationFrame(frame);
          }
        }

        window.requestAnimationFrame(frame);
        observer.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('visible');
    });
  }

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const filter = button.dataset.filter;
        filterButtons.forEach(function (btn) {
          btn.classList.toggle('active', btn === button);
        });

        projectCards.forEach(function (card) {
          const tags = (card.dataset.tags || '').split(' ');
          const match = filter === 'all' || tags.includes(filter);
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  faqButtons.forEach(function (button) {
    const answer = button.nextElementSibling;
    button.addEventListener('click', function () {
      const open = button.getAttribute('aria-expanded') === 'true';
      faqButtons.forEach(function (btn) {
        const panel = btn.nextElementSibling;
        btn.setAttribute('aria-expanded', 'false');
        if (panel) panel.style.maxHeight = null;
      });
      if (!open) {
        button.setAttribute('aria-expanded', 'true');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  copyButtons.forEach(function (button) {
    button.addEventListener('click', async function () {
      const address = button.dataset.copyEmail;
      try {
        await navigator.clipboard.writeText(address);
        showToast('Email copied to clipboard');
      } catch (error) {
        showToast('Copy failed. Please copy the email manually.');
      }
    });
  });

  if (contactForm) {
    const status = contactForm.querySelector('[data-form-status]');
    const emailTarget = contactForm.dataset.contactEmail || 'hello@yourname.dev';

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(contactForm);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const project = String(data.get('project') || '').trim();
      const company = String(data.get('company') || '').trim();
      const timeline = String(data.get('timeline') || '').trim();
      const message = String(data.get('message') || '').trim();

      if (!name || !email || !message) {
        if (status) {
          status.classList.add('show', 'error');
          status.classList.remove('success');
          status.textContent = 'Please complete your name, email, and message before sending.';
        }
        return;
      }

      if (status) {
        status.classList.add('show');
        status.classList.remove('error');
        status.textContent = 'This static portfolio will now open your email client with a prepared message.';
      }

      const subject = encodeURIComponent('[Portfolio Enquiry] ' + (project || 'Backend collaboration') + ' - ' + name);
      const body = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Company / Team: ' + company + '\n' +
        'Project type: ' + project + '\n' +
        'Timeline: ' + timeline + '\n\n' +
        message
      );
      window.location.href = 'mailto:' + emailTarget + '?subject=' + subject + '&body=' + body;
    });
  }
})();
