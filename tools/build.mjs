/* ============================================================================
   Static site generator for travisgafford.com

   Zero dependencies. Run with:  node tools/build.mjs
   Output goes to _site/, which is what gets published.
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { markdown, frontMatter, inline } from "./md.mjs";
import { site, nav } from "../content/site.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_site");

/* --- helpers -------------------------------------------------------------- */

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* Word pairs that read badly when a line break lands between them. Balanced
   wrapping equalises line lengths but knows nothing about meaning, so it will
   happily split "brand / programs". Joining these with a non-breaking space
   takes that option away from the browser. Add to the list as needed. */
const NO_BREAK = [
  "brand programs",
  "trading card games",
  "card games",
  "in mind",
  "at a time",
  "mass send",
  "fastest route",
  "obsessed with",
  "or TCG",
];

const bind = (s = "") =>
  NO_BREAK.reduce((acc, ph) => acc.split(ph).join(ph.replace(/ /g, " ")), String(s));

/* Escapes, then allows *asterisks* to become italics and [text](url) to become
   links. Use for prose in content/site.mjs; use esc() for anything going into
   an HTML attribute. */
const rich = (s = "") => bind(inline(String(s)));

/* For headings and ledes written directly in this file. */
const led = (s = "") => bind(esc(s));

/* Strips markup back out, for meta descriptions and JSON-LD where markup
   would be noise. */
const plain = (s = "") => String(s).replace(/\*([^*]+)\*/g, "$1");

/* --- email obfuscation ----------------------------------------------------
   The address is never written into the HTML. Each page carries the parts
   reversed and split, and a few lines of JS reassemble them into a real
   mailto link on load. Scrapers overwhelmingly pull addresses by running a
   regex over raw HTML, and there is nothing there to match. Anyone with
   JavaScript off still sees a readable instruction rather than a dead link. */

const [MAIL_USER, MAIL_HOST] = site.email.split("@");
const rev = (s) => s.split("").reverse().join("");

/* text: what a visitor sees before the script runs
   show: if true, the script replaces the text with the real address once
           it has assembled it (used on the contact page) */
const MAIL_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>`;

function mailLink(text, { className = "", show = false, icon = false } = {}) {
  return `<a class="mail${className ? " " + className : ""}" href="#"${show ? " data-show" : ""}
   role="button"
   data-u="${esc(rev(MAIL_USER))}" data-d="${esc(rev(MAIL_HOST))}">${icon ? MAIL_ICON : ""}${esc(text)}</a>`;
}

/* Nothing assembles the address on page load. Not the link text, not the href.
   It is built only inside a click handler, in response to a real interaction.
   A scraper that merely renders the page with JavaScript still finds nothing;
   it would have to click the link to get anything. */
const MAIL_SCRIPT = `
(function () {
  var r = function (s) { return s.split("").reverse().join(""); };
  var build = function (a) {
    return r(a.getAttribute("data-u")) + String.fromCharCode(64) + r(a.getAttribute("data-d"));
  };
  var nodes = document.querySelectorAll("a.mail");
  for (var i = 0; i < nodes.length; i++) {
    (function (a) {
      a.className += " mail-ready";
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var addr = build(a);
        // On a "reveal" link the first click prints the address so it can be
        // read or copied; after that it behaves as an ordinary mailto link.
        if (a.hasAttribute("data-show") && !a.hasAttribute("data-revealed")) {
          a.textContent = addr;
          a.setAttribute("href", "mailto:" + addr);
          a.setAttribute("data-revealed", "");
          return;
        }
        window.location.href = "mailto:" + addr;
      });
    })(nodes[i]);
  }
})();`;

function write(rel, contents) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contents);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    // Anything starting with _ or . is scratch and is not published.
    if (/^[._]/.test(entry.name)) continue;
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

const fmtDate = (iso) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });

/* Responsive <picture> for the images in public/assets/img.
   Each base name has -640/-1280/-1920 .webp variants plus a .jpg fallback. */
function picture(base, alt, { className = "", sizes = "100vw", eager = false, widths = [640, 1280, 1920], zoom = false, fit = "" } = {}) {
  if (fit === "contain") className = (className + " fit-contain").trim();
  const avail = widths.filter((w) =>
    fs.existsSync(path.join(ROOT, "public/assets/img", `${base}-${w}.webp`))
  );
  const srcset = avail.map((w) => `/assets/img/${base}-${w}.webp ${w}w`).join(", ");

  // Largest rendition we actually generated, for the lightbox.
  const full = avail.length
    ? `/assets/img/${base}-${avail[avail.length - 1]}.webp`
    : `/assets/img/${base}.jpg`;

  const classes = [className, zoom ? "zoomable" : ""].filter(Boolean).join(" ");

  return `<picture>
  <source type="image/webp" srcset="${srcset}" sizes="${sizes}">
  <img src="/assets/img/${base}.jpg" alt="${esc(alt)}"${classes ? ` class="${classes}"` : ""}
       ${zoom ? `data-full="${full}"` : ""}
       ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
