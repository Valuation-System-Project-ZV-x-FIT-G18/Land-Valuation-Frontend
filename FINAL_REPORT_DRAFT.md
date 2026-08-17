# Land Valuation Management System
## Final Report Draft and Submission Structure

**Programme:** [Programme name]  
**Module:** [Module name / code]  
**Academic year:** [Year]  
**Submitted by:** ZV x FIT - Group 18  
**Institution:** [Institution name]  
**Supervisor:** [Supervisor name]  
**Submission date:** [Date]

> Replace every item in square brackets and insert your own screenshots before submitting. The technical claims in this draft are based on the current frontend and backend implementation.

---

# Abstract

Land valuation for loan security commonly involves paper forms, repeated communication between stakeholders, site visits, manual report preparation, and several approval stages. These fragmented activities can delay the availability of an official valuation report and make progress difficult for applicants, banks, technical officers, and managers to track.

This project presents the **Land Valuation Management System**, a web-based solution that digitises the valuation lifecycle. The system accepts valuation requests, registers applicants and banks, creates valuation projects, assigns technical officers, captures site-inspection data, stores site photographs, records GPS locations, analyses comparable land evidence, and prepares a structured draft valuation report. The draft moves through Manager Level 3, Level 2, and Level 1 review stages. Once the final report is locked and payment is confirmed, the requesting bank receives controlled access to the completed report.

The solution uses React and TypeScript on the frontend and NestJS with PostgreSQL on the backend. Supporting capabilities include role-based navigation, password protection with bcrypt, email and in-system notifications, private document storage with fallback storage, OCR-assisted inspection-form entry, OpenStreetMap location support, and optional AI-assisted descriptive text. The resulting system provides a traceable, role-specific workflow intended to improve the speed, visibility, and consistency of land valuation administration.

**Keywords:** land valuation, workflow management, role-based access control, valuation report, GIS, React, NestJS, PostgreSQL.

# Acknowledgement

We would like to thank [supervisor name], [institution name], and all individuals who supported this project. We also acknowledge the contributions of every member of ZV x FIT - Group 18.

# Declaration

We declare that this report and the associated software project are our original work, except where references are acknowledged. This work has not been submitted previously for any other academic award.

# Table of Contents

Generate this automatically in Word/Google Docs after applying Heading 1 and Heading 2 styles to this document.

# Chapter 1 - Introduction

## 1.1 Background

When land is offered as security for a bank loan, the lender requires an independent assessment of the property value. This involves several participants: a loan applicant, a coordinator, a technical officer, review managers, and a bank. In a manual process, documents and reports are exchanged through paper records, email, and separate communication channels. This increases the risk of lost information, duplicated entry, uncertain responsibility, and long turnaround times.

## 1.2 Problem Statement

The existing valuation process lacks a unified digital workflow for creating a request, recording evidence from a site visit, preparing a report, obtaining sequential approvals, collecting payment, and releasing the final report to the relevant bank. Stakeholders need role-specific access without exposing sensitive valuation data before it is finalised.

## 1.3 Aim

To design and implement a secure web-based land valuation management system that supports the complete valuation workflow from request to paid, approved report access.

## 1.4 Objectives

1. Provide public valuation-request and contact facilities.
2. Enable administrators and coordinators to manage users, applicants, banks, projects, and technical-officer assignments.
3. Enable technical officers to collect and preserve inspection data, photographs, coordinates, descriptions, and comparable-sales evidence.
4. Generate a structured valuation-report draft and route it through L3, L2, and L1 managerial review.
5. Support report locking, fee calculation, card/slip payment workflows, and bank access only after payment confirmation.
6. Provide notifications, email communication, and secure storage for supporting documents.

## 1.5 Scope

The system covers the operational workflow for land valuation projects. It includes public pages, internal and external login, project and valuation creation, officer workflow tools, approval workflow, payment confirmation, and report viewing. The current solution treats card payment as a demonstration gateway; production payment-provider integration, formal digital signatures, and full audit analytics are outside the present scope.

## 1.6 Report Organisation

