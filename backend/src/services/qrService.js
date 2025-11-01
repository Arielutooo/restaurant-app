import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

class QRService {
  // Generar token de sesión para una mesa
  generateTableToken(tableId, tableNumber) {
    const sessionId = `${tableId}_${Date.now()}`;
    
    const token = jwt.sign(
      {
        tableId,
        tableNumber,
        sessionId,
        type: 'table_session'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Sesión válida por 8 horas
    );

    return { token, sessionId };
  }

  // Generar código QR
  async generateQRCode(tableId, tableNumber) {
    const { token, sessionId } = this.generateTableToken(tableId, tableNumber);
    
    const qrData = {
      url: `${process.env.FRONTEND_URL}/table/${tableNumber}`,
      token,
      tableId,
      tableNumber
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));
    
    return {
      qrCode: qrCodeDataUrl,
      token,
      sessionId
    };
  }

  // Validar token de QR
  verifyTableToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
}

export default new QRService();