</picture>`;
}

/* --- structured data ------------------------------------------------------
   This is the part that does the heavy lifting for "rank on my name" and
   "let AI systems find accurate facts about me". It tells machines, in a
   format they all parse, who this person is and which accounts are theirs. */

function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.name,
    givenName: "Travis",
    familyName: "Gafford",
    url: site.url,
    image: `${site.url}/assets/img/travis-hero.jpg`,
    jobTitle: site.jobTitle,
    description: site.longDescription,
    // Deliberately no email field. Structured data is machine-readable by
    // design, which makes it the first place a harvester looks.
    address: { "@type": "PostalAddress", addressLocality: "Los Angeles", addressRegion: "CA", addressCountry: "US" },
    knowsAbout: [
      "Esports", "League of Legends", "Magic: The Gathering",
      "Riftbound: League of Legends Trading Card Game",
      "Trading card games", "Influencer marketing", "Live broadcast production",
      "Content strategy", "Sponsorship and brand partnerships",
    ],
    sameAs: site.socials.map((s) => s.url),
  };
}

function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    description: site.longDescription,
    publisher: { "@id": `${site.url}/#person` },
    inLanguage: "en-US",
  };
}

/* --- page shell ----------------------------------------------------------- */

function layout({ title, description, canonical, body, jsonLd = [], ogImage, ogType = "website", bodyClass = "" }) {
  const fullTitle = title === site.name ? `${site.name} | ${site.titleSuffix}` : `${title} | ${site.name}`;
  const desc = description || site.metaDescription;
  const img = ogImage || `${site.url}/assets/img/og-image.jpg`;
  const blocks = [personJsonLd(), siteJsonLd(), ...jsonLd];

  const navHtml = nav
    .map((n) => {
      const current = n.href === canonical;
      return `<a href="${n.href}"${current ? ' aria-current="page"' : ""}>${n.label}</a>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${site.url}${canonical}">
<meta name="author" content="${esc(site.name)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">

<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${site.url}${canonical}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${img}">

<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16.png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0b0d12">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)} Blog" href="/rss.xml">

<!-- Fonts are self-hosted, so there is no third-party request here. These two
     are the ones needed for the first paint: body copy and the main heading.
     Preloading them starts the download before the CSS has been parsed. -->
<link rel="preload" href="/assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/raleway-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css">

${blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join("\n")}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
<a href="#main" class="skip">Skip to content</a>

<header class="site-head">
  <div class="wrap head-inner">
    <a class="wordmark" href="/">Travis&nbsp;Gafford</a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <nav id="site-nav" class="site-nav">${navHtml}</nav>
  </div>
</header>

<main id="main">
${body}
</main>

<footer class="site-foot">
  <div class="wrap foot-inner">
    <div class="foot-brand">
      <p class="foot-name">${esc(site.name)}</p>
      <p class="muted">${esc(site.jobTitle)}<br>${esc(site.location)}</p>
    </div>
    <nav class="foot-links" aria-label="Elsewhere">
      ${site.socials.map((s) => `<a href="${s.url}" rel="me noopener">${s.label}</a>`).join("")}
      <a href="/links/">All links</a>
      <a href="/rss.xml">RSS</a>
    </nav>
  </div>
  <div class="wrap foot-legal">
    <p class="muted">&copy; ${new Date().getFullYear()} ${esc(site.name)}. ${mailLink("Email me")}</p>
  </div>
</footer>

<script>
(function () {
  var b = document.querySelector('.nav-toggle');
  var n = document.getElementById('site-nav');
  if (!b || !n) return;
  b.addEventListener('click', function () {
    var open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!open));
    n.classList.toggle('open', !open);
  });
})();
(function () {
  var buttons = document.querySelectorAll('.yt-play');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      var id = this.getAttribute('data-id');
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      frame.title = this.getAttribute('data-label') || 'Video';
      frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      frame.setAttribute('frameborder', '0');
      this.parentNode.replaceChild(frame, this);
    });
  }
})();
(function () {
  var imgs = [].slice.call(document.querySelectorAll('img.zoomable'));
  if (!imgs.length) return;
  var idx = 0, lastFocus = null;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photo viewer');
  box.hidden = true;
  box.innerHTML =
    '<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
    '<button class="lb-nav lb-prev" type="button" aria-label="Previous photo">&#8249;</button>' +
    '<button class="lb-nav lb-next" type="button" aria-label="Next photo">&#8250;</button>' +
    '<figure class="lb-fig"><img alt=""><figcaption></figcaption></figure>';
  document.body.appendChild(box);

  var pic = box.querySelector('img');
  var cap = box.querySelector('figcaption');
  var prev = box.querySelector('.lb-prev');
  var next = box.querySelector('.lb-next');

  function show(i) {
    idx = (i + imgs.length) % imgs.length;
    var src = imgs[idx];
    pic.src = src.getAttribute('data-full') || src.currentSrc || src.src;
    pic.alt = src.alt || '';
    cap.textContent = src.alt || '';
    var many = imgs.length > 1;
    prev.hidden = !many;
    next.hidden = !many;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.classList.add('lb-open');
    box.querySelector('.lb-close').focus();
  }

  function close() {
    box.hidden = true;
    pic.removeAttribute('src');
    document.body.classList.remove('lb-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  imgs.forEach(function (im, i) {
    im.setAttribute('tabindex', '0');
    im.setAttribute('role', 'button');
    im.setAttribute('aria-label', 'View larger: ' + (im.alt || 'photo'));
    im.addEventListener('click', function () { open(i); });
    im.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  box.querySelector('.lb-close').addEventListener('click', close);
  prev.addEventListener('click', function () { show(idx - 1); });
  next.addEventListener('click', function () { show(idx + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'Tab') {
      // Keep focus inside the dialog while it is open.
      var f = box.querySelectorAll('button:not([hidden])');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
(function () {
  var b = document.querySelector('.share-btn');
  var toast = document.querySelector('.share-toast');
  if (!b) return;
  var say = function (msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('on');
    setTimeout(function () { toast.classList.remove('on'); }, 1800);
  };
  b.addEventListener('click', function () {
    var url = location.href;
    var data = { title: document.title, url: url };
    // Native share sheet on phones, clipboard everywhere else.
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { say('Link copied'); },
                                             function () { say(url); });
    } else {
      say(url);
    }
  });
})();
${MAIL_SCRIPT}
</script>
</body>
</html>`;
}

/* --- home ----------------------------------------------------------------- */

function homePage() {
  const stats = site.reach.show
    ? `<ul class="stats">${site.reach.stats
        .map((s) => `<li><span class="stat-v">${esc(s.value)}</span><span class="stat-l">${esc(s.label)}</span></li>`)
        .join("")}</ul>`
    : "";

  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1>${esc(site.name)}</h1>
      <p class="lede">${rich(site.tagline)}</p>
      <p class="hero-loc">${esc(site.location)}</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="/work/">See the work</a>
        <a class="btn" href="/contact/">Get in touch</a>
      </div>
    </div>
    <div class="hero-media">
      ${picture("travis-hero", `${site.name} hosting on stage at the League of Legends Championship Series`, { sizes: "(max-width: 900px) 100vw, 46vw", eager: true, zoom: true })}
    </div>
  </div>
</section>

${stats ? `<section class="band"><div class="wrap">${stats}</div></section>` : ""}

<section class="section">
  <div class="wrap two-col">
    <div class="col-head"><h2>About</h2></div>
    <div class="col-body prose">
      ${site.bio.map((p) => `<p>${rich(p)}</p>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="wrap">
    <h2 class="section-title">What I do</h2>
    <div class="cards">
      ${site.services
        .map((s) => `<article class="card"><h3>${esc(s.title)}</h3><p>${rich(s.body)}</p></article>`)
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="section-title">Selected clients and partners</h2>
    <ul class="brandlist">
      ${site.brands.map((b) => `<li>${esc(b)}</li>`).join("")}
    </ul>
  </div>
</section>

<section class="section closer">
  <div class="wrap closer-inner">
    <h2>${led("Working on something in gaming or TCG?")}</h2>
    <p class="lede">${led("I take on a small number of consulting and partnership projects at a time.")}</p>
    <a class="btn btn-primary" href="/contact/">Start a conversation</a>
  </div>
</section>`;

  return layout({
    title: site.name,
    canonical: "/",
    description: site.metaDescription,
    body,
    bodyClass: "home",
  });
}

/* --- work ----------------------------------------------------------------- */

/* A work item shows either a photo or, if it has a `video`, an inline player.
   Videos are self-hosted, muted by default, and never autoplay. */
function workMedia(w) {
  const sizes = "(max-width: 900px) 100vw, 46vw";

  /* YouTube, without the YouTube tax. Embedding an <iframe> directly loads
     roughly a megabyte of Google JavaScript and sets cookies on every visitor
     who never presses play. Instead we show our own poster image and only
     build the iframe on click, so the page stays fast and no third party
     hears about a visitor who did not ask to watch. */
  if (w.youtube) {
    const label = w.videoAlt || w.title;
    return `<div class="yt">
  <button class="yt-play" type="button" data-id="${esc(w.youtube)}"
          data-label="${esc(label)}" aria-label="Play video: ${esc(label)}">
    ${picture(w.poster || w.image, label, { sizes })}
    <span class="yt-btn" aria-hidden="true"><svg viewBox="0 0 68 48" width="68" height="48"><path class="yt-bg" d="M66.5 7.7c-.8-2.9-3.1-5.2-6-6C55.2 0 34 0 34 0S12.8 0 7.5 1.7c-2.9.8-5.2 3.1-6 6C0 13 0 24 0 24s0 11 1.5 16.3c.8 2.9 3.1 5.2 6 6C12.8 48 34 48 34 48s21.2 0 26.5-1.7c2.9-.8 5.2-3.1 6-6C68 35 68 24 68 24s0-11-1.5-16.3z"/><path d="M45 24 27 14v20z" fill="#fff"/></svg></span>
  </button>
  <noscript><p class="muted"><a href="https://www.youtube.com/watch?v=${esc(w.youtube)}">Watch on YouTube</a></p></noscript>
</div>`;
  }

  if (!w.video) {
    return picture(w.image, w.imageAlt || `${w.title}, ${site.name}`, { sizes, zoom: true, fit: w.fit || "" });
  }
  return `<video controls preload="none" playsinline
    poster="/assets/img/${esc(w.poster || "lotr-poster")}.jpg"
    aria-label="${esc(w.videoAlt || w.title)}">
  <source src="/assets/video/${esc(w.video)}" type="video/mp4">
  <p>Your browser cannot play this video.
     <a href="/assets/video/${esc(w.video)}">Download it instead.</a></p>
</video>`;
}

function workPage() {
  const items = site.work
    .map(
      (w, i) => `
<article class="work-item${i % 2 ? " reverse" : ""}">
  <div class="work-media${w.video || w.youtube ? " has-video" : ""}">${workMedia(w)}</div>
  <div class="work-copy">
    <p class="eyebrow">${esc(w.partner)} &middot; ${esc(w.year)}</p>
    <h2>${esc(w.title)}</h2>
    <p class="role">${esc(w.role)}</p>
    <p>${rich(w.body)}</p>
    <ul class="ticks">${w.results.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
  </div>
</article>`
    )
    .join("\n");

  const body = `
<section class="page-head">
  <div class="wrap">
    <h1>Work</h1>
    <p class="lede">${led("Shows, tournaments, and brand programs, from concept through delivery.")}</p>
  </div>
</section>
<section class="section"><div class="wrap work-list">${items}</div></section>
<section class="section closer">
  <div class="wrap closer-inner">
    <h2>${led("Have an exciting project in mind?")}</h2>
    <a class="btn btn-primary" href="/contact/">Get in touch</a>
  </div>
</section>`;

  return layout({
    title: "Work",
    canonical: "/work/",
    description: `Selected work by ${site.name}: Packs.com, Riftbound, Duel Land for FlyQuest, the Hotline League Worlds Tour, and a long-running Alienware partnership.`,
    body,
  });
}

/* --- consulting ----------------------------------------------------------- */

function consultingPage() {
  const c = site.consulting;
  const areas = c.areas
    .map(
      (a) => `<article class="card">
      <h2>${esc(a.title)}</h2>
      <ul class="ticks">${a.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </article>`
    )
    .join("\n      ");

  const body = `
<section class="page-head has-media">
  <div class="wrap head-grid">
    <div>
      <h1>Consulting</h1>
      <p class="lede">${rich(c.intro)}</p>
    </div>
    <div class="head-media">
      ${picture("travis-panel", `${site.name} speaking on stage`, { sizes: "(max-width: 900px) 100vw, 44vw", zoom: true })}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap"><div class="cards">${areas}</div></div>
</section>

<section class="section section-alt">
  <div class="wrap two-col">
    <div class="col-head"><h2>Track record</h2></div>
    <div class="col-body">
      <ul class="ticks big">${c.proof.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
    </div>
  </div>
</section>

<section class="section closer">
  <div class="wrap closer-inner">
    <h2>Tell me what you are building</h2>
    <p class="lede">${led("Hourly and project-based engagements. Email is the fastest route.")}</p>
    ${mailLink("Email me", { className: "btn btn-primary" })}
  </div>
</section>`;

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${site.name} Marketing and Partnership Consulting`,
    provider: { "@id": `${site.url}/#person` },
    areaServed: "Worldwide",
    description: plain(c.intro),
    serviceType: c.areas.map((a) => a.title),
  };

  return layout({
    title: "Consulting",
    canonical: "/consulting/",
    description: `${site.name} consults on influencer marketing, event partnerships, and content strategy for brands and tournament organizers in gaming and trading card games.`,
    body,
    jsonLd: [serviceLd],
  });
}

/* --- contact -------------------------------------------------------------- */

function contactPage() {
  const body = `
<section class="page-head">
  <div class="wrap">
    <h1>Contact</h1>
    <p class="lede">${bind(esc(site.contact.intro))}</p>
  </div>
</section>

<section class="section">
  <div class="wrap contact-grid">
    <div>
      <p class="mailwrap">${mailLink("Show my email address", { className: "mailto", show: true, icon: true })}</p>
      <noscript><p class="muted">JavaScript is off, so the address is hidden from
        harvesters. It is my first name, at this domain.</p></noscript>
      <ul class="reasons">
        ${site.contact.reasons
          .map((r) => `<li><strong>${esc(r.title)}</strong><span>${esc(r.body)}</span></li>`)
          .join("\n        ")}
      </ul>
    </div>
    <div class="contact-side">
      ${picture("travis-studio", `Studio portrait of ${site.name}`, { sizes: "(max-width: 900px) 100vw, 40vw", className: "portrait", zoom: true })}
    </div>
  </div>
</section>`;

  return layout({
    title: "Contact",
    canonical: "/contact/",
    description: `Get in touch with ${site.name} about sponsorship, brand partnerships, consulting engagements, press enquiries, hosting, and panel appearances.`,
    body,
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "ContactPage",
      url: `${site.url}/contact/`,
      mainEntity: { "@id": `${site.url}/#person` },
    }],
  });
}

/* --- links (the Linktree replacement) ------------------------------------- */

function linksPage() {
  const l = site.links;
  const p = l.promo;

  const items = l.items
    .map((i) => {
      const external = /^https?:\/\//.test(i.url);
      const rel = i.sponsored ? "sponsored noopener" : external ? "noopener" : "";
      return `<li><a href="${esc(i.url)}"${rel ? ` rel="${rel}"` : ""}>
      <span class="link-label">${esc(i.label)}</span>
      ${i.note ? `<span class="link-note">${esc(i.note)}</span>` : ""}
    </a></li>`;
    })
    .join("\n    ");

  const body = `
<section class="links-page">
  <div class="wrap links-wrap">
    <div class="links-panel">
      <button class="share-btn" type="button" aria-label="Share this page" title="Share this page">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 16V4"/><path d="m7 9 5-5 5 5"/>
          <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>
        </svg>
      </button>
      <span class="share-toast" role="status" aria-live="polite"></span>
      <div class="links-head">
        ${picture("travis-avatar", `${site.name}`, { sizes: "160px", className: "avatar", widths: [320, 640] })}
        <h1>${esc(site.name)}</h1>
        <p class="muted">${esc(l.intro)}</p>
      </div>
      <ul class="linklist">
      ${items}
      </ul>
      <p class="links-foot"><a href="/">More about my work &rarr;</a></p>
    </div>
  </div>
</section>`;

  return layout({
    title: "Links",
    canonical: "/links/",
    description: `Every channel, social account, and way to reach ${site.name} in one place. YouTube, Twitch, Discord, and enquiries about working together.`,
    body,
    bodyClass: "links",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        url: `${site.url}/links/`,
        mainEntity: { "@id": `${site.url}/#person` },
      },
      ...(p && p.show ? [{
        "@context": "https://schema.org",
        "@type": "Offer",
        name: `${p.partner} affiliate code ${p.code}`,
        description: `Affiliate code ${p.code} for a ${p.benefit} at ${p.partner}.`,
        url: p.url,
        seller: { "@type": "Organization", name: p.partner, url: "https://packs.com/" },
        offeredBy: { "@id": `${site.url}/#person` },
        category: "Promo code",
      }] : []),
    ],
  });
}

