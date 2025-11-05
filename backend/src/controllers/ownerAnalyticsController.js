import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

const getRangeDates = (range) => {
  const endDate = new Date();
  const startDate = new Date();

  switch (range) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  return { startDate, endDate };
};

export const getSummary = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const { startDate, endDate } = getRangeDates(range);

    // Pedidos pagados en el rango
    const paidOrders = await Order.find({
      status: 'paid',
      paidAt: { $gte: startDate, $lte: endDate }
    }).populate('items.itemId');

    // Total de ventas y propinas
    let totalSales = 0;
    let totalTips = 0;
    const itemsSold = {};
    const hourlyData = Array(24).fill(0);

    paidOrders.forEach(order => {
      totalSales += order.total;
      totalTips += order.tip || 0;

      // Agregar ventas por hora
      const hour = new Date(order.paidAt).getHours();
      hourlyData[hour] += order.total;

      // Contar items vendidos
      order.items.forEach(item => {
        const itemId = item.itemId?._id?.toString();
        if (itemId) {
          if (!itemsSold[itemId]) {
            itemsSold[itemId] = {
              itemId,
              name: item.itemId?.name || 'Desconocido',
              quantity: 0,
              revenue: 0
            };
          }
          itemsSold[itemId].quantity += item.quantity;
          itemsSold[itemId].revenue += item.price * item.quantity;
        }
      });
    });

    // Ticket promedio
    const avgTicket = paidOrders.length > 0 ? totalSales / paidOrders.length : 0;
    const avgTip = paidOrders.length > 0 ? totalTips / paidOrders.length : 0;

    // Top 5 y Low 5 items
    const itemsArray = Object.values(itemsSold);
    const itemsTop5 = itemsArray
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    const itemsLow5 = itemsArray
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);

    // Out of stock rate
    const totalActiveItems = await MenuItem.countDocuments({ 
      active: true, 
      softDelete: false 
    });
    const outOfStockItems = await MenuItem.countDocuments({ 
      active: true, 
      outOfStock: true,
      softDelete: false
    });
    const outOfStockRate = totalActiveItems > 0 
      ? (outOfStockItems / totalActiveItems) * 100 
      : 0;

    // Sell through rate (items que se vendieron al menos 1 vez)
    const itemsSoldCount = Object.keys(itemsSold).length;
    const sellThroughRate = totalActiveItems > 0
      ? (itemsSoldCount / totalActiveItems) * 100
      : 0;

    // Datos por hora (agregar nombres de hora)
    const byHour = hourlyData.map((sales, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      sales: Math.round(sales)
    }));

    res.json({
      success: true,
      range,
      summary: {
        totalSales: Math.round(totalSales),
        totalTips: Math.round(totalTips),
        avgTicket: Math.round(avgTicket),
        avgTip: Math.round(avgTip),
        totalOrders: paidOrders.length,
        itemsTop5,
        itemsLow5,
        outOfStockRate: Math.round(outOfStockRate * 10) / 10,
        sellThroughRate: Math.round(sellThroughRate * 10) / 10,
        byHour: byHour.filter(h => h.sales > 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTrends = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    // Obtener datos de 7 días y 30 días
    const { startDate: start7d } = getRangeDates('7d');
    const { startDate: start30d } = getRangeDates('30d');

    // Órdenes de 7 días
    const orders7d = await Order.find({
      status: 'paid',
      paidAt: { $gte: start7d }
    }).populate('items.itemId');

    // Órdenes de 30 días
    const orders30d = await Order.find({
      status: 'paid',
      paidAt: { $gte: start30d }
    }).populate('items.itemId');

    // Calcular ventas por item en cada período
    const calcSales = (orders) => {
      const sales = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          const itemId = item.itemId?._id?.toString();
          if (itemId) {
            if (!sales[itemId]) {
              sales[itemId] = {
                itemId,
                name: item.itemId?.name,
                quantity: 0
              };
            }
            sales[itemId].quantity += item.quantity;
          }
        });
      });
      return sales;
    };

    const sales7d = calcSales(orders7d);
    const sales30d = calcSales(orders30d);

    // Calcular tendencias (normalizado por día)
    const trends = [];
    Object.keys(sales7d).forEach(itemId => {
      const qty7d = sales7d[itemId].quantity;
      const qty30d = sales30d[itemId]?.quantity || 0;

      // Normalizar por día
      const avg7d = qty7d / 7;
      const avg30d = qty30d / 30;

      // Calcular cambio porcentual
      const change = avg30d > 0 
        ? ((avg7d - avg30d) / avg30d) * 100 
        : (qty7d > 0 ? 100 : 0);

      // Solo incluir si tiene volumen mínimo
      if (qty7d >= 3) {
        trends.push({
          itemId,
          name: sales7d[itemId].name,
          qty7d,
          qty30d,
          changePercent: Math.round(change * 10) / 10,
          trending: change > 20 ? 'up' : change < -20 ? 'down' : 'stable'
        });
      }
    });

    // Ordenar por cambio porcentual
    trends.sort((a, b) => b.changePercent - a.changePercent);

    res.json({
      success: true,
      trends: trends.slice(0, 10) // Top 10 tendencias
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

