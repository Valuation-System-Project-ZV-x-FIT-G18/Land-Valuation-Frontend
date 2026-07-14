import type { Valuation, Evidence } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

// Builds the valuation report as a styled HTML string that mirrors the firm's
// template document EXACTLY (the #1..#204 placeholder layout): the same cover /
// covering-letter / limitations / assumptions / compliance pages, the same
// numbered sections (1..14) and the same wording. Every #N position is filled
// from the project data; a field with no data shows a highlighted "[To be
// filled]" marker (never blank) so the officer can see what still needs input.
//
// Inline styles are used throughout so the report survives a PDF (print) or a
// Word (.doc) export unchanged.

const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const rs = (n: unknown) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString('en-US') + ' /-'

const photoUrl = (projectId: string, type: string) =>
  `/api/technical-officer/site-photos/file?projectId=${encodeURIComponent(projectId)}&photoType=${type}`

// Highlighted marker shown wherever a field has no data (kept visible on
// purpose — the report must never have a silent blank).
const TBF = `<span style="background:#fff3cd;color:#8a6d00;padding:0 5px;border-radius:3px;font-style:italic;font-size:11px">[ To be filled ]</span>`

export function buildReportHtml(
  v: Record<string, string>,
  valuation: Valuation | null,
  evidence: Evidence | null,
  projectId: string,
  savedEvidence?: SavedEvidence | null,
): string {
  // A filled field: the value, or the "[ To be filled ]" marker when empty.
  const F = (key: string) => (v[key] && v[key].trim() ? esc(v[key]) : TBF)
  // An optional field: the value, or nothing (for lines that may legitimately
  // be empty, e.g. a second address line — so we don't nag on those).
  const Fo = (key: string) => (v[key] && v[key].trim() ? esc(v[key]) : '')
  // A money field: "Rs. 1,234,567 /-" or the marker when empty.
  const money = (key: string) => (v[key] && v[key].trim() ? rs(v[key]) : TBF)

  const gps = (v.gpsCoordinates || '').split(',').map((x) => x.trim())
  const hasGps = gps.length === 2 && !!gps[0] && !!gps[1]
  const lat = hasGps ? Number(gps[0]) : 0
  const lng = hasGps ? Number(gps[1]) : 0
  const dd = 0.0025 // ~250 m half-window for the zoomed satellite view

  return `<div style="font-family:Calibri,Arial,sans-serif;font-size:12px;color:#111;line-height:1.55">
   ${coverPage(v, F, Fo)}
   ${letterPage(v, F, money)}
   ${boilerplatePage(v, F)}
   ${pageHeader()}
   <div style="margin-top:14px"></div>

   <p style="text-align:center;font-weight:700;text-decoration:underline;margin:6px 0 16px">VALUATION REPORT OF PROPERTY DEPICTED AS LOT NO. ${F('lotNo')} IN SURVEY PLAN NO. ${F('surveyPlanNo')} DATED ${F('surveyDate')} MADE BY ${F('surveyorName')} LICENSED SURVEYOR</p>

   ${H('1.', 'PURPOSE OF THE VALUATION')}
   ${P('The purpose of this valuation is to determine both the market value and forced sale value of the subject property for secured lending purpose.')}

   ${H('2.', 'PREMISE OF VALUE')}
   ${P('This valuation report considers the existing use of the property as the premise of value, in accordance with the specific requirements for secured lending purpose, focusing on the property’s current functionality and market position rather than its highest and best potential use.')}

   ${H('3.', 'BASIS OF THE VALUATION')}
   ${P('The basis of this valuation is Market Value and Forced Sale Value.')}

   ${H('4.', 'CLIENT INFORMATION')}
   <table style="font-size:12px;border-collapse:collapse">
     ${infoRow('4.1 Name and address of the Mortgagor', [F('nameWithInitials'), Fo('addressLine1'), Fo('addressLine2'), Fo('ownerCity'), Fo('district')].filter(Boolean).join('<br>'))}
     ${infoRow('4.2 Contact Numbers', F('contactNo'))}
     ${infoRow('4.3 Type of the property', F('propertyType'))}
     ${infoRow('4.4 Address of the property', F('propertyAddress'))}
     ${infoRow('4.5 Party present at the inspection', F('presentedParty'))}
     ${infoRow('4.6 Date of inspection', F('inspectionDate'))}
     ${infoRow('4.7 Date of valuation', F('valuationDate'))}
   </table>

   ${H('5.', 'PROPERTY DETAILS')}
   ${H('5.1', 'SITUATION')}${P(v.localityDescription, true)}

   ${H('5.2', 'DESCRIPTION OF THE PROPERTY')}
   ${H('5.2.1', 'EXTENT')}
   ${extentTbl(v, F)}

   ${H('5.2.2', 'VALIDITY OF THE SURVEY PLAN')}
   <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:4px">
     <tr style="background:#f0f0f0"><th style="border:1px solid #bbb;padding:5px;text-align:left">Date of Survey Plan</th><th style="border:1px solid #bbb;padding:5px;text-align:left">Exceeding over 10 years</th><th style="border:1px solid #bbb;padding:5px;text-align:left">Endorsement / new survey plan</th></tr>
     <tr><td style="border:1px solid #bbb;padding:5px">${F('surveyDate')}</td><td style="border:1px solid #bbb;padding:5px">${F('planOver10Years')}</td><td style="border:1px solid #bbb;padding:5px">${F('planEndorsementOrNew')}</td></tr>
   </table>

   ${H('5.2.3', 'BOUNDARIES')}
   ${boundaryTbl(v, F)}
   <p style="margin:6px 0">The main access to the property is from its ${F('accessFromBoundary')} boundary.</p>

   ${H('5.2.4', 'SURVEY PLAN')}
   <div style="margin:8px 0">${surveyPlanImg(projectId)}</div>

   ${H('5.3', 'ACCESS AND NATURE OF THE ACCESSIBILITY')}
   ${P(v.accessLocationDescription, true)}
   <p style="margin:6px 0">Coordinate of the Location : ${F('gpsCoordinates')} &nbsp;&nbsp; Location : ${F('propertyLocationCity')}</p>
   ${hasGps ? `<div style="display:flex;flex-wrap:wrap;gap:10px;margin:8px 0">
     <figure style="margin:0;text-align:center;font-size:10px;color:#555">Satellite view<br>${satImg(lat, lng, dd)}</figure>
     <figure style="margin:0;text-align:center;font-size:10px;color:#555">Location map<br>${mapImg(lat, lng)}</figure>
   </div>` : ''}

   ${H('5.4', 'DESCRIPTION OF THE LAND')}${P(v.landDescription, true)}

   ${H('5.5', 'DETAIL DESCRIPTION OF THE LAND')}
   ${photosTbl(v, projectId)}
   ${v.imageAnalysis ? P(v.imageAnalysis) : ''}
   <p style="margin:10px 0 4px;font-weight:600">Additional photographs of the property</p>
   ${additionalPhotos(projectId)}

   ${H('6.', 'LEGAL & PLANNING CLEARANCE')}
   ${H('6.1', 'LEGAL ASPECT')}
   ${H('6.1.1', 'OWNERSHIP')}${P(v.legalDescription, true)}
   ${H('6.1.2', 'LOCAL AUTHORITY TAX')}${P(v.localAuthorityTax, true)}
   ${H('6.1.3', 'STREET LINE & BUILDING LIMITS')}${P(v.streetLineBuildingLimits, true)}
   ${H('6.2', 'PLANNING REGULATIONS')}
   ${H('6.2.1', 'MANDATORY REQUIREMENTS')}${P(v.mandatoryRequirements, true)}

   ${H('7.', 'LOCALITY')}${P(v.localityFacilities, true)}

   ${H('8.', 'APPROACH AND METHOD TO THE VALUATION')}
   ${P('The valuation approaches include the cost approach, the market approach (comparison method), and the income approach. In assessing the subject property, I have applied the Contractor’s Test Method (DRC) of valuation under the Cost Approach.')}

   ${H('9.', 'EVIDENCE OF LAND VALUES & RENTALS')}
   ${H('9.1', 'RICS EVIDENCE HIERARCHY')}
   ${P(v.nearbyPropertyDetails, true)}${evidenceTbl(evidence, savedEvidence)}

   ${H('10.0', 'BASE OF VALUATION & RATIONAL')}
   <ol style="margin:6px 0 6px 18px;text-align:justify">
     <li>My valuation has been undertaken using appropriate valuation methodology and my professional judgment.</li>
     <li>I have undertaken to provide an assessment of the market value of the property on ‘as is’ basis, including all improvements as they stand.</li>
     <li>I have ${v.previouslyValued && v.previouslyValued.trim() ? esc(v.previouslyValued) : '<u>not valued</u>'} this property previously.</li>
   </ol>

   ${H('11.0', 'VALUATION')}
   ${valuationTbl(valuation, v)}

   ${H('12.', 'CONCLUSION')}${P(v.conclusion, true)}

   ${H('13.', 'SUMMARY')}
   <p style="margin:4px 0">The valuation details are as follows.</p>
   <p style="margin:2px 0;font-weight:700;text-decoration:underline">Land Only</p>
   <table style="width:100%;font-size:12px">
     <tr><td style="padding:2px 0;font-weight:700">Market Value as at ${F('valuationDate')}</td><td style="text-align:right;font-weight:700">; - ${money('marketValue')}${v.marketValueWords ? ` (${esc(v.marketValueWords)})` : ''}</td></tr>
     <tr><td style="padding:2px 0;font-weight:700">Forced Sale value as at ${F('valuationDate')}</td><td style="text-align:right;font-weight:700">; - ${money('forcedSaleValue')}${v.forcedSaleValueWords ? ` (${esc(v.forcedSaleValueWords)})` : ''}</td></tr>
   </table>

   ${H('14.', 'CERTIFICATION')}
   ${P(`I certify that the property inspected and valued by me corresponds precisely to Lot No. ${F('lotNo')} in Survey Plan No. ${F('surveyPlanNo')} dated ${F('surveyDate')} made by ${F('surveyorName')} Licensed Surveyor. The property’s boundaries were verified on-site and confirmed to align with the boundaries indicated in the aforementioned plan. I recommend that the above estimated values are fair and reasonable.`)}
   ${P('The valuer has experience in the location and category of the property being valued and has made a personal inspection of the property. This valuation complies with the valuation standards used in Sri Lanka (IVSL), the International Valuation Standards, and the standards compiled by the Royal Institution of Chartered Surveyors (RICS).')}
   <p style="margin-top:24px">Vlr. H.M.R.R. Narampanawa (FRICS)<br>RICS Registered Chartered Valuation Surveyor<br>Panel Valuer of ${F('bankName')}</p>
   ${pageFooter()}
  </div>`
}

