const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let incidents = [
  { id: 1, timestamp: new Date().toLocaleTimeString(), service: "Auth-Service", code: 401, message: "Unauthorized Token", status: "Open", severity: "Warning" },
  { id: 2, timestamp: new Date().toLocaleTimeString(), service: "Payment-Gateway", code: 504, message: "Gateway Timeout", status: "Investigating", severity: "Critical" },
  { id: 3, timestamp: new Date().toLocaleTimeString(), service: "User-DB", code: 500, message: "Connection Pool Exhausted", status: "Open", severity: "Critical" }
];

app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.post('/api/incidents/trigger', (req, res) => {
  const { service, code, message, severity } = req.body;
  const newIncident = {
    id: incidents.length + 1,
    timestamp: new Date().toLocaleTimeString(),
    service: service || "Unknown-Service",
    code: code || 500,
    message: message || "Internal Server Failure",
    status: "Open",
    severity: severity || "Critical"
  };
  incidents.unshift(newIncident);
  res.status(201).json(newIncident);
});

app.patch('/api/incidents/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const incident = incidents.find(i => i.id === id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });
  incident.status = req.body.status || "Resolved";
  res.json(incident);
});

const htmlPage = [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '<head>',
  '  <meta charset="UTF-8">',
  '  <title>OpsShield — Incident Dashboard</title>',
  '  <script src="https://cdn.tailwindcss.com"></script>',
  '</head>',
  '<body class="bg-slate-900 text-slate-100 min-h-screen p-8 font-sans">',
  '  <div class="max-w-5xl mx-auto">',
  '    <header class="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">',
  '      <div>',
  '        <h1 class="text-2xl font-bold text-emerald-400">OpsShield Incident Desk</h1>',
  '        <p class="text-sm text-slate-400">Production Error Triage & System Monitoring</p>',
  '      </div>',
  '      <span class="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/30">System Live</span>',
  '    </header>',
  '    <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-6 flex gap-3">',
  '      <button onclick="triggerError(\'Payment-API\', 504, \'Gateway Timeout\', \'Critical\')" class="bg-rose-600 hover:bg-rose-700 text-xs font-semibold px-3 py-2 rounded">Simulate 504 Timeout</button>',
  '      <button onclick="triggerError(\'Auth-Service\', 401, \'Invalid Bearer Token\', \'Warning\')" class="bg-amber-600 hover:bg-amber-700 text-xs font-semibold px-3 py-2 rounded">Simulate 401 Auth Failure</button>',
  '      <button onclick="triggerError(\'MySQL-Cluster\', 500, \'Deadlock Detected\', \'Critical\')" class="bg-purple-600 hover:bg-purple-700 text-xs font-semibold px-3 py-2 rounded">Simulate 500 DB Deadlock</button>',
  '    </div>',
  '    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">',
  '      <table class="w-full text-left text-sm">',
  '        <thead class="bg-slate-950 text-slate-400 border-b border-slate-700">',
  '          <tr>',
  '            <th class="p-3">Time</th>',
  '            <th class="p-3">Service</th>',
  '            <th class="p-3">Code</th>',
  '            <th class="p-3">Message</th>',
  '            <th class="p-3">Severity</th>',
  '            <th class="p-3">Status</th>',
  '            <th class="p-3">Action</th>',
  '          </tr>',
  '        </thead>',
  '        <tbody id="incident-rows"></tbody>',
  '      </table>',
  '    </div>',
  '  </div>',
  '  <script>',
  '    async function fetchIncidents() {',
  '      const res = await fetch("/api/incidents");',
  '      const data = await res.json();',
  '      const rows = document.getElementById("incident-rows");',
  '      rows.innerHTML = data.map(i => {',
  '        const codeColor = i.code >= 500 ? "text-rose-400" : "text-amber-400";',
  '        const sevClass = i.severity === "Critical" ? "bg-rose-900/50 text-rose-300 border border-rose-700" : "bg-amber-900/50 text-amber-300 border border-amber-700";',
  '        const statusColor = i.status === "Resolved" ? "text-emerald-400" : "text-amber-300";',
  '        return "<tr class=\\"border-b border-slate-700/50\\">" +',
  '          "<td class=\\"p-3 text-slate-400\\">" + i.timestamp + "</td>" +',
  '          "<td class=\\"p-3 font-medium\\">" + i.service + "</td>" +',
  '          "<td class=\\"p-3 font-mono " + codeColor + "\\">" + i.code + "</td>" +',
  '          "<td class=\\"p-3 text-slate-300\\">" + i.message + "</td>" +',
  '          "<td class=\\"p-3\\"><span class=\\"px-2 py-0.5 rounded text-xs " + sevClass + "\\">" + i.severity + "</span></td>" +',
  '          "<td class=\\"p-3 font-semibold " + statusColor + "\\">" + i.status + "</td>" +',
  '          "<td class=\\"p-3\\"><select onchange=\\"updateStatus(" + i.id + ", this.value)\\" class=\\"bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1\\">" +',
  '          "<option value=\\"\\" disabled selected>Update</option>" +',
  '          "<option value=\\"Open\\">Open</option>" +',
  '          "<option value=\\"Investigating\\">Investigating</option>" +',
  '          "<option value=\\"Resolved\\">Resolved</option>" +',
  '          "</select></td></tr>";',
  '      }).join("");',
  '    }',
  '    async function triggerError(service, code, message, severity) {',
  '      await fetch("/api/incidents/trigger", {',
  '        method: "POST",',
  '        headers: { "Content-Type": "application/json" },',
  '        body: JSON.stringify({ service: service, code: code, message: message, severity: severity })',
  '      });',
  '      fetchIncidents();',
  '    }',
  '    async function updateStatus(id, status) {',
  '      await fetch("/api/incidents/" + id + "/status", {',
  '        method: "PATCH",',
  '        headers: { "Content-Type": "application/json" },',
  '        body: JSON.stringify({ status: status })',
  '      });',
  '      fetchIncidents();',
  '    }',
  '    fetchIncidents();',
  '  </script>',
  '</body>',
  '</html>'
].join('\n');

app.get('/', (req, res) => {
  res.send(htmlPage);
});

app.listen(PORT, () => {
  console.log('OpsShield Incident Desk running at http://localhost:' + PORT);
});
