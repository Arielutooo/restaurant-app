import MenuItem from '../models/MenuItem.js';

export const getMenu = async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = { 
      active: true,
      available: true,
      outOfStock: false,
      softDelete: false,
      stock: { $gt: 0 }
    };
    
    if (category) {
      filter.category = category;
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    // Agrupar por categoría
    const groupedMenu = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      menu: groupedMenu,
      items: items
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validateCart = async (req, res) => {
  try {
    const { items } = req.body;

    const validationResults = [];
    let allAvailable = true;

    for (const cartItem of items) {
      const menuItem = await MenuItem.findById(cartItem.itemId);
      
      if (!menuItem) {
        validationResults.push({
          itemId: cartItem.itemId,
          available: false,
          reason: 'Item no encontrado'
        });
        allAvailable = false;
        continue;
      }

      if (!menuItem.available || menuItem.stock < cartItem.quantity) {
        validationResults.push({
          itemId: cartItem.itemId,
          available: false,
          reason: menuItem.stock === 0 ? 'Sin stock' : 'Stock insuficiente',
          currentStock: menuItem.stock
        });
        allAvailable = false;
      } else {
        validationResults.push({
          itemId: cartItem.itemId,
          available: true,
          price: menuItem.price
        });
      }
    }

    res.json({
      success: true,
      allAvailable,
      validationResults
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