// ── Shared bits ───────────────────────────────────────────────────────────

// The running page header: firm logo (left), valuer block (middle), RICS mark (right).
const pageHeader = () => `
<div style="position:relative">
  <table style="width:100%;border-collapse:collapse;border-bottom:2px solid #1f3a4d">
   <tr>
    <td style="vertical-align:middle;width:24%;padding-bottom:6px">
      <div style="display:inline-block;text-align:center">
        <div style="background:#1f3a4d;color:#fff;padding:4px 14px;font-family:Arial,sans-serif;font-weight:800;font-size:15px">CodeHub</div>
        <div style="border-top:1px solid #1f3a4d;font-family:Arial,sans-serif;font-size:7px;color:#666;padding-top:1px">Your Land Valuation Partner</div>
      </div>
    </td>
    <td style="vertical-align:middle;font-family:Arial,sans-serif;font-size:11px;color:#222;padding:0 0 6px 10px;line-height:1.4">
      <div style="font-weight:700">Vlr. H.M.R.R. Narampanawa <span style="font-size:9px">(FRICS)</span></div>
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

// The running page footer: firm contact bar.
const pageFooter = () => `
<div style="margin-top:24px;border-top:2px solid #1f3a4d;padding-top:6px;font-family:Arial,sans-serif;font-size:9px;color:#333;text-align:center;line-height:1.7">
  <div>92/A, Kalukondayawa, Malwana, Sri Lanka. &nbsp;|&nbsp; Head Office: 508/2/4, Awissawella Road, Kaduwela, Sri Lanka.</div>
  <div>+94 773 623 550 | +94 112 539 977 &nbsp;&nbsp; valuer.jayathilake@gmail.com &nbsp;&nbsp; www.ijvr.lk</div>
