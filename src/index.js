const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const mysql = require('mysql2/promise');

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

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Estrellas',
      description: 'API para gestionar información de estrellas en el universo.',
      version: '1.0.0',
    },
    servers: [{ url: `http://localhost:${port}` }],
  },
  apis: [`${path.join(__dirname, 'index.js')}`],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

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
 *                     type: number
 *                   tipo_de_estrella:
 *                     type: string
 *                   origen_galactico:
 *                     type: string
 */
app.get('/estrellas', async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM Estrellas');
    res.json(rows);
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
 *       404:
 *         description: Estrella no encontrada
 */
app.get('/estrellas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.query('SELECT * FROM Estrellas WHERE id = ?', [id]);
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
 *                 type: number
 *               tipo_de_estrella:
 *                 type: string
 *               origen_galactico:
 *                 type: string
 *     responses:
 *       201:
 *         description: Estrella creada
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
 *                 type: number
 *               tipo_de_estrella:
 *                 type: string
 *               origen_galactico:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estrella actualizada
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