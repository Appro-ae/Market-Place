// Shared sidebar for the Super Portal mockups.
// Usage: <script src="shell.js" data-active="4"></script> as the FIRST element in <body>.
(function () {
  var active = document.currentScript.getAttribute('data-active') || '0';
  var icons = [
    '<path d="M4 12a8 8 0 1 1 3 6.2L4 20l1.1-3A8 8 0 0 1 4 12z"/>',
    '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
    '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M8 6h6a3 3 0 0 1 3 3v6"/><path d="M8 18h5"/>',
    '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10.5h18"/>',
    '<circle cx="10" cy="9" r="3"/><path d="M4 19c0-3.1 2.7-5 6-5s6 1.9 6 5"/><path d="M17 8.5l1.8 1.8L22 7"/>',
    '<rect x="4.5" y="3.5" width="15" height="17" rx="2.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
    '<path d="M5 5h3.6l1.8 4.4-2.2 1.3a11.5 11.5 0 0 0 5.1 5.1l1.3-2.2L19 15.4V19a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3.5 6.6 1.5 1.5 0 0 1 5 5z"/>',
    '<path d="M12 3.5l8.5 4-8.5 4-8.5-4z"/><path d="M3.5 11.5l8.5 4 8.5-4M3.5 15.5l8.5 4 8.5-4"/>',
    '<circle cx="9" cy="8.5" r="3"/><circle cx="17" cy="10.5" r="2.3"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/>'
  ];
  var html = '<div class="side">' +
    '<div class="brand"><svg viewBox="0 0 24 24"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#7A3FA8"/><stop offset="1" stop-color="#1F6FB2"/></linearGradient></defs>' +
    '<path d="M4 19 L10 4 M9 19 L15 4 M14 19 L20 4" stroke="url(#rg)" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg></div>' +
    '<div class="chev"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="hr"></div>';
  icons.forEach(function (d, i) {
    html += '<div class="ic' + (String(i) === active ? ' on' : '') + '"><svg viewBox="0 0 24 24">' + d + '</svg></div>';
  });
  html += '<div class="grow"></div>' +
    '<div class="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-4 3.3-6 7-6s7 2 7 6"/></svg></div>' +
    '<div class="ic"><svg viewBox="0 0 24 24"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M9 16l-4-4 4-4M5 12h9"/></svg></div>' +
    '</div>';
  document.write(html);
})();
