/* Minimal Markdown -> HTML converter.
   Deliberately small and dependency-free. Supports the subset a personal blog
   actually needs: headings, paragraphs, bold/italic/code, links, images,
   blockquotes, ordered and unordered lists, fenced code blocks, and rules. */

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function inline(s) {
  const codes = [];
  // Pull inline code out first so its contents are never re-parsed.
  s = s.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return "\uE000" + (codes.length - 1) + "\uE000";
  });

  s = esc(s);
  // Images before links — the syntax only differs by a leading "!".
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, alt, src, title) =>
      `<img src="${src}" alt="${alt}"${title ? ` title="${title}"` : ""} loading="lazy" decoding="async">`
  );
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
    const ext = /^https?:\/\//.test(href);
    return `<a href="${href}"${ext ? ' rel="noopener"' : ""}>${text}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/\uE000(\d+)\uE000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
  return s;
}

export function markdown(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;

  const flushList = (ordered, items) => {
    const tag = ordered ? "ol" : "ul";
    out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</${tag}>`);
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Fenced code
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(
        `<pre><code${lang ? ` class="lang-${lang}"` : ""}>${esc(buf.join("\n"))}</code></pre>`
      );
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote>${markdown(buf.join("\n"))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i]))
        items.push(lines[i++].replace(/^\s*[-*+]\s+/, ""));
      flushList(false, items);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]))
        items.push(lines[i++].replace(/^\s*\d+\.\s+/, ""));
      flushList(true, items);
      continue;
    }

    // Raw HTML block — passed through untouched.
    if (/^\s*<(figure|div|iframe|video|table|section|p|img)\b/i.test(line)) {
      const buf = [];
      while (i < lines.length && lines[i].trim()) buf.push(lines[i++]);
      out.push(buf.join("\n"));
      continue;
    }

    // Paragraph
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|>\s?|```|\s*[-*+]\s+|\s*\d+\.\s+)/.test(lines[i]) &&
      !/^(-{3,}|\*{3,})\s*$/.test(lines[i])
    ) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }

  return out.join("\n");
}

/* Front matter: a --- delimited block of key: value pairs at the top of a file. */
export function frontMatter(src) {
  const m = src.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim().replace(/^["'](.*)["']$/, "$1");
    data[kv[1]] = v;
  }
  return { data, body: m[2] };
}