</div>`

// Numbered section heading (e.g. "5.2.1  EXTENT").
const H = (n: string, t: string) =>
  `<h3 style="font-size:13px;font-weight:700;color:#0f766e;border-bottom:1px solid #ccc;padding-bottom:3px;margin:16px 0 8px">${n} ${esc(t)}</h3>`

// A body paragraph. `markEmpty` shows the "[ To be filled ]" marker instead of
// rendering nothing, so a required narrative section is never silently blank.
const P = (t: string | undefined, markEmpty = false) =>
  esc(t)
    ? `<p style="margin:6px 0;text-align:justify">${esc(t)}</p>`
    : markEmpty
      ? `<p style="margin:6px 0">${TBF}</p>`
      : ''

// Label/value row for the Client Information table.
const infoRow = (label: string, value: string) =>
  `<tr><td style="padding:3px 14px 3px 0;vertical-align:top;font-weight:600">${esc(label)}</td><td style="padding:3px 0;vertical-align:top">: ${value}</td></tr>`

// ── Page 1: cover ─────────────────────────────────────────────────────────
const coverPage = (v: Record<string, string>, F: (k: string) => string, Fo: (k: string) => string) => {
  const details = [
    F('landName'),
    `( ${F('ownerName')} )`,
    Fo('addressLine1'),
    Fo('addressLine2'),
    Fo('ownerCity'),
    Fo('district'),
  ]
    .filter(Boolean)
    .map((t) => `<div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#111">${t}</div>`)
    .join('')

  return `
  <div style="page-break-after:always">
   <div style="position:relative;box-sizing:border-box;min-height:1000px;border:2px solid #1f3a4d;border-radius:6px;padding:26px 32px;font-family:Georgia,'Times New Roman',serif">
    <table style="width:100%;border-collapse:collapse">
     <tr>
      <td style="vertical-align:top">
        <span style="display:inline-block;border:1px solid #333;padding:5px 12px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px">REF - ${F('projectId')}</span>
      </td>
      <td style="vertical-align:top;text-align:right">
        <div style="display:inline-block;text-align:center">
          <div style="background:#1f3a4d;color:#fff;padding:5px 18px;font-family:Arial,sans-serif;font-weight:800;font-size:15px;letter-spacing:.5px">CodeHub</div>
          <div style="border-top:1px solid #1f3a4d;margin-top:2px;padding-top:2px;font-family:Arial,sans-serif;font-size:7px;color:#666;letter-spacing:.5px">Your Land Valuation Partner</div>
        </div>
      </td>
     </tr>
    </table>

    <div style="text-align:center;margin-top:170px">
      <div style="font-size:66px;font-weight:700;line-height:1.02;color:#111">VALUATION<br>REPORT</div>
      <div style="width:76%;margin:30px auto 0;border-top:4px solid #1f3a4d"></div>
    </div>

    <div style="text-align:center;margin-top:34px;line-height:2.1">
      ${details}
    </div>

    <div style="position:absolute;bottom:34px;right:26px;border:1.5px solid #1f3a4d;padding:10px 16px;font-family:Arial,sans-serif;font-size:11px;line-height:1.55;background:#fff;max-width:290px">
      <div>Vlr. H.M.R.R. Narampanawa</div>
      <div>Chartered Valuation Surveyor</div>
      <div>RICS Registered No. 6698015 (FRICS)</div>
      <div>IVSL – F/315</div>
    </div>
   </div>
  </div>`
}