/* --- blog ----------------------------------------------------------------- */

function loadPosts() {
  const dir = path.join(ROOT, "content/posts");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, body } = frontMatter(raw);
      // Filenames may be prefixed with a date for tidy sorting in the folder;
      // the URL drops it. 2026-07-31-my-post.md  ->  /blog/my-post/
      const fileSlug = f.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
      const slug = data.slug || fileSlug;
      const fileDate = (f.match(/^(\d{4}-\d{2}-\d{2})-/) || [])[1];
      return {
        slug,
        title: data.title || slug,
        date: data.date || fileDate || "1970-01-01",
        summary: data.summary || "",
        draft: String(data.draft || "").toLowerCase() === "true",
        html: markdown(body),
      };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function blogIndex(posts) {
  const list = posts.length
    ? `<ul class="postlist">${posts
        .map(
          (p) => `<li>
        <a href="/blog/${p.slug}/">
          <time datetime="${p.date}">${fmtDate(p.date)}</time>
          <h2>${esc(p.title)}</h2>
          ${p.summary ? `<p>${esc(p.summary)}</p>` : ""}
        </a>
      </li>`
        )
        .join("\n      ")}</ul>`
    : `<p class="muted">No posts yet.</p>`;

  const body = `
<section class="page-head">
  <div class="wrap">
    <h1>Blog</h1>
    <p class="lede">${led("Notes on the industry, the work, and whatever I am currently obsessed with.")}</p>
  </div>
</section>
<section class="section"><div class="wrap narrow">${list}</div></section>`;

  return layout({
    title: "Blog",
    canonical: "/blog/",
    description: `Notes from ${site.name} on gaming, esports, trading card games, and the business of making content. Fifteen years in the industry, written down as it happens.`,
    body,
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Blog",
      url: `${site.url}/blog/`,
      name: `${site.name} Blog`,
      author: { "@id": `${site.url}/#person` },
    }],
  });
}