Chapter 2 reviews the problem domain and related approaches. Chapters 3 and 4 describe requirements, analysis, and design. Chapter 5 explains implementation. Chapter 6 presents testing and evaluation. Chapter 7 concludes the project and proposes future work.

# Chapter 2 - Literature Review

## 2.1 Digital Workflow Management

Workflow systems coordinate tasks between people, track the state of work, and reduce reliance on disconnected messages. For valuation work, a digital workflow is valuable because the report progresses through defined stages and requires evidence collected by multiple roles.

## 2.2 Role-Based Access Control

Role-based access control assigns permissions according to a user's job responsibility. This is appropriate for valuation systems because applicants, officers, managers, coordinators, banks, and administrators must not receive the same functions or the same report visibility.

## 2.3 Geographic Information and Comparable Evidence

Location is central to land valuation. GPS coordinates, access routes, locality information, and nearby comparable evidence strengthen the justification for an assessed value. The project uses Leaflet-based maps in the user interface and OpenStreetMap reverse geocoding as supporting location context.

## 2.4 AI and OCR Assistance

OCR can convert an uploaded inspection form into editable draft fields, reducing repetitive entry. AI-generated text can assist with concise site-photo captions and professional valuation descriptions, but staff review remains necessary because generated text may be incomplete or inaccurate. The implementation includes non-AI fallback text when an AI key is unavailable.

## 2.5 References to Add

Add at least 8-15 credible references required by your institution, such as professional valuation standards, Sri Lankan land/property sources, workflow-management research, RBAC literature, React/NestJS documentation, PostgreSQL documentation, Leaflet/OpenStreetMap documentation, and OCR/AI ethics sources. Use the reference style specified by your module.

# Chapter 3 - Requirements Analysis

## 3.1 Stakeholders and Roles

| Role | Main responsibilities |
|---|---|
| Loan Applicant | Requests valuation, provides documents, views project progress, pays the fee. |
| Coordinator | Registers applicants and banks, creates projects and valuations, assigns officers, monitors status, verifies payment slips. |
| Technical Officer | Conducts inspection, captures evidence, maps location, evaluates comparable land data, and prepares the report draft. |
| Manager L3 | Performs the first report review and may return it to the technical officer. |
| Manager L2 | Performs the second review and may return it to L3. |
| Manager L1 | Performs final review, locks the report, and triggers the payment stage. |
| Bank | Views the final report only when it is locked and payment has been confirmed. |
| Administrator | Creates and maintains internal staff accounts. |

## 3.2 Functional Requirements

| ID | Requirement |
|---|---|
| FR01 | Visitors can submit valuation requests and contact messages. |
| FR02 | Users can log in, change passwords, and request password resets. |
| FR03 | Coordinators can register applicants and banks, create projects/valuations, and assign officers. |
| FR04 | Officers can upload an inspection form and use OCR output as an editable inspection draft. |
| FR05 | Officers can save inspection data, photographs, GPS points, access/locality descriptions, and comparable evidence. |
| FR06 | The system calculates valuation analysis values and produces report-ready narrative content. |
| FR07 | Officers and managers can create, edit, submit, approve, reject, and lock report drafts according to review level. |
| FR08 | Applicants can pay by demonstration card flow or submit a payment slip; coordinators can verify or reject slips. |
| FR09 | Banks can access only locked and paid reports associated with their branch. |
| FR10 | The system sends in-app notifications and email updates for key workflow events. |

## 3.3 Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | Password hashes are stored using bcrypt; sensitive files use private storage and controlled server access. |
| Usability | Each role sees focused navigation and purpose-specific screens. |
| Reliability | Uploaded files have a PostgreSQL binary fallback when object storage is unavailable. |
| Maintainability | The frontend and backend are modular TypeScript applications grouped by feature and role. |
| Performance | SPA navigation, REST APIs, and indexed relational entities support routine operational workloads. |
| Compatibility | The browser client is built with Vite; the API runs on Node.js/NestJS. |

## 3.4 Core Workflow