// ── Page 2: covering letter ───────────────────────────────────────────────
const letterPage = (v: Record<string, string>, F: (k: string) => string, money: (k: string) => string) => `
  <div style="page-break-after:always;min-height:1000px;display:flex;flex-direction:column">
   ${pageHeader()}
   <div style="flex:1;font-size:12px;color:#111;line-height:1.6;margin-top:22px">
     <table style="width:100%;border-collapse:collapse;font-size:12px">
      <tr>
       <td style="width:38%"><span style="border:1px solid #333;padding:4px 12px;font-weight:700">Ref/${F('projectId')}/2025</span></td>
       <td style="width:32%;text-align:center;font-weight:700">Confidential</td>
       <td style="width:30%;text-align:right;font-weight:700">${F('valuationRequestDate')}</td>
      </tr>
     </table>
     <p style="margin:20px 0 0">The Manager,<br>${F('bankName')},<br>${F('branchName')}.</p>
     <p style="margin:16px 0">Dear Sir,</p>
     <p style="text-align:center;font-weight:700;text-decoration:underline;margin:0 16px">VALUATION REPORT OF PROPERTY DEPICTED AS LOT NO. ${F('lotNo')} IN SURVEY PLAN NO. ${F('surveyPlanNo')} DATED ${F('surveyDate')} MADE BY ${F('surveyorName')} LICENSED SURVEYOR</p>
     <p style="margin:16px 0;text-align:justify">The Manager of ${F('bankName')} - ${F('branchName')} has requested by his letter dated ${F('valuationRequestDate')} to inspect the property depicted as Lot No. ${F('lotNo')} in Survey Plan No. ${F('surveyPlanNo')} dated ${F('surveyDate')} made by ${F('surveyorName')} Licensed Surveyor, situated at ${F('propertyLocationCity')} within the administrative limits of ${F('urbanCouncil')} Urban Council and furnish a valuation report for the estimation of both market value and forced sale value for the purpose of secured lending.</p>
     <p style="margin:14px 0 6px;font-weight:700">The valuation details are as follows;</p>
     <p style="margin:6px 0 2px;font-weight:700;text-decoration:underline">Land Only</p>
     <table style="width:100%;font-size:12px">
       <tr><td style="font-weight:700">Market Value as at ${F('valuationDate')}</td><td style="text-align:right;font-weight:700">; - ${money('marketValue')}</td></tr>
       <tr><td style="font-weight:700">Forced Sale value as at ${F('valuationDate')}</td><td style="text-align:right;font-weight:700">; - ${money('forcedSaleValue')}</td></tr>
     </table>
     <p style="margin:18px 0">Further details are included in the report. Please refer the annexure 01 mentioned below.</p>
   </div>
   ${pageFooter()}
  </div>`

