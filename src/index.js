const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const mysql = require('mysql2/promise'); // Usamos mysql2 para MySQL

const app = express();
const port = process.env.PORT || 8082;

// Configuración de la base de datos
const dbConfig = {
  host: 'junction.proxy.rlwy.net',
  user: 'root',
  password: 'gFBoHnyNvJoOkUqOLWqyNhtopvxayYid',
  database: 'railway',
  port: 41620,
};

// Crear una conexión global
let connection;

async function connectToDatabase() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a la base de datos');
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
}

connectToDatabase();

// Middleware para permitir solicitudes desde otros dominios (CORS)
app.use(cors({ origin: '*' }));
app.use(express.json()); // Permite recibir datos en formato JSON

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Galaxia de Armas API', // Título actualizado
      description: 'API para gestionar las armas cósmicas en un universo automatizado.', // Descripción temática
      version: '1.0.0',
    },
    server: [{ url: `https://api-rest-fgqq.onrender.com` }], // Cambia la URL si es necesario
  },
  apis: [`${path.join(__dirname, 'index.js')}`],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Nuevo tema "universo"
const customCss = `
  .swagger-ui .topbar {
    background-color: #1d1d1d; /* Fondo oscuro para la barra superior */
  }
  .swagger-ui .info {
    color: #00bfff; /* Color azul brillante para el texto del título */
  }
  .swagger-ui .swagger-ui .scheme-container {
    background: #0a0a0a; /* Fondo oscuro para el contenedor de esquemas */
  }
  .swagger-ui .opblock-summary {
    background-color: #262626; /* Fondo oscuro para las operaciones */
  }
  .swagger-ui .opblock-summary:hover {
    background-color: #444; /* Hover en las operaciones */
  }
  .swagger-ui .btn {
    background-color: #1e90ff; /* Botones con un color azul brillante */
  }
  .swagger-ui .btn:focus {
    box-shadow: 0 0 3px 3px rgba(0, 191, 255, 0.5); /* Efecto de foco con azul brillante */
  }
  .swagger-ui .topbar-wrapper img {
    filter: brightness(0) invert(1); /* Blanco para los íconos */
  }
  .swagger-ui .response-col_status {
    color: #32cd32; /* Verde para el estado de éxito */
  }
  .swagger-ui .response-col_error {
    color: #ff6347; /* Rojo para errores */
  }
  .swagger-ui .responses-inner {
    background-color: #222; /* Fondo oscuro para respuestas */
  }
  .swagger-ui .opblock-summary-description {
    color: #999; /* Color gris para las descripciones */
  }
  .swagger-ui .opblock-body {
    background-color: #121212; /* Fondo muy oscuro para el cuerpo de las operaciones */
  }
`;

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs, {
  customCss: customCss, // Aplicamos el nuevo tema de universo
  customJs: '/custom-swagger.js', // Si deseas usar un archivo JavaScript personalizado
}));

// Rutas de la API

/**
 * @swagger
 * /galaxias:
 *   get:
 *     description: Obtener todas las galaxias
 *     responses:
 *       200:
 *         description: Lista de galaxias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   masa_estelar:
 *                     type: string
 *                   tipo_de_estrella:
 *                     type: string
 *                   origen_galactico:
 *                     type: string
 */
app.get('/galaxias', async (req, res) => {
  try {
    console.log('Conectando a la base de datos...');
    const [rows] = await connection.query('SELECT * FROM Galaxias'); // Realiza la consulta
    console.log('Resultado de la consulta:', rows); // Verifica qué está devolviendo la base de datos
    res.json(rows); // Devuelve los resultados
  } catch (err) {
    console.error('Error en la consulta GET /galaxias:', err);
    res.status(500).json({ message: 'Error al obtener galaxias' });
  }
});

/**
 * @swagger
 * /galaxias/{id}:
 *   get:
 *     description: Obtener galaxia por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la galaxia a buscar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Galaxia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 masa_estelar:
 *                   type: string
 *                 tipo_de_estrella:
 *                   type: string
 *                 origen_galactico:
 *                   type: string
 *       404:
 *         description: Galaxia no encontrada
 */
app.get('/galaxias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.query('SELECT * FROM Galaxias WHERE id = ?', [id]); // Uso de parámetros
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Galaxia no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en la consulta GET /galaxias/:id:', err);
    res.status(500).json({ message: 'Error al obtener galaxia por ID' });
  }
});

// Otras rutas...

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express corriendo en puerto ${port}`);
});