function postPage(p) {
  const body = `
<article class="post">
  <div class="wrap narrow">
    <p class="eyebrow"><a href="/blog/">Blog</a></p>
    <h1>${esc(p.title)}</h1>
    <p class="post-meta"><time datetime="${p.date}">${fmtDate(p.date)}</time></p>
    <div class="prose">${p.html}</div>
    <p class="post-back"><a href="/blog/">&larr; All posts</a></p>
  </div>
</article>`;

  return layout({
    title: p.title,
    canonical: `/blog/${p.slug}/`,
    description: p.summary || `${p.title}, ${site.name}`,
    ogType: "article",
    body,
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.summary,
      datePublished: p.date,
      dateModified: p.date,
      url: `${site.url}/blog/${p.slug}/`,
      mainEntityOfPage: `${site.url}/blog/${p.slug}/`,
      author: { "@id": `${site.url}/#person` },
      publisher: { "@id": `${site.url}/#person` },
      image: `${site.url}/assets/img/og-image.jpg`,
    }],
  });
}

/* --- feeds and crawl files ------------------------------------------------ */

function rss(posts) {
  const items = posts
    .map(
      (p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${site.url}/blog/${p.slug}/</link>
    <guid isPermaLink="true">${site.url}/blog/${p.slug}/</guid>
    <pubDate>${new Date(p.date + "T12:00:00Z").toUTCString()}</pubDate>
    <description>${esc(p.summary)}</description>
  </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(site.name)} Blog</title>
  <link>${site.url}/blog/</link>
  <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
  <description>${esc(site.longDescription)}</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;
}

function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.url}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}<priority>${u.priority}</priority></url>`).join("\n")}
</urlset>`;
}

