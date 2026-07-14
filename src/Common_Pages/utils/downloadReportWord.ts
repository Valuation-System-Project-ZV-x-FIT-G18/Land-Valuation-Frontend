// Downloads a report (given as a styled HTML string) as an editable Word file.
//
// The report is wrapped in a Word-flavoured HTML document and saved with a
// `.doc` extension + the `application/msword` type. Microsoft Word (and
// LibreOffice / Google Docs) open this directly and it stays fully editable —
// tables, headings and images are preserved. This needs no libraries, and
// unlike a binary `.docx` generator it keeps the external map images working
// (Word fetches the image URLs when the document is opened).
//
// `filename` is given without an extension.
export function downloadReportWord(reportHtml: string, filename: string) {
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>${filename}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>@page { size: A4; margin: 16mm 14mm; } body { font-family: Calibri, Arial, sans-serif; color: #111; }</style>
</head>
<body>${reportHtml}</body>
</html>`
  // The BOM (﻿) makes Word read the file as UTF-8.
  const blob = new Blob(['﻿', doc], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.doc`
  a.click()
  URL.revokeObjectURL(url)
}
