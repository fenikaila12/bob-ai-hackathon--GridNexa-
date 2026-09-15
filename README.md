PortFlow AI — Container Congestion Predictor & Port Operations Optimiser

Overview
- This is an academic front-end prototype built with HTML5, CSS3 and vanilla JavaScript.
- It simulates congestion prediction, route recommendations, berth/crane allocation, and a 72-hour operations plan using sample data.

How to run
1. Open `index.html` in your browser (no server or install required).

Main features
- Dashboard with KPIs, terminal congestion overview, alerts and vessel activity table.
- Vessel Management: search, add, edit, remove vessels (modal form).
- Congestion Monitor: terminal capacity cards, prediction timeline, run simulated analysis.
- Berth & Crane Optimiser: visual berth board and allocation recommendation simulation.
- Route Optimiser: alternate route recommendations with accept/view actions.
- 72-Hour Plan: generate a sample plan in a modal.
- Analytics: simple stats and filter buttons.
- Notification dropdown and global search.

Decision logic (simulated)
- Risk is determined from terminal capacity: capacity > 85% -> HIGH; >65% -> MEDIUM; else LOW.
- Route recommendations suggest lower-risk terminals when a terminal is HIGH risk.
- Berth allocation simulation avoids occupied berths and recommends available ones.

Files
- index.html — main layout and pages
- style.css — design system and responsive styles
- script.js — application data, UI rendering and interactions
- README.md — this file

Notes
- This is intentionally a front-end-only prototype. It uses simulated/sample data and deterministic JavaScript rules to demonstrate the concept.
- No external libraries or back-end services are used.

Academic integrity
- Do not claim the prototype uses real-time vessel tracking, live AI, or production optimisation algorithms. The README and UI clearly label simulations and prototype assumptions.