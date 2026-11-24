const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'Ruby-postgres',
  user: process.env.DB_USER || 'Ruby_user',
  password: process.env.DB_PASSWORD || 'Ruby123',
  database: process.env.DB_NAME || 'Ruby_db',
  port: 5432,
});

// Crear la tabla automáticamente si no existe al arrancar
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favoritos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        color VARCHAR(50) NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla 'favoritos' verificada en PostgreSQL ✅");
  } catch (err) {
    console.error("Error inicializando tabla:", err);
  }
}
initDB();

// Ruta principal (Panel Web Centrado)
app.get('/', async (req, res) => {
  try {
    const dbData = await pool.query('SELECT NOW() as hora_bd');
    const registros = await pool.query('SELECT * FROM favoritos ORDER BY id DESC LIMIT 5');

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Panel PostgreSQL - Ruby Loor</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          color: #f8fafc;
        }
        .card {
          background: #1e293b;
          border: 1px solid #334155;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 480px;
          text-align: center;
        }
        .badge {
          display: inline-block;
          background: #0284c7;
          color: white;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        h1 { font-size: 1.5rem; margin-bottom: 6px; color: #38bdf8; }
        p.subtitle { color: #94a3b8; font-size: 0.9rem; margin-bottom: 24px; }
        .form-group {
          text-align: left;
          margin-bottom: 16px;
        }
        label {
          display: block;
          font-size: 0.85rem;
          color: #cbd5e1;
          margin-bottom: 6px;
          font-weight: 500;
        }
        input[type="text"] {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #475569;
          background: #0f172a;
          color: white;
          font-size: 0.95rem;
          outline: none;
          transition: border 0.2s;
        }
        input[type="text"]:focus {
          border-color: #38bdf8;
        }
        .color-picker-container {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        input[type="color"] {
          border: none;
          width: 45px;
          height: 42px;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
        }
        button {
          width: 100%;
          background: #0284c7;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          margin-top: 8px;
        }
        button:hover { background: #0369a1; }
        button:active { transform: scale(0.98); }
        .list-section {
          margin-top: 24px;
          text-align: left;
          border-top: 1px solid #334155;
          padding-top: 16px;
        }
        .list-title {
          font-size: 0.85rem;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .registro-item {
          background: #0f172a;
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          border-left: 4px solid #38bdf8;
        }
        .color-dot {
          display: inline-block;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          margin-right: 6px;
          vertical-align: middle;
        }
        .footer-info {
          margin-top: 20px;
          font-size: 0.75rem;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">Yo estudio en Yavirac</span>
        <h1>Despliegue con PostgreSQL</h1>
        <p class="subtitle">Estudiante: <strong>Ruby Loor</strong></p>

        <form action="/guardar" method="POST">
          <div class="form-group">
            <label for="nombre">¿Cuál es tu nombre?</label>
            <input type="text" id="nombre" name="nombre" placeholder="Ej. Ruby Loor" required>
          </div>

          <div class="form-group">
            <label for="color">¿Cuál es tu color favorito?</label>
            <div class="color-picker-container">
              <input type="color" id="colorPicker" value="#38bdf8" onchange="document.getElementById('color').value = this.value">
              <input type="text" id="color" name="color" value="#38bdf8" placeholder="#38bdf8" required>
            </div>
          </div>

          <button type="submit">Guardar en Base de Datos 💾</button>
        </form>

        <div class="list-section">
          <div class="list-title">Últimos registros en PostgreSQL:</div>
          ${registros.rows.length === 0 ? '<p style="color:#64748b; font-size:0.85rem;">Aún no hay registros guardados.</p>' : ''}
          ${registros.rows.map(r => `
            <div class="registro-item" style="border-left-color: ${r.color};">
              <span><strong>${r.nombre}</strong></span>
              <span><span class="color-dot" style="background:${r.color};"></span>${r.color}</span>
            </div>
          `).join('')}
        </div>

        <div class="footer-info">
          PostgreSQL Online ✅ | Servidor: ${dbData.rows[0].hora_bd.toLocaleTimeString()}
        </div>
      </div>
    </body>
    </html>
    `;
    res.send(html);
  } catch (error) {
    res.status(500).send("Error de conexión a PostgreSQL: " + error.message);
  }
});

// Ruta para recibir y guardar los datos del formulario en PostgreSQL
app.post('/guardar', async (req, res) => {
  const { nombre, color } = req.body;
  try {
    if (nombre && color) {
      await pool.query('INSERT INTO favoritos (nombre, color) VALUES ($1, $2)', [nombre, color]);
    }
    res.redirect('/');
  } catch (err) {
    console.error("Error guardando en BD:", err);
    res.status(500).send("Error al guardar en PostgreSQL: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});