// ── Page: Limitations / Assumptions / Compliance (fixed boilerplate) ──────
const boilerplatePage = (v: Record<string, string>, F: (k: string) => string) => {
  const li = (t: string) => `<li style="margin:4px 0;text-align:justify">${t}</li>`
  return `
  <div style="page-break-after:always;min-height:1000px">
   ${pageHeader()}
   <div style="margin-top:18px;font-size:12px">
    <h3 style="font-size:13px;font-weight:700;color:#0f766e;margin:14px 0 6px">LIMITATIONS</h3>
    <ul style="margin:0 0 0 18px;padding:0">
     ${li('This valuation is valid only for the estimate of market value and forced sale value for the purpose of mortgage and should not be used for any other purpose or in any manner other than as stated herein.')}
     ${li('I am not liable for any damages incurred by the client of the report if it is used for a purpose other than the “Intended Purpose” of the report.')}
     ${li(`This valuation has been prepared for the Directors of ${F('bankName')} and is not intended for any other person. No responsibility is accepted to third parties for the whole or any part of the contents.`)}
     ${li('The valuation relies on the available information at the time of inspection. I am not responsible for any facts not covered during the inspection.')}
     ${li('The valuation is based on the legal documents provided by the client. The valuer is not responsible for any negligence done by the professionals (Surveyor).')}
     ${li('The analysis and conclusions are limited by the assumptions and conditions reported.')}
    </ul>
    <h3 style="font-size:13px;font-weight:700;color:#0f766e;margin:14px 0 6px">GENERAL ASSUMPTIONS</h3>
    <ul style="margin:0 0 0 18px;padding:0">
     ${li('I have valued the property based on the assumption that the owner holds an unencumbered freehold interest in the property.')}
     ${li('The property has been valued as if wholly owned, with no account taken of any outstanding debts, including mortgage bonds, loans, or other charges.')}
    </ul>
    <h3 style="font-size:13px;font-weight:700;color:#0f766e;margin:14px 0 6px">COMPLIANCE STATEMENT</h3>
    <ul style="margin:0 0 0 18px;padding:0">
     ${li('The valuer has no conflicts of interest with respect to the subject property.')}
     ${li('The valuation has been prepared in accordance with the Sri Lanka Valuation Standards (IVSL), the guidance of RICS and the standards of the IVSC.')}
     ${li('The valuer has satisfied the professional education requirements and has relevant experience in the location category and property type being valued.')}
     ${li('The valuation has been conducted by the valuer to the best of their knowledge, based on an analysis of market evidence.')}
    </ul>
   </div>
   ${pageFooter()}
  </div>`
}

// ── Tables & images ───────────────────────────────────────────────────────
const cell = (c: string, extra = '') => `<td style="border:1px solid #bbb;padding:6px;${extra}">${c}</td>`