```text
Applicant request
      -> Coordinator registers / creates project and valuation
      -> Coordinator assigns Technical Officer
      -> Officer inspection, photos, mapping, comparable analysis, draft
      -> Manager L3 review
      -> Manager L2 review
      -> Manager L1 locks final report
      -> Applicant payment or payment-slip verification
      -> Bank accesses locked, paid report
```

# Chapter 4 - System Design

## 4.1 Architecture

The solution follows a client-server architecture. A React single-page application provides the user interface. It calls a NestJS REST API through the `/api` route. The API applies business rules and communicates with PostgreSQL, private object storage, email services, optional OCR services, OpenStreetMap, and optional Gemini-powered text generation.

```text
React + TypeScript + Vite + Tailwind + Leaflet
                    |
                 REST /api
                    |
NestJS feature modules + validation + business rules
       |                 |                  |
 PostgreSQL       Object storage        External services
                  / DB fallback     Email, OCR, map, optional AI
```

## 4.2 Frontend Design

The frontend uses React 18, TypeScript, React Router, Tailwind CSS, and Leaflet. Routes are organised for public, internal, and role-specific pages. Shared UI elements include layouts, sidebars, forms, tables, cards, modals, notification controls, and authentication context. Vite is configured to run the UI on port 3000 and proxy `/api` calls to the NestJS backend on port 4000.

## 4.3 Backend Design

The backend uses NestJS and groups features into modules. The root module integrates authentication, contact/valuation requests, coordinator tools, technical-officer functions, report management, notifications, storage, client/bank report access, and optional AI/chatbot features. PostgreSQL is accessed through a common database service.

## 4.4 Database Design

Core persistent entities include `users`, `projects`, `valuations`, `contact_messages`, `valuation_requests`, `project_files`, `inspections`, `inspection_files`, `site_photos`, `map_analyses`, `land_analyses`, `drafts`, notifications, messages, technical-officer leave records, and payment data attached to drafts.

Important relationships:

```text
User (applicant) 1 --- * Project 1 --- * Valuation
Project 1 --- 1 Inspection / Map Analysis / Land Analysis / Draft
Project 1 --- * Site Photo / Supporting File
Draft 1 --- 1 Review Status + Payment State
```

## 4.5 Approval-State Design

The report workflow uses defined states:

```text
draft -> pending_l3 -> pending_l2 -> pending_l1 -> locked
                 ^          ^            ^
                 |          |            |
          rejected_to_to  rejected_l3  rejected_l2
```

Only a locked report proceeds to payment. A bank can view it only when `review_status = locked` and `paid = true`.

## 4.6 Security Design

- Passwords are verified with bcrypt hashes; plaintext passwords are not returned from the API.
- Each user role has a separate navigation path and appropriate API workflow context.
- Private storage uses Supabase object storage when configured, with a local/private fallback and database byte fallback for resilience.
- Password-reset functionality generates a temporary password and enforces a subsequent password change.
- Environment variables hold connection strings, mail configuration, and optional third-party API keys; these must never be committed to source control.

# Chapter 5 - Implementation

## 5.1 Technology Stack

| Layer | Technologies used |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router, Tailwind CSS, Leaflet/react-leaflet |
| Backend | NestJS 10, TypeScript, class-validator, class-transformer |
| Database | PostgreSQL with JSONB for flexible project/report data |
| Storage | Supabase Storage with local and database fallback |
| Security | bcryptjs |
| Communication | Nodemailer, in-system notifications and messages |
| Intelligence/integration | OCR.space, OpenStreetMap Nominatim, optional Gemini text generation, role-aware chatbot |

## 5.2 Key Implemented Modules

### Public, authentication, and administration

The system provides home, services, contact, valuation-request, internal-login, and external-login pages. Authentication includes login, password reset, forced password change, profile updates, and avatar support. Administrators can add roles and view/manage user details.

### Coordinator operations

Coordinator functions include reviewing website requests and contact messages, registering applicants and banks, creating projects, creating valuations, assigning technical officers, monitoring project status, fleet/attendance management, and payment-slip verification.

### Technical-officer valuation workflow

