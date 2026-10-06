const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const dataDir = path.join(__dirname, '../data');
const requestsFilePath = path.join(dataDir, 'requests.json');

const serviceCatalog = [
  {
    id: 'certificate',
    name: 'Certificate Request',
    description: 'Request academic, character, transfer, or course completion certificates.',
    icon: '🎓',
    duration: '2-5 working days',
  },
  {
    id: 'equipment',
    name: 'Lab Equipment Request',
    description: 'Request access to lab equipment, instruments, or consumables for practical work.',
    icon: '🧪',
    duration: 'Same day to 3 days',
  },
  {
    id: 'maintenance',
    name: 'Maintenance Work',
    description: 'Report room, electrical, plumbing, furniture, or facility issues for repair.',
    icon: '🛠️',
    duration: '1-7 days',
  },
  {
    id: 'leave',
    name: 'Leave Application',
    description: 'Apply for medical, academic, or personal leave with supporting details.',
    icon: '🗓️',
    duration: '1-3 working days',
  },
  {
    id: 'cleaning',
    name: 'Campus Support',
    description: 'Request support for housekeeping, room access, or general campus assistance.',
    icon: '🏫',
    duration: 'Same day',
  }
];

function ensureFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(requestsFilePath)) {
    const defaultRequests = [
      {
        id: 1,
        studentName: 'Aisha Perera',
        serviceId: 'certificate',
        serviceName: 'Certificate Request',
        title: 'Transcript copy request',
        description: 'Need a transcript copy for scholarship application.',
        status: 'approved',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        studentName: 'Nimal Fernando',
        serviceId: 'equipment',
        serviceName: 'Lab Equipment Request',
        title: 'Microscope booking',
        description: 'Request one microscope for microbiology lab session on Friday.',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        studentName: 'Chathura Silva',
        serviceId: 'maintenance',
        serviceName: 'Maintenance Work',
        title: 'Projector not working in room C-204',
        description: 'Projector in classroom C-204 is not displaying content correctly.',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    ];

    fs.writeFileSync(requestsFilePath, JSON.stringify(defaultRequests, null, 2));
  }
}

function readRequests() {
  ensureFiles();
  const raw = fs.readFileSync(requestsFilePath, 'utf8');
  return JSON.parse(raw);
}

function writeRequests(data) {
  fs.writeFileSync(requestsFilePath, JSON.stringify(data, null, 2));
}

function buildStats(requests) {
  const counts = {
    total: requests.length,
    pending: requests.filter((request) => request.status === 'pending').length,
    inProgress: requests.filter((request) => request.status === 'in-progress').length,
    approved: requests.filter((request) => request.status === 'approved').length,
    rejected: requests.filter((request) => request.status === 'rejected').length,
  };

  return counts;
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Campus Service Management API is running.' });
});

app.get('/api/services', (req, res) => {
  res.json(serviceCatalog);
});

app.get('/api/requests', (req, res) => {
  const requests = readRequests();
  res.json(requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.get('/api/stats', (req, res) => {
  const requests = readRequests();
  const stats = buildStats(requests);
  res.json(stats);
});

app.post('/api/requests', (req, res) => {
  const { studentName, serviceId, title, description } = req.body;

  if (!studentName || !serviceId || !title || !description) {
    return res.status(400).json({ message: 'Missing required request details.' });
  }

  const service = serviceCatalog.find((item) => item.id === serviceId);
  if (!service) {
    return res.status(400).json({ message: 'Invalid service type.' });
  }

  const requests = readRequests();
  const nextId = requests.length ? Math.max(...requests.map((item) => item.id)) + 1 : 1;

  const newRequest = {
    id: nextId,
    studentName,
    serviceId,
    serviceName: service.name,
    title,
    description,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  requests.unshift(newRequest);
  writeRequests(requests);

  return res.status(201).json(newRequest);
});

app.patch('/api/requests/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'in-progress', 'approved', 'rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  const requests = readRequests();
  const requestIndex = requests.findIndex((item) => String(item.id) === String(id));

  if (requestIndex === -1) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  requests[requestIndex].status = status;
  writeRequests(requests);

  return res.json(requests[requestIndex]);
});

app.listen(PORT, () => {
  console.log(`Smart Campus Service API running on http://localhost:${PORT}`);
});
