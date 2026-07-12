const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.render('index', { items, error: '' });
  } catch (error) {
    res.render('index', { items: [], error: 'Unable to load items right now.' });
  }
});

router.post('/items', async (req, res) => {
  try {
    const { name, quantity } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const item = await Item.create({
      name: name.trim(),
      quantity: Number(quantity) || 1
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create item.' });
  }
});

router.patch('/items/:id/toggle', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    item.purchased = !item.purchased;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Unable to update item.' });
  }
});

router.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete item.' });
  }
});

module.exports = router;