The officer works with assigned projects and records inspection details. An inspection-form upload can be sent to OCR.space and parsed into editable fields. The officer can attach site photos, choose a location on a Leaflet map, record coordinates, create access and locality descriptions, search/save comparable evidence, calculate a market-value basis, and build a report draft.

### Report review and release

Managers view incoming drafts by level. L3 forwards reports to L2; L2 forwards reports to L1; L1 locks the final report. Rejections route work back to the correct previous role with a reason. Locking updates the project to pending payment and notifies stakeholders. Applicants can pay through the demonstration card flow or upload a bank slip. A coordinator verifies a submitted slip. The requesting bank is authorised only when the draft is locked and paid.

## 5.3 Team Contribution Table

| Area | Contributor |
|---|---|
| Coordinator | Radhika Narampanawa |
| Bank and Loan Applicant | Pranidi Methmini |
| Managers (L1/L2/L3) | Amandi Shanali |
| Technical Officer | Reshani Dilsara |
| Admin, Home and Setup | Chathu Hewage |
| Common/shared code | Pranidi Methmini |

Update this table if your actual contribution allocation changed.

## 5.4 Testing Tools and Strategy

The system uses separate testing tools for frontend and backend verification. Playwright is used for frontend end-to-end testing, while Jest is used for backend unit and integration testing.

### Frontend Testing - Playwright

Playwright is used to test the React frontend through a real browser. It verifies that users can navigate through pages, enter data into forms, submit requests, and view expected results. This is especially useful for validating role-based workflows such as Coordinator, Technical Officer, Manager, Loan Applicant, and Bank user journeys.

The following frontend scenarios can be tested using Playwright:

- Public valuation-request form submission and validation.
- Internal and external login navigation.
- Coordinator project creation and technical-officer assignment.
- Technical-officer inspection-data entry, photo upload, map selection, and draft creation.
- Manager approval and rejection workflow screens.
- Applicant payment-slip submission.
- Bank access to a final report only after payment confirmation.
- Form validation messages, loading states, success messages, and error handling.

Example command:

```bash
npm install -D @playwright/test
npx playwright install
npx playwright test
```

### Backend Testing - Jest

Jest is used to test NestJS backend services, controllers, and API behaviour. Unit tests verify individual functions such as fee calculations, validation rules, authentication logic, workflow status changes, and report-access restrictions. Integration tests verify that API endpoints work correctly with the database and related services.

The following backend scenarios can be tested using Jest:

- Authentication accepts valid credentials and rejects invalid credentials.
- Passwords are hashed and never returned in API responses.
- Project, valuation, and user data are correctly created and retrieved.
- A technical officer can save inspection, mapping, photo, and comparable-analysis data.
- Draft status moves correctly from `draft` to `pending_l3`, `pending_l2`, `pending_l1`, and `locked`.
- Rejected reports return to the correct previous review stage with a reason.
- Payment-slip verification changes the payment state correctly.
- A bank cannot access a report before it is both locked and paid.
- Fee calculation follows the configured fee bands and minimum-fee rule.

Example command:

```bash
npm install -D jest ts-jest @types/jest
npm test
```

### Test Evidence

For the final report, include:

- A screenshot of successful Playwright test results.
- A screenshot of successful Jest test results.
- A table showing test ID, test scenario, expected result, actual result, and status.
- Screenshots of important user workflows, especially approval, payment, and bank report access.

# Chapter 6 - Testing and Evaluation

## 6.1 Test Strategy

Testing should include component/UI validation, API testing, end-to-end workflow checks, role-access checks, validation/error cases, and user acceptance feedback. Add actual dates, testers, evidence, and results before final submission.

## 6.2 Suggested Test Cases

