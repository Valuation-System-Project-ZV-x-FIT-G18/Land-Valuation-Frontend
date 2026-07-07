import type { Valuation, Evidence } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

// Builds the full valuation report as a styled HTML string (inline styles so it
// survives a Word/.doc export). Every value comes from the filled draft data.

const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const rs = (n: unknown) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString('en-US') + ' /-'

const photoUrl = (projectId: string, type: string) =>
  `/api/technical-officer/site-photos/file?projectId=${encodeURIComponent(projectId)}&photoType=${type}`

// The running page header: CodeHub logo (left), the valuer block (middle),
// the RICS Registered Valuer mark (right), with a small angular accent on top.
const pageHeader = () => `
<div style="position:relative">
  <div style="position:absolute;top:-24px;right:0;line-height:0">
    <svg viewBox="0 0 220 24" width="200" height="22" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="55,0 130,0 92,24" fill="#1f3a4d"/>
      <polygon points="120,0 220,0 220,24 158,24" fill="#9aa3ad"/>
    </svg>
  </div>
  <table style="width:100%;border-collapse:collapse;border-bottom:2px solid #1f3a4d">
   <tr>
    <td style="vertical-align:middle;width:24%;padding-bottom:6px">
      <div style="display:inline-block;text-align:center">
        <div style="background:#1f3a4d;color:#fff;padding:4px 14px;font-family:Arial,sans-serif;font-weight:800;font-size:15px">CodeHub</div>
        <div style="border-top:1px solid #1f3a4d;font-family:Arial,sans-serif;font-size:7px;color:#666;padding-top:1px">Your Land Valuation Partner</div>
      </div>
    </td>
    <td style="vertical-align:middle;font-family:Arial,sans-serif;font-size:11px;color:#222;padding:0 0 6px 10px;line-height:1.4">
      <div style="font-weight:700">Vlr. H.M.R.R.Narampanawa <span style="font-size:9px">(FRICS)</span></div>
      <div>Chartered Valuation Surveyor</div>
      <div>RICS - 6698015 | IVSL - F/315</div>
    </td>
    <td style="vertical-align:middle;text-align:right;width:22%;padding-bottom:6px">
      <div style="display:inline-block;text-align:center;font-family:Arial,sans-serif">
        <div style="font-weight:900;font-size:22px;letter-spacing:1px;color:#111">RICS</div>
        <div style="font-size:8px;color:#333;letter-spacing:.5px">Registered Valuer</div>
      </div>
    </td>
   </tr>
  </table>
</div>`

// The running page footer: the firm's contact bar + a small bottom accent.
const pageFooter = () => `
<div style="margin-top:24px;border-top:2px solid #1f3a4d;padding-top:6px;font-family:Arial,sans-serif;font-size:9px;color:#333;text-align:center;line-height:1.7">
  <div>📍 92/A, Kalukondayawa, Malwana, Sri Lanka. &nbsp;|&nbsp; Head Office: 508/2/4, Awissawella Road, Kaduwela, Sri Lanka.</div>
  <div>📞 +94 773 623 550 | +94 112 539 977 &nbsp;&nbsp; ✉ valuer.jayathilake@gmail.com &nbsp;&nbsp; 🌐 www.ijvr.lk</div>
</div>`

