import Table from '../models/Table.js';
import qrService from '../services/qrService.js';

export const createSessionFromQR = async (req, res) => {
  try {
    const { token, tableNumber } = req.body;

    // Verificar el token del QR
    const decoded = qrService.verifyTableToken(token);

    // Buscar la mesa
    let table = await Table.findOne({ number: tableNumber });
    
    if (!table) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    // Abrir mesa si está cerrada
    if (table.status === 'closed') {
      table.status = 'open';
      table.activeToken = token;
      table.currentSessionId = decoded.sessionId;
      await table.save();
    }

    res.json({
      success: true,
      session: {
        tableId: table._id,
        tableNumber: table.number,
        sessionId: decoded.sessionId,
        token
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const generateTableQR = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    let table = await Table.findOne({ number: tableNumber });
    
    if (!table) {
      // Crear mesa si no existe
      table = new Table({ number: tableNumber });
      await table.save();
    }

    const qrData = await qrService.generateQRCode(table._id, table.number);

    res.json({
      success: true,
      tableNumber: table.number,
      qrCode: qrData.qrCode,
      token: qrData.token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

