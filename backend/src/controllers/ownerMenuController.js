import MenuItem from '../models/MenuItem.js';

export const getAllItems = async (req, res) => {
  try {
    const { active, category, includeDeleted } = req.query;

    const filter = {};
    
    if (active !== undefined) {
      filter.active = active === 'true';
    }
    
    if (category) {
      filter.category = category;
    }

    if (!includeDeleted) {
      filter.softDelete = false;
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      cost,
      category,
      stock,
      tags,
      badges,
      imageUrl
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ 
        error: 'Nombre, precio y categoría son requeridos' 
      });
    }

    const item = new MenuItem({
      name,
      description,
      price,
      cost: cost || 0,
      category,
      stock: stock !== undefined ? stock : 999,
      outOfStock: stock === 0,
      tags: tags || [],
      badges: badges || [],
      imageUrl: imageUrl || '',
      active: true,
      available: true
    });

    await item.save();

    res.status(201).json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await MenuItem.findById(id);

    if (!item || item.softDelete) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Actualizar campos permitidos
    const allowedUpdates = [
      'name', 'description', 'price', 'cost', 'category', 
      'tags', 'badges', 'imageUrl'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        item[field] = updates[field];
      }
    });

    item.updatedAt = Date.now();
    await item.save();

    res.json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findById(id);

    if (!item || item.softDelete) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    item.active = !item.active;
    await item.save();

    res.json({
      success: true,
      item,
      message: `Item ${item.active ? 'activado' : 'desactivado'}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, outOfStock } = req.body;

    const item = await MenuItem.findById(id);

    if (!item || item.softDelete) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    if (stock !== undefined) {
      item.stock = stock;
      item.outOfStock = stock === 0;
      item.available = stock > 0;
    }

    if (outOfStock !== undefined) {
      item.outOfStock = outOfStock;
      item.available = !outOfStock;
    }

    await item.save();

    res.json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    if (permanent === 'true') {
      await item.deleteOne();
    } else {
      item.softDelete = true;
      item.active = false;
      await item.save();
    }

    res.json({
      success: true,
      message: permanent === 'true' ? 'Item eliminado permanentemente' : 'Item eliminado'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