// Page 2 — the covering letter. Self-contained (its own header/footer) and
// ends with a page break so NO other section shares this page.
const letterPage = (v: Record<string, string>) => {
  const g = (k: string) => esc(v[k])
  const num = (k: string) => (v[k] ? Number(v[k]).toLocaleString('en-US') : '')
  const title = `VALUATION REPORT OF PROPERTY DEPICTED AS LOT NO. ${g('lotNo')} IN SURVEY PLAN NO. ${g('surveyPlanNo')} DATED ${g('surveyDate')} MADE BY ${g('surveyorName')} LICENSED SURVEYOR`
  return `
  <div style="page-break-after:always;min-height:1000px;display:flex;flex-direction:column">
   ${pageHeader()}
   <div style="flex:1;font-family:Calibri,Arial,sans-serif;font-size:12px;color:#111;line-height:1.6;margin-top:22px">
     <table style="width:100%;border-collapse:collapse;font-size:12px">
      <tr>
       <td style="width:38%"><span style="border:1px solid #333;padding:4px 12px;font-weight:700">Ref/${g('projectId')}/2025</span></td>
       <td style="width:32%;text-align:center;font-weight:700">Confidential</td>
       <td style="width:30%;text-align:right;font-weight:700">${g('valuationDate')}</td>
      </tr>
     </table>
     <p style="margin:20px 0 0">The Manager,<br>${g('bankName')},<br>${g('branchName')}.</p>
     <p style="margin:16px 0">Dear Sir,</p>
     <p style="text-align:center;font-weight:700;text-decoration:underline;margin:0 16px">${title}</p>
     <p style="margin:16px 0;text-align:justify">The Manager of ${g('bankName')}- ${g('branchName')} has requested by his letter dated ${g('valuationRequestDate')} to inspect the property depicted as Lot No. ${g('lotNo')} in Survey Plan No. ${g('surveyPlanNo')} dated ${g('surveyDate')} made by ${g('surveyorName')} Licensed Surveyor, situated at ${g('propertyLocationCity')} within the administrative limits of ${g('urbanCouncil')} Urban Council and furnish a valuation report for the estimation of both market value and forced sale value for the purpose of secured lending.</p>
     <p style="margin:14px 0 6px;font-weight:700">The valuation details are as follows;</p>
     <p style="margin:6px 0 2px;font-weight:700;text-decoration:underline">Land Only</p>
     <table style="width:100%;font-size:12px">
       <tr><td style="font-weight:700">Market Value as at ${g('valuationDate')}</td><td style="text-align:right;font-weight:700">; - Rs. ${num('marketValue')} /-</td></tr>
       <tr><td style="font-weight:700">Forced Sale value as at ${g('valuationDate')}</td><td style="text-align:right;font-weight:700">; - Rs. ${num('forcedSaleValue')} /-</td></tr>
     </table>
     <p style="margin:18px 0">Further details are included in the report. Please refer the annexure 01 mentioned below.</p>
   </div>
   ${pageFooter()}
  </div>`
}

// The report cover / title page. Matches the CODEHUB template: REF top-left,
// logo top-right, big "VALUATION REPORT" title, the property block, and the
// valuer's block bottom-right. Ends with a page break so the letter starts next.
const coverPage = (v: Record<string, string>) => {
  // Plain centered value (the dots/#N in the template were only placeholders).
  const line = (t: string) =>
    t && t.trim()
      ? `<div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#111">${esc(t)}</div>`
      : ''

  const nameWithInitials = v.nameWithInitials || v.ownerName || ''
  const details = [
    line(v.landName), // #2 land name (if applicable)
    nameWithInitials ? line(`( ${nameWithInitials} )`) : '', // #3
    line(v.propAddressLine1), // #4 address line 1
    line(v.propAddressLine2), // #5 address line 2
    line(v.propertyLocationCity), // #6 city
    line(v.district), // #7 district
  ].filter(Boolean).join('')

  return `
  <div style="page-break-after:always">
   <div style="position:relative;box-sizing:border-box;min-height:1000px;border:2px solid #1f3a4d;border-radius:6px;padding:26px 32px;font-family:Georgia,'Times New Roman',serif">
    <!-- REF (top-left) + CODEHUB logo (top-right) -->
    <table style="width:100%;border-collapse:collapse">
     <tr>
      <td style="vertical-align:top">
        <span style="display:inline-block;border:1px solid #333;padding:5px 12px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px">REF - ${esc(v.projectId) || '____'}</span>
      </td>
      <td style="vertical-align:top;text-align:right">
        <div style="display:inline-block;text-align:center">
          <div style="background:#1f3a4d;color:#fff;padding:5px 18px;font-family:Arial,sans-serif;font-weight:800;font-size:15px;letter-spacing:.5px">CodeHub</div>
          <div style="border-top:1px solid #1f3a4d;margin-top:2px;padding-top:2px;font-family:Arial,sans-serif;font-size:7px;color:#666;letter-spacing:.5px">Your Land Valuation Partner</div>
        </div>
      </td>
     </tr>
    </table>

    <!-- Title -->
    <div style="text-align:center;margin-top:170px">
      <div style="font-size:66px;font-weight:700;line-height:1.02;color:#111">VALUATION<br>REPORT</div>
      <div style="width:76%;margin:30px auto 0;border-top:4px solid #1f3a4d"></div>
    </div>

    <!-- Property / owner block with dotted leaders -->
    <div style="text-align:center;margin-top:34px;line-height:2.1">
      ${details || '<div style="color:#999">________</div>'}
    </div>

    <!-- Decorative corner (bottom-right) -->
    <div style="position:absolute;bottom:0;right:0;line-height:0">
      <svg viewBox="0 0 260 200" width="250" height="192" xmlns="http://www.w3.org/2000/svg">
        <polygon points="260,45 260,200 95,200" fill="#1f3a4d"/>
        <polygon points="160,200 260,95 260,200" fill="#3f6b86"/>
        <polygon points="120,92 205,178 35,178" fill="#ffffff" stroke="#1f3a4d" stroke-width="1.6"/>
        <polyline points="35,178 120,120 205,178" fill="none" stroke="#1f3a4d" stroke-width="1.6"/>
      </svg>
    </div>

    <!-- Valuer block (bottom-right, above the corner art) -->
    <div style="position:absolute;bottom:34px;right:26px;border:1.5px solid #1f3a4d;padding:10px 16px;font-family:Arial,sans-serif;font-size:11px;line-height:1.55;background:#fff;max-width:290px">
      <div>Vlr. H.M.R.R. Narampanawa</div>
      <div>Chartered Valuation Surveyor</div>
      <div>RICS Registered No. 6698015 (FRICS)</div>
      <div>IVSL – F/315</div>
    </div>
   </div>
  </div>`
}