const extentTbl = (v: Record<string, string>, F: (k: string) => string) => `
  <table style="width:100%;border-collapse:collapse;font-size:12px">
   <tr>
    ${cell(`<b>Survey Plan</b> — Lot No. ${F('lotNo')} in Survey Plan No. ${F('surveyPlanNo')} dated ${F('surveyDate')} made by ${F('surveyorName')} Licensed Surveyor.<br>Extent: ${F('extentAcres')} A - ${F('extentRoods')} R - ${F('extentPerches')} P &nbsp;(Hectares: ${F('extentHectares')})`, 'width:50%')}
    ${cell(`<b>Deed</b> — Deed of Transfer No. ${F('deedNo')} dated ${F('deedDate')} attested by ${F('attorney')} Attorney-at-Law${v.notary ? ` &amp; ${esc(v.notary)}` : ''}.<br>Extent: ${F('deedAcres')} A - ${F('deedRoods')} R - ${F('deedPerches')} P &nbsp;(Hectares: ${F('deedHectares')})`)}
   </tr>
  </table>
  <p style="margin:6px 0;font-style:italic">The extent mentioned in the above survey plan tallies with the above deed.</p>`

const boundaryTbl = (v: Record<string, string>, F: (k: string) => string) => `
  <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:4px">
   <tr style="background:#f0f0f0"><th style="border:1px solid #bbb;padding:5px"></th><th style="border:1px solid #bbb;padding:5px">On Plan</th><th style="border:1px solid #bbb;padding:5px">On Site</th></tr>
   <tr><td style="border:1px solid #bbb;padding:5px">North by</td>${cell(F('boundaryNorth'))}${cell(F('siteBoundaryNorth'))}</tr>
   <tr><td style="border:1px solid #bbb;padding:5px">East by</td>${cell(F('boundaryEast'))}${cell(F('siteBoundaryEast'))}</tr>
   <tr><td style="border:1px solid #bbb;padding:5px">South by</td>${cell(F('boundarySouth'))}${cell(F('siteBoundarySouth'))}</tr>
   <tr><td style="border:1px solid #bbb;padding:5px">West by</td>${cell(F('boundaryWest'))}${cell(F('siteBoundaryWest'))}</tr>
  </table>`

const surveyPlanImg = (projectId: string) =>
  `<img src="/api/coordinator/projects/file?projectId=${encodeURIComponent(projectId)}&type=surveyPlan" style="max-width:100%;border:1px solid #bbb" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=color:#999>[ Survey plan not available as an image ]</span>')"/>`

const mapImg = (lat: number, lng: number) =>
  `<img src="https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=360x260&markers=${lat},${lng},red" style="max-width:100%;border:1px solid #bbb"/>`

const satImg = (lat: number, lng: number, d: number) =>
  `<img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&bboxSR=4326&size=360,260&format=png&f=image" style="max-width:100%;border:1px solid #bbb" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=color:#999>[ Satellite view unavailable ]</span>')"/>`

// The 10 required site photographs (label · image · caption), matching 5.5.
const photosTbl = (v: Record<string, string>, projectId: string) => {
  const rows: [string, string, string][] = [
    ['accessRoad', 'Access road', v.photoAccessRoad || ''],
    ['routeFromMainRoad', 'Route from main road', v.photoRouteFromMainRoad || ''],
    ['frontView', 'Front view of the land', v.photoFrontView || ''],
    ['rearView', 'Rear view of the land', v.photoRearView || ''],
    ['leftSideView', 'Left side view of land', v.photoLeftSide || ''],
    ['rightSideView', 'Right side view of the land', v.photoRightSide || ''],
    ['eastBoundary', 'East boundary of the land', v.photoEastBoundary || ''],
    ['southBoundary', 'South boundary of the land', v.photoSouthBoundary || ''],
    ['westBoundary', 'West boundary of the land', v.photoWestBoundary || ''],
    ['northBoundary', 'North boundary of the land', v.photoNorthBoundary || ''],
  ]
  return `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px">
   <tr style="background:#f0f0f0"><th style="border:1px solid #bbb;padding:5px;text-align:left;width:26%">Component</th><th style="border:1px solid #bbb;padding:5px;width:30%">Image</th><th style="border:1px solid #bbb;padding:5px;text-align:left">Description</th></tr>
   ${rows
     .map(
       ([t, label, caption]) => `<tr>
     <td style="border:1px solid #bbb;padding:6px;font-weight:600">${esc(label)}</td>
     <td style="border:1px solid #bbb;padding:6px;text-align:center"><img src="${photoUrl(projectId, t)}" style="max-width:170px;max-height:120px" onerror="this.style.display='none';this.parentNode.innerHTML='<span style=color:#999>no photo</span>'"/></td>
     <td style="border:1px solid #bbb;padding:6px">${caption ? esc(caption) : `Photograph of the ${esc(label.toLowerCase())} on file.`}</td>
    </tr>`,
     )
     .join('')}
  </table>`
}

