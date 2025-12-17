import express from 'express';
import cors from 'cors';

// Define interface locally to avoid dependency on src files in server context
interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: string;
}

const app = express();
const PORT = 3000;

app.use(cors() as any);
app.use(express.json());

// In-memory storage with initial seed data
let issues: Issue[] = [
  {
    id: '1',
    title: 'Setup Project Structure',
    description: 'Initialize Angular project with Tailwind CSS.',
    status: 'done',
    priority: 'high',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Implement Drag & Drop',
    description: 'Create Kanban board with HTML5 Drag and Drop API.',
    status: 'inprogress',
    priority: 'high',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Connect AI Service',
    description: 'Integrate Gemini API for auto-generating descriptions.',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date().toISOString()
  }
];

// GET all issues
app.get('/api/issues', (req: any, res: any) => {
  res.json(issues);
});

// POST new issue
app.post('/api/issues', (req: any, res: any) => {
  const body = req.body;
  
  if (!body.title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const newIssue: Issue = {
    id: body.id || Math.random().toString(36).substring(2, 9),
    title: body.title,
    description: body.description || '',
    status: body.status || 'todo',
    priority: body.priority || 'medium',
    assignee: body.assignee,
    createdAt: body.createdAt || new Date().toISOString()
  };

  issues.push(newIssue);
  res.status(201).json(newIssue);
});

// PUT update issue
app.put('/api/issues/:id', (req: any, res: any) => {
  const { id } = req.params;
  const body = req.body;
  
  const index = issues.findIndex(i => i.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Issue not found' });
    return;
  }

  const updatedIssue: Issue = {
    ...issues[index],
    title: body.title ?? issues[index].title,
    description: body.description ?? issues[index].description,
    status: body.status ?? issues[index].status,
    priority: body.priority ?? issues[index].priority,
    assignee: body.assignee ?? issues[index].assignee
  };

  issues[index] = updatedIssue;
  res.json(updatedIssue);
});

// DELETE issue
app.delete('/api/issues/:id', (req: any, res: any) => {
  const { id } = req.params;
  const initialLength = issues.length;
  issues = issues.filter(i => i.id !== id);
  
  if (issues.length === initialLength) {
     res.status(404).json({ error: 'Issue not found' });
     return;
  }
  
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});