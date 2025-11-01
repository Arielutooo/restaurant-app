# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto Restaurant Digital!

## 📋 Código de Conducta

- Sé respetuoso y profesional
- Acepta críticas constructivas
- Enfócate en lo mejor para la comunidad
- Muestra empatía hacia otros colaboradores

## 🚀 Cómo Contribuir

### 1. Reportar Bugs

Usa GitHub Issues e incluye:
- Descripción clara del bug
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Información del sistema (OS, Node version, etc.)

### 2. Sugerir Features

Abre un Issue con:
- Descripción detallada de la funcionalidad
- Caso de uso
- Beneficios esperados
- Posible implementación (opcional)

### 3. Enviar Pull Requests

#### Setup

```bash
# Fork el repositorio
# Clonar tu fork
git clone https://github.com/tu-usuario/restaurant-app.git

# Agregar upstream
git remote add upstream https://github.com/original/restaurant-app.git

# Instalar dependencias
npm run install:all
```

#### Desarrollo

```bash
# Crear rama para tu feature
git checkout -b feature/nombre-descriptivo

# O para bug fix
git checkout -b fix/nombre-bug

# Hacer cambios y commits
git add .
git commit -m "feat: descripción del cambio"
```

#### Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Bug fix
- `docs:` Cambios en documentación
- `style:` Formateo, sin cambios de código
- `refactor:` Refactorización de código
- `test:` Agregar o corregir tests
- `chore:` Mantenimiento general

Ejemplos:
```
feat: agregar soporte para WhatsApp notifications
fix: corregir cálculo de propina en Payment
docs: actualizar README con nuevas instrucciones
refactor: simplificar lógica de validación de stock
```

#### Testing

```bash
# Antes de hacer PR, asegúrate de probar:
npm run seed  # Reinicializar DB
npm run dev:backend
npm run dev:crm
npm run dev:frontend

# Probar flujo completo:
# 1. Cliente hace pedido
# 2. Garzón aprueba
# 3. Cocina prepara
# 4. Cliente paga
```

#### Enviar PR

```bash
# Push a tu fork
git push origin feature/nombre-descriptivo

# Crear PR en GitHub
# Incluir:
# - Descripción clara de cambios
# - Screenshots si hay cambios UI
# - Referencias a Issues relacionados
# - Checklist de testing realizado
```

## 🏗️ Estructura del Proyecto

```
/backend
  /src
    /controllers   # Lógica de endpoints
    /models        # Schemas Mongoose
    /services      # Lógica de negocio
    /middlewares   # Auth, validación, etc.
    /routes        # Definición de rutas

/frontend
  /src
    /pages         # Componentes de página
    /components    # Componentes reutilizables
    /context       # Context API
    /api           # Llamadas HTTP

/crm
  /src
    /controllers   # Analytics endpoints
    /models        # Event storage
```

## 💻 Estándares de Código

### JavaScript/React

- Usar ES6+
- Arrow functions para funciones anónimas
- Destructuring cuando sea posible
- Nombres descriptivos de variables
- Comentarios para lógica compleja

### Estilo

```javascript
// ✅ Bueno
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// ❌ Malo
function calc(i) {
  let t = 0;
  for(let x = 0; x < i.length; x++) {
    t = t + i[x].price * i[x].quantity;
  }
  return t;
}
```

### React Components

```jsx
// ✅ Functional components con hooks
const MenuItem = ({ item, onAdd }) => {
  const [quantity, setQuantity] = useState(1);
  
  return (
    <div className="menu-item">
      <h3>{item.name}</h3>
      <button onClick={() => onAdd(item, quantity)}>
        Agregar
      </button>
    </div>
  );
};

// ❌ Evitar class components en código nuevo
```

## 🧪 Testing

### Áreas Críticas

1. **Validación de stock** antes de crear orden
2. **Cálculo de totales** incluyendo propina
3. **Generación de QR** con tokens válidos
4. **Flujo de pago** end-to-end
5. **Autenticación** con PIN

### Testing Manual Checklist

- [ ] QR genera token válido
- [ ] Menú muestra solo items disponibles
- [ ] Carrito persiste en refresh
- [ ] Stock se reduce al crear orden
- [ ] PIN incorrecto rechaza aprobación
- [ ] Orden aparece en cocina después de aprobar
- [ ] Pago actualiza estado correctamente
- [ ] CRM recibe todos los eventos

## 📚 Recursos

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Stripe API](https://stripe.com/docs/api)
- [Vite Guide](https://vitejs.dev/guide/)

## ❓ Preguntas

Si tienes preguntas, abre un Issue con la etiqueta `question`.

## 🎉 ¡Gracias!

Cada contribución, sin importar su tamaño, es valiosa para el proyecto.

¡Happy coding! 🚀

