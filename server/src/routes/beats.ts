import { Router } from 'express';

const router = Router();

// Mock beats storage (replace with Prisma in production)
const beats: any[] = [];

router.get('/', (req, res) => {
  res.json({ beats });
});

router.get('/:id', (req, res) => {
  const beat = beats.find((b) => b.id === req.params.id);
  if (!beat) {
    return res.status(404).json({ error: 'Beat not found' });
  }
  res.json({ beat });
});

router.post('/', (req, res) => {
  try {
    const { title, description, bpm, pattern_data } = req.body;

    const beat = {
      id: Date.now().toString(),
      user_id: 'default-user',
      title,
      description,
      bpm,
      pattern_data,
      plays: 0,
      created_at: new Date(),
    };

    beats.push(beat);
    res.json({ beat });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create beat' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const index = beats.findIndex((b) => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    beats[index] = { ...beats[index], ...req.body, updated_at: new Date() };
    res.json({ beat: beats[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update beat' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const index = beats.findIndex((b) => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    beats.splice(index, 1);
    res.json({ message: 'Beat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete beat' });
  }
});

export default router;