| ID | Scenario | Expected result | Result |
|---|---|---|---|
| TC01 | Submit public valuation request | Request is stored and visible to coordinator. | [Pass/Fail] |
| TC02 | Login with invalid password | System rejects login without exposing account details. | [Pass/Fail] |
| TC03 | Coordinator registers applicant | Applicant account is created and login information is sent. | [Pass/Fail] |
| TC04 | Assign officer to valuation | Assignment appears in the officer's project list. | [Pass/Fail] |
| TC05 | Upload inspection form | OCR output returns editable field suggestions or an error message. | [Pass/Fail] |
| TC06 | Save GPS location and descriptions | Coordinates/descriptions persist for the project. | [Pass/Fail] |
| TC07 | Submit draft to L3 | Draft changes to `pending_l3` and L3 is notified. | [Pass/Fail] |
| TC08 | L3/L2/L1 approval chain | Draft proceeds through required levels; L1 lock finalises it. | [Pass/Fail] |
| TC09 | Reject report at each level | Report returns to the correct prior role with a reason. | [Pass/Fail] |
| TC10 | Submit payment slip | Slip is pending until coordinator approval. | [Pass/Fail] |
| TC11 | Bank attempts access before payment | Access is denied. | [Pass/Fail] |
| TC12 | Bank opens locked paid report | Report is available to the requesting branch. | [Pass/Fail] |

## 6.3 Evaluation

The implemented design addresses the principal workflow gap by maintaining a single project record through operational stages. It improves traceability through explicit report states, notifications, payment status, and role-specific views. It also supports a richer valuation evidence set through inspection, photographic, mapping, and comparable-data features.

Current limitations include reliance on external services when optional OCR, mapping, or AI enrichment is enabled; a demonstration rather than live card-payment gateway; and the need for a formal permissions/audit-log layer before production deployment. These limitations should be stated honestly in the final report.

# Chapter 7 - Conclusion and Future Work

## 7.1 Conclusion

The Land Valuation Management System provides a structured digital workflow for managing land valuations from an initial request to a paid, approved report shared with the relevant bank. The project combines role-specific interfaces with backend workflow rules, persistent storage, notification support, and valuation evidence tools. It demonstrates how a fragmented administrative process can be transformed into a more transparent, traceable, and collaborative web application.

## 7.2 Future Enhancements

1. Integrate a real PCI-compliant payment gateway and transaction reconciliation.
2. Add fine-grained authorization guards, immutable audit trails, and report digital signatures.
3. Add automated backups, monitoring, rate limiting, and CI/CD deployment pipelines.
4. Develop advanced dashboards for turnaround time, workload, and valuation trends.
5. Add mobile-first/offline inspection capture for field officers.
6. Add structured comparable-sales verification and stronger evidence provenance.
7. Conduct formal usability testing with valuers, banks, and applicants.

# References

Insert only sources you actually consulted. Use your programme's required citation format. Suggested categories:

1. International Valuation Standards Council. *International Valuation Standards*.
2. PostgreSQL Global Development Group. *PostgreSQL Documentation*.
3. React Team. *React Documentation*.
4. NestJS. *NestJS Documentation*.
5. OpenStreetMap Foundation. *OpenStreetMap and Nominatim Documentation*.
6. Leaflet. *Leaflet Documentation*.
7. OWASP. *Authentication and Access Control guidance*.

# Appendices

## Appendix A - Screenshots to Include

Insert labelled screenshots with figure numbers and short captions:

1. Home page and valuation request form.
2. Internal/external login screens.
3. Coordinator project creation and officer assignment.
4. Technical-officer inspection-data form and OCR result.
5. Site-photo upload screen.
6. GPS map and generated location descriptions.
7. Comparable-sales / nearby analysis screen.
8. Draft report editor.
9. Manager L3, L2, and L1 review screens.
10. Applicant payment and payment-slip screen.
11. Coordinator payment-slip verification screen.
12. Bank final-report view.

## Appendix B - Setup Instructions

Backend:

```powershell
cd Land-Valuation-Backend
npm install
npm run start:dev
```

Frontend:

```powershell
cd Land-Valuation-Frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`; the backend API runs on `http://localhost:4000/api`.

## Appendix C - Environment Configuration

Document only variable names, never real values: `DATABASE_URL`, `PORT`, SMTP variables, Supabase storage variables, `GEMINI_API_KEY`, and `OCR_SPACE_API_KEY`.
