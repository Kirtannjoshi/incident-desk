# OpsShield Incident Desk
A lightweight production error triage and API incident monitoring dashboard built with Node.js and Express.

## Features
- Simulates real-time HTTP failure states (401 Unauthorized, 500 DB Deadlock, 504 Gateway Timeout).
- Tracks incident resolution lifecycles (Open -> Investigating -> Resolved).
- RESTful endpoints tested via curl and scanned locally with nmap.

## Run Locally
    npm install
    node server.js