/* --- run ------------------------------------------------------------------ */

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyDir(path.join(ROOT, "public"), OUT);

const posts = loadPosts();

write("index.html", homePage());
write("work/index.html", workPage());
write("consulting/index.html", consultingPage());
write("contact/index.html", contactPage());
write("links/index.html", linksPage());
write("blog/index.html", blogIndex(posts));
for (const p of posts) write(`blog/${p.slug}/index.html`, postPage(p));

write("404.html", layout({
  title: "Page not found",
  canonical: "/404.html",
  description: `That page does not exist. Head back to ${site.name}'s homepage for his work, writing, and contact details.`,
  body: `<section class="page-head"><div class="wrap"><h1>Page not found</h1>
    <p class="lede">That link has moved or never existed.</p>
    <p><a class="btn btn-primary" href="/">Back to the homepage</a></p></div></section>`,
}));

/* Redirects for URLs that existed on the old Squarespace site.
   GitHub Pages has no server-side redirects, so each one is a tiny HTML page
   that bounces the visitor and tells search engines where the page moved. */
const REDIRECTS = {
  "/media/": "/work/",
};

for (const [from, to] of Object.entries(REDIRECTS)) {
  write(`${from.replace(/^\/|\/$/g, "")}/index.html`, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved | ${esc(site.name)}</title>
<link rel="canonical" href="${site.url}${to}">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url=${to}">
</head>
<body><p>This page moved. <a href="${to}">Continue to ${to}</a>.</p></body>
</html>`);
}

write("rss.xml", rss(posts));
write("sitemap.xml", sitemap([
  { loc: "/", priority: "1.0" },
  { loc: "/work/", priority: "0.9" },
  { loc: "/consulting/", priority: "0.9" },
  { loc: "/blog/", priority: "0.7" },
  { loc: "/contact/", priority: "0.7" },
  { loc: "/links/", priority: "0.5" },
  ...posts.map((p) => ({ loc: `/blog/${p.slug}/`, lastmod: p.date, priority: "0.6" })),
]));
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
write("CNAME", "www.travisgafford.com\n");

console.log(`Built ${5 + posts.length} pages (${posts.length} blog post${posts.length === 1 ? "" : "s"}) into _site/`);