const additionalPhotos = (projectId: string) => {
  const types: [string, string][] = [
    ['gateEntrance', 'Gate / Entrance'], ['drainage', 'Drainage'], ['roadFrontage', 'Road Frontage'],
    ['soilCondition', 'Soil Condition'], ['unauthorizedStructures', 'Unauthorized Structures'],
    ['floodEvidence', 'Flood Evidence'], ['notableFeatures', 'Notable Features'],
    ['surroundingArea', 'Surrounding Area'], ['nearbyFacilities', 'Nearby Facilities'],
  ]
  return `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${types
    .map(([t, label]) => `<figure style="margin:0;text-align:center;font-size:10px"><img src="${photoUrl(projectId, t)}" style="max-width:150px;max-height:110px;display:block" onerror="this.parentNode.style.display='none'"/>${esc(label)}</figure>`)
    .join('')}</div>`
}

// Section 11 — the valuation figures table (from the officer's saved figures).
const valuationTbl = (valuation: Valuation | null, v: Record<string, string>) => {
  if (!valuation) return v.valuationText ? P(v.valuationText) : `<p style="margin:6px 0">${TBF}</p>`
  const c = (x: string, extra = '') => `<td style="border:1px solid #bbb;padding:6px;${extra}">${x}</td>`
  return `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px">
    <tr>${c('<b>Land</b>', '', )}${c('')}${c('', 'text-align:right')}</tr>
    <tr>${c('Total Extent')}${c(esc(valuation.extentText))}${c('')}</tr>
    <tr>${c(`${esc(String(valuation.totalPerches))} Perches @ ${rs(valuation.ratePerPerch)} per perch`)}${c('')}${c(rs(valuation.landValue), 'text-align:right')}</tr>
    <tr>${c('Market value of the land')}${c('')}${c(rs(valuation.marketValue), 'text-align:right')}</tr>
    <tr>${c('<b>Say</b>')}${c('')}${c(`<b>${rs(valuation.say)}</b>`, 'text-align:right')}</tr>
   </table>
   ${(valuation.notes || []).length ? `<div style="font-size:11px;margin-top:6px"><b>Notes</b><ol style="margin:4px 0 0 18px">${(valuation.notes || []).map((n) => `<li>${esc(n)}</li>`).join('')}</ol></div>` : ''}`
}

// The officer's edited Section 9 evidence table (from Generate Descriptions).
type SavedEvidence = { rows?: { refNo: string; remarks: string; pricePerPerch: number }[]; rangeStatement?: string }

const evidenceTbl = (evidence: Evidence | null, savedEvidence?: SavedEvidence | null) => {
  const rows = savedEvidence?.rows?.length
    ? savedEvidence.rows
        .map((r) => `<tr><td style="border:1px solid #bbb;padding:5px">${esc(r.refNo)}</td><td style="border:1px solid #bbb;padding:5px;white-space:pre-line">${esc(r.remarks)}</td><td style="border:1px solid #bbb;padding:5px;text-align:right">${rs(r.pricePerPerch)}</td></tr>`)
        .join('')
    : (evidence?.comparables ?? [])
        .map((c) => `<tr><td style="border:1px solid #bbb;padding:5px">${esc(c.refNo || c.evidenceType)}</td><td style="border:1px solid #bbb;padding:5px">${esc(c.date)} · ${esc(c.extentPerches)}P · ${esc(c.distanceKm)} km · ${esc(c.source)}</td><td style="border:1px solid #bbb;padding:5px;text-align:right">${rs(c.pricePerPerch)}</td></tr>`)
        .join('')
  if (!rows) return ''
  return `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px">
     <tr style="background:#f0f0f0"><th style="border:1px solid #bbb;padding:5px;text-align:left">Ref. No</th><th style="border:1px solid #bbb;padding:5px;text-align:left">Details</th><th style="border:1px solid #bbb;padding:5px;text-align:right">Per perch</th></tr>${rows}
    </table>${savedEvidence?.rangeStatement ? P(savedEvidence.rangeStatement) : ''}`
}
