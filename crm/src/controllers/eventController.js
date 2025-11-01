import CRMEvent from '../models/CRMEvent.js';

export const createEvent = async (req, res) => {
  try {
    const { type, payload, createdAt } = req.body;

    const event = new CRMEvent({
      type,
      payload,
      createdAt: createdAt || new Date()
    });

    await event.save();

    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 100 } = req.query;

    const filter = {};
    
    if (type) {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const events = await CRMEvent.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

