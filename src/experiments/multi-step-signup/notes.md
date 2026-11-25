## Two-phase onboarding from Figma

Built directly from the Labs Figma design system (`button-primary`, `button-secondary`, `button-secondary-ghost`, `text-field`, `dropdown`, `list-item`, `radio-button`, `checkbox`, `file-upload-dropzone`, `attachment`, `tabs`, `badge`, and `Liveness`).

- **Phase 1 (Split editorial layout):** Keeps account creation minimal — Full Name, Email Address, Password, and 6-digit segmented OTP verification — paired with a full-bleed photographic right column.
- **Email Verified Interstitial:** Transitions cleanly into a centered confirmation card outlining the 3 things needed for identity verification, with a `"Save and Finish Later"` escape hatch.
- **Phase 2 (Sidebar + scrollable KYC flow):** A persistent `248px` left sidebar tracks all 5 steps (`Personal Details`, `ID Proof`, `Liveness`, `Profile`, `Review`) with completed check states and a pinned `"Save and Finish Later"` action backed by `localStorage`.
- **Interactive components:** Includes masked radial-tick `Liveness` states (`Default`, `Loading`, `Complete`), drag-and-drop `file-upload-dropzone` paired with `attachment` cards, searchable country & city dropdowns, and a connected `"Under Review"` submission timeline.
