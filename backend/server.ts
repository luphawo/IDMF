import express from 'express';
import cors from 'cors';
import path from 'path';
import workflowRouter from './routes/workflowRouter';

const app = express();
const PORT = process.env.PORT || 3005;

// Middlewares
app.use(cors({
    origin: '*', // Allow connections from frontend portals
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-role', 'x-email', 'x-name', 'x-unit']
}));
app.use(express.json());

// Serve premium frontend interface directly on root path
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../../frontend')));

// Main Workflow Router API mount
app.use('/api/initiatives', workflowRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'IDM Platform Backend API Services',
        environment: 'Development (Mock Auth Active)'
    });
});

app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 IDM Governance Orchestration Platform Backend is Active`);
    console.log(`🔗 API endpoint: http://localhost:${PORT}`);
    console.log(`🛡️  SSO Identity Mode: Mock Entra ID integration (x-role active)`);
    console.log(`📁 Local Data Storage persisted in backend/data/idmp_store.json`);
    console.log(`================================================================`);
});
