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
      title: 'Galaxia de Estrellas API', // Título actualizado
      description: 'API para gestionar las estrellas en un universo automatizado.', // Descripción temática
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
 * /estrellas:
 *   get:
 *     description: Obtener todas las estrellas
 *     responses:
 *       200:
 *         description: Lista de estrellas
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
app.get('/estrellas', async (req, res) => {
  try {
    console.log('Conectando a la base de datos...');
    const [rows] = await connection.query('SELECT * FROM Estrellas'); // Realiza la consulta en la tabla Estrellas
    console.log('Resultado de la consulta:', rows); // Verifica qué está devolviendo la base de datos
    res.json(rows); // Devuelve los resultados
  } catch (err) {
    console.error('Error en la consulta GET /estrellas:', err);
    res.status(500).json({ message: 'Error al obtener estrellas' });
  }
});

/**
 * @swagger
 * /estrellas/{id}:
 *   get:
 *     description: Obtener estrella por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la estrella a buscar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estrella encontrada
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
 *         description: Estrella no encontrada
 */
app.get('/estrellas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.query('SELECT * FROM Estrellas WHERE id = ?', [id]); // Uso de parámetros
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Estrella no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en la consulta GET /estrellas/:id:', err);
    res.status(500).json({ message: 'Error al obtener estrella por ID' });
  }
});

/**
 * @swagger
 * /estrellas:
 *   post:
 *     description: Crear una nueva estrella
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               masa_estelar:
 *                 type: string
 *               tipo_de_estrella:
 *                 type: string
 *               origen_galactico:
 *                 type: string
 *     responses:
 *       201:
 *         description: Estrella creada
 *       400:
 *         description: Datos inválidos
 */
app.post('/estrellas', async (req, res) => {
  const { nombre, masa_estelar, tipo_de_estrella, origen_galactico } = req.body;
  if (!nombre || !masa_estelar || !tipo_de_estrella || !origen_galactico) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }
  
  try {
    const [result] = await connection.query(
      'INSERT INTO Estrellas (nombre, masa_estelar, tipo_de_estrella, origen_galactico) VALUES (?, ?, ?, ?)',
      [nombre, masa_estelar, tipo_de_estrella, origen_galactico]
    );
    res.status(201).json({ id: result.insertId, nombre, masa_estelar, tipo_de_estrella, origen_galactico });
  } catch (err) {
    console.error('Error en la consulta POST /estrellas:', err);
    res.status(500).json({ message: 'Error al crear estrella' });
  }
});

/**
 * @swagger
 * /estrellas/{id}:
 *   put:
 *     description: Actualizar una estrella por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la estrella a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               masa_estelar:
 *                 type: string
 *               tipo_de_estrella:
 *                 type: string
 *               origen_galactico:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estrella actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Estrella no encontrada
 */
app.put('/estrellas/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, masa_estelar, tipo_de_estrella, origen_galactico } = req.body;
  
  if (!nombre || !masa_estelar || !tipo_de_estrella || !origen_galactico) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const [result] = await connection.query(
      'UPDATE Estrellas SET nombre = ?, masa_estelar = ?, tipo_de_estrella = ?, origen_galactico = ? WHERE id = ?',
      [nombre, masa_estelar, tipo_de_estrella, origen_galactico, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Estrella no encontrada' });
    }

    res.json({ message: 'Estrella actualizada' });
  } catch (err) {
    console.error('Error en la consulta PUT /estrellas/:id:', err);
    res.status(500).json({ message: 'Error al actualizar estrella' });
  }
});

/**
 * @swagger
 * /estrellas/{id}:
 *   delete:
 *     description: Eliminar una estrella por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la estrella a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estrella eliminada
 *       404:
 *         description: Estrella no encontrada
 */
app.delete('/estrellas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.query('DELETE FROM Estrellas WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Estrella no encontrada' });
    }
    res.json({ message: 'Estrella eliminada' });
  } catch (err) {
    console.error('Error en la consulta DELETE /estrellas/:id:', err);
    res.status(500).json({ message: 'Error al eliminar estrella' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