const H = (n: string, t: string) =>
  `<h3 style="font-size:13px;font-weight:700;color:#0f766e;border-bottom:1px solid #ccc;padding-bottom:3px;margin:16px 0 8px">${n} ${esc(t)}</h3>`
// Paragraph — renders nothing when there's no text (so empty sections vanish).
const P = (t: string) => (esc(t) ? `<p style="margin:6px 0;text-align:justify">${esc(t)}</p>` : '')
// Section = header + body, but only if the body has content (hides empty sections).
const sec = (n: string, title: string, body: string) => (body && body.trim() ? H(n, title) + body : '')
// Label/value table row — omitted entirely when the value is empty.
const row = (label: string, value: string) =>
  value && value.trim()
    ? `<tr><td style="padding:2px 10px 2px 0;vertical-align:top">${esc(label)}</td><td>${value}</td></tr>`
    : ''

// A photo row: label + the uploaded image + its caption.
const photoRow = (projectId: string, type: string, label: string, caption: string) => `
 <tr>
  <td style="border:1px solid #bbb;padding:6px;width:26%;font-weight:600">${label}</td>
  <td style="border:1px solid #bbb;padding:6px;width:30%;text-align:center">
    <img src="${photoUrl(projectId, type)}" style="max-width:170px;max-height:120px" onerror="this.style.display='none';this.parentNode.innerHTML='<span style=color:#999>no photo</span>'"/>
  </td>
  <td style="border:1px solid #bbb;padding:6px">${esc(caption)}</td>
 </tr>`

// The officer's edited Section 9 evidence (from Generate Descriptions), if any.
type SavedEvidence = { rows?: { refNo: string; remarks: string; pricePerPerch: number }[]; rangeStatement?: string }

export function buildReportHtml(
  v: Record<string, string>,
  valuation: Valuation | null,
  evidence: Evidence | null,
  projectId: string,
  savedEvidence?: SavedEvidence | null,
): string {
  const val = (k: string) => esc(v[k]) // empty string when missing (no placeholder)
  const gps = (v.gpsCoordinates || '').split(',').map((x) => x.trim())
  const hasGps = gps.length === 2 && gps[0] && gps[1]
  const lat = hasGps ? Number(gps[0]) : 0
  const lng = hasGps ? Number(gps[1]) : 0
  const d = 0.0025 // ~250 m half-window for a zoomed view
  // Free OpenStreetMap static map (street view).
  const mapImg = hasGps
    ? `<img src="https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=360x260&markers=${lat},${lng},red" style="max-width:100%;border:1px solid #bbb"/>`
    : '<span style="color:#999">[ Location map ]</span>'
  // Free Esri World Imagery static export (satellite view) — same imagery as GPS & Map.
  const satImg = hasGps
    ? `<img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&bboxSR=4326&size=360,260&format=png&f=image" style="max-width:100%;border:1px solid #bbb" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=color:#999>[ Satellite view unavailable ]</span>')"/>`
    : '<span style="color:#999">[ Satellite view ]</span>'

  const valuationTbl = valuation
    ? `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px">
        <tr><td style="border:1px solid #bbb;padding:6px" colspan="2"><b>Land</b></td><td style="border:1px solid #bbb;padding:6px;text-align:right"></td></tr>
        <tr><td style="border:1px solid #bbb;padding:6px">Total Extent</td><td style="border:1px solid #bbb;padding:6px">${esc(valuation.extentText)}</td><td style="border:1px solid #bbb;padding:6px"></td></tr>
        <tr><td style="border:1px solid #bbb;padding:6px">${esc(valuation.extentText)} of land @ ${rs(valuation.ratePerPerch)} per perch</td><td style="border:1px solid #bbb;padding:6px"></td><td style="border:1px solid #bbb;padding:6px;text-align:right">${rs(valuation.landValue)}</td></tr>
        <tr><td style="border:1px solid #bbb;padding:6px">Market value of land and building</td><td style="border:1px solid #bbb;padding:6px"></td><td style="border:1px solid #bbb;padding:6px;text-align:right">${rs(valuation.marketValue)}</td></tr>
        <tr><td style="border:1px solid #bbb;padding:6px"><b>Say</b></td><td style="border:1px solid #bbb;padding:6px"></td><td style="border:1px solid #bbb;padding:6px;text-align:right"><b>${rs(valuation.say)}</b></td></tr>
       </table>
       <div style="font-size:11px;margin-top:6px"><b>Notes</b><ol style="margin:4px 0 0 18px">${(valuation.notes || []).map((n) => `<li>${esc(n)}</li>`).join('')}</ol></div>`
    : P(v.valuationText || '')

  // Prefer the officer's edited evidence table (Generate Descriptions); else the nearby analysis.
  const evidenceRows =
    savedEvidence?.rows?.length
      ? savedEvidence.rows.map((r) => `<tr><td style="border:1px solid #bbb;padding:5px">${esc(r.refNo)}</td><td style="border:1px solid #bbb;padding:5px;white-space:pre-line">${esc(r.remarks)}</td><td style="border:1px solid #bbb;padding:5px;text-align:right">${rs(r.pricePerPerch)}</td></tr>`).join('')
      : (evidence?.comparables ?? []).map((c) => `<tr><td style="border:1px solid #bbb;padding:5px">${esc(c.refNo || c.evidenceType)}</td><td style="border:1px solid #bbb;padding:5px">${esc(c.date)} · ${esc(c.extentPerches)}P · ${esc(c.distanceKm)} km · ${esc(c.source)}</td><td style="border:1px solid #bbb;padding:5px;text-align:right">${rs(c.pricePerPerch)}</td></tr>`).join('')
  const evidenceTbl = evidenceRows
    ? `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px">
        <tr style="background:#f0f0f0"><th style="border:1px solid #bbb;padding:5px;text-align:left">Ref. No</th><th style="border:1px solid #bbb;padding:5px;text-align:left">Details</th><th style="border:1px solid #bbb;padding:5px;text-align:right">Per perch</th></tr>${evidenceRows}
       </table>${savedEvidence?.rangeStatement ? P(savedEvidence.rangeStatement) : ''}`
    : ''

  const extentTbl = `<table style="width:100%;border-collapse:collapse;font-size:12px">
     <tr><td style="border:1px solid #bbb;padding:6px;width:50%"><b>Survey Plan</b> — Lot ${val('lotNo')} in Plan No. ${val('surveyPlanNo')} dated ${val('surveyDate')}<br>${val('extentAcres')}A - ${val('extentRoods')}R - ${val('extentPerches')}P (${val('extentHectares')} Ha)</td>
         <td style="border:1px solid #bbb;padding:6px"><b>Deed</b> — No. ${val('deedNo')} dated ${val('deedDate')}, ${val('attorney')}<br>${val('deedAcres')}A - ${val('deedRoods')}R - ${val('deedPerches')}P (${val('deedHectares')} Ha)</td></tr>
    </table>`

  const boundaryTbl = `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px">
     <tr style="background:#f0f0f0"><th style="border:1px solid #bbb;padding:5px"></th><th style="border:1px solid #bbb;padding:5px">On Plan</th><th style="border:1px solid #bbb;padding:5px">On Site</th></tr>
     <tr><td style="border:1px solid #bbb;padding:5px">North</td><td style="border:1px solid #bbb;padding:5px">${val('boundaryNorth')}</td><td style="border:1px solid #bbb;padding:5px">${val('siteBoundaryNorth')}</td></tr>
     <tr><td style="border:1px solid #bbb;padding:5px">East</td><td style="border:1px solid #bbb;padding:5px">${val('boundaryEast')}</td><td style="border:1px solid #bbb;padding:5px">${val('siteBoundaryEast')}</td></tr>
     <tr><td style="border:1px solid #bbb;padding:5px">South</td><td style="border:1px solid #bbb;padding:5px">${val('boundarySouth')}</td><td style="border:1px solid #bbb;padding:5px">${val('siteBoundarySouth')}</td></tr>
     <tr><td style="border:1px solid #bbb;padding:5px">West</td><td style="border:1px solid #bbb;padding:5px">${val('boundaryWest')}</td><td style="border:1px solid #bbb;padding:5px">${val('siteBoundaryWest')}</td></tr>
    </table>`

  // #71 survey plan image (from the Create Project upload; hidden if not an image).
  const surveyPlanImg = `<img src="/api/coordinator/projects/file?projectId=${encodeURIComponent(projectId)}&type=surveyPlan" style="max-width:100%;border:1px solid #bbb" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=color:#999>[ Survey plan not available as an image ]</span>')"/>`

  // #89 additional site photographs — only the uploaded ones render.
  const addTypes: [string, string][] = [
    ['gateEntrance', 'Gate / Entrance'], ['drainage', 'Drainage'], ['roadFrontage', 'Road Frontage'],
    ['soilCondition', 'Soil Condition'], ['unauthorizedStructures', 'Unauthorized Structures'],
    ['floodEvidence', 'Flood Evidence'], ['notableFeatures', 'Notable Features'],
    ['surroundingArea', 'Surrounding Area'], ['nearbyFacilities', 'Nearby Facilities'],
  ]
  const additionalPhotos = `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${addTypes
    .map(([t, label]) => `<figure style="margin:0;text-align:center;font-size:10px"><img src="${photoUrl(projectId, t)}" style="max-width:150px;max-height:110px;display:block" onerror="this.parentNode.style.display='none'"/>${label}</figure>`)
    .join('')}</div>`

  const photos = `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px">
     ${photoRow(projectId, 'accessRoad', 'Access road', v.photoAccessRoad || '')}
     ${photoRow(projectId, 'routeFromMainRoad', 'Route from main road', v.photoRouteFromMainRoad || '')}
     ${photoRow(projectId, 'frontView', 'Front view', v.photoFrontView || '')}
     ${photoRow(projectId, 'rearView', 'Rear view', v.photoRearView || '')}
     ${photoRow(projectId, 'leftSideView', 'Left side view', v.photoLeftSide || '')}
     ${photoRow(projectId, 'rightSideView', 'Right side view', v.photoRightSide || '')}
     ${photoRow(projectId, 'northBoundary', 'North boundary', v.photoNorthBoundary || '')}
     ${photoRow(projectId, 'eastBoundary', 'East boundary', v.photoEastBoundary || '')}
     ${photoRow(projectId, 'southBoundary', 'South boundary', v.photoSouthBoundary || '')}
     ${photoRow(projectId, 'westBoundary', 'West boundary', v.photoWestBoundary || '')}
    </table>`

  return `<div style="font-family:Calibri,Arial,sans-serif;font-size:12px;color:#111;line-height:1.5">
   ${coverPage(v)}
   ${letterPage(v)}
   ${pageHeader()}
   <div style="margin-top:16px"></div>
   ${(() => {
     const mortgagor = [v.nameWithInitials, [v.addressLine1, v.addressLine2].filter(Boolean).join(' '), v.ownerCity].filter(Boolean).map(esc).join(', ')
     const rows = [
       row('Mortgagor', mortgagor),
       row('Contact', val('contactNo')),
       row('Type of property', val('propertyType')),
       row('Address', val('propertyAddress')),
       row('Party present', val('presentedParty')),
       row('Inspection / Valuation', [v.inspectionDate, v.valuationDate].filter(Boolean).map(esc).join(' / ')),
     ].join('')
     return rows ? `${H('4.', 'CLIENT INFORMATION')}<table style="font-size:12px">${rows}</table>` : ''
   })()}

   ${sec('5.1', 'SITUATION', P(v.localityDescription))}
   ${H('5.2.1', 'EXTENT & DEED')}${extentTbl}
   ${H('5.2.3', 'BOUNDARIES')}${boundaryTbl}${v.accessFromBoundary ? `<p style="margin:6px 0">The main access to the property is from its ${val('accessFromBoundary')} boundary.</p>` : ''}
   ${H('5.2.4', 'SURVEY PLAN')}<div style="margin:8px 0">${surveyPlanImg}</div>
   ${sec('5.3', 'ACCESS & LOCATION', P(v.accessLocationDescription) + (v.gpsCoordinates ? `<p>Coordinates: ${val('gpsCoordinates')}</p>` : ''))}
   ${hasGps ? `<div style="display:flex;flex-wrap:wrap;gap:10px;margin:8px 0">
     <figure style="margin:0;text-align:center;font-size:10px;color:#555">Satellite view<br>${satImg}</figure>
     <figure style="margin:0;text-align:center;font-size:10px;color:#555">Map view<br>${mapImg}</figure>
   </div>` : ''}
   ${sec('5.4', 'DESCRIPTION OF THE LAND', P(v.landDescription))}
   ${H('5.5', 'PHOTOGRAPHS OF THE PROPERTY')}${photos}
   ${P(v.imageAnalysis)}
   ${H('', 'Additional photographs')}${additionalPhotos}
   ${sec('6.1.1', 'OWNERSHIP', P(v.legalDescription))}
   ${sec('6.1.2', 'LOCAL AUTHORITY TAX', P(v.localAuthorityTax))}
   ${sec('6.1.3', 'STREET LINE & BUILDING LIMITS', P(v.streetLineBuildingLimits))}
   ${sec('6.2.1', 'MANDATORY REQUIREMENTS', P(v.mandatoryRequirements))}
   ${sec('7.', 'LOCALITY', P(v.localityFacilities))}
   ${sec('9.', 'EVIDENCE OF LAND VALUES', P(v.nearbyPropertyDetails) + evidenceTbl)}
   ${v.previouslyValued ? `${H('10.', 'BASE OF VALUATION & RATIONALE')}<p>I have ${val('previouslyValued')} this property previously.</p>` : ''}
   ${valuation ? `${H('11.', 'VALUATION')}${valuationTbl}` : ''}
   ${sec('12.', 'CONCLUSION', P(v.conclusion))}
   ${(v.marketValue || v.forcedSaleValue) ? `${H('13.', 'SUMMARY')}
   <table style="width:100%;font-size:12px">
     ${row(`Market Value as at ${v.valuationDate || ''}`, v.marketValue ? `<b>${rs(v.marketValue)}</b>${v.marketValueWords ? ` (${esc(v.marketValueWords)})` : ''}` : '')}
     ${row(`Forced Sale Value as at ${v.valuationDate || ''}`, v.forcedSaleValue ? `<b>${rs(v.forcedSaleValue)}</b>${v.forcedSaleValueWords ? ` (${esc(v.forcedSaleValueWords)})` : ''}` : '')}
    </table>` : ''}
   ${H('14.', 'CERTIFICATION')}
   ${P(`I certify that the property inspected and valued by me corresponds precisely to Lot No. ${v.lotNo || ''} in Survey Plan No. ${v.surveyPlanNo || ''} dated ${v.surveyDate || ''} made by ${v.surveyorName || ''} Licensed Surveyor. I recommend that the above estimated values are fair and reasonable.`)}
   <p style="margin-top:18px">Vlr. H.M.R.R. Narampanawa (FRICS)<br>RICS Registered Chartered Valuation Surveyor<br>Panel Valuer of ${val('bankName')}</p>
  </div>`
}
