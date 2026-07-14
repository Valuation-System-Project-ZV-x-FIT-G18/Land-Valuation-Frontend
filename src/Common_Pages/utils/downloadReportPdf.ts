// Downloads a report (given as a styled HTML string) as a PDF.
//
// Instead of a canvas library (jsPDF / html2pdf), we open the report in a
// print window and let the browser "Save as PDF". Real browser rendering keeps
// the CODEHUB letterhead, the `page-break-after` page breaks, the tables and —
// crucially — the external cross-origin map images (OpenStreetMap / ArcGIS),
// which would taint a <canvas> and break a canvas-based export. It also gives
// real, selectable (vector) text and needs no extra dependencies.
//
// `filename` (without extension) becomes the print window title, which browsers
// use as the default "Save as PDF" file name.
export function downloadReportPdf(reportHtml: string, filename: string) {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Please allow pop-ups for this site so the PDF can be generated.')
    return
  }

  const doc = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${filename}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  html, body { margin: 0; padding: 0; }
  body { color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  img { max-width: 100%; }
</style>
</head>
<body>
${reportHtml}
<script>
  (function () {
    function print() { try { window.focus(); window.print(); } catch (e) {} }
    // Close the tab once the print/save dialog is done.
    window.addEventListener('afterprint', function () { window.close(); });
    // Wait for images (incl. the external map tiles) so nothing prints blank.
    var pending = Array.prototype.slice.call(document.images).filter(function (i) { return !i.complete; });
    if (!pending.length) { setTimeout(print, 200); return; }
    var left = pending.length, fired = false;
    function ready() { if (--left <= 0 && !fired) { fired = true; print(); } }
    pending.forEach(function (i) { i.addEventListener('load', ready); i.addEventListener('error', ready); });
    // Safety net if an image hangs — print anyway after 4s.
    setTimeout(function () { if (!fired) { fired = true; print(); } }, 4000);
  })();
</script>
</body>
</html>`

  win.document.open()
  win.document.write(doc)
  win.document.close()
}
