import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { Person } from './person';
import { generateUniqueId } from './person';
import { QueryError, RowDataPacket } from 'mysql2';
import { TokenExpiredError } from 'jsonwebtoken';
import cors from 'cors';
import fs from 'fs';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swaggerConfig');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const port = 3000;

const ADMIN_USERNAME = 'Camille';
const ADMIN_PASSWORD = 'potat';

function readDataFromFile() {
  try {
    const data = fs.readFileSync('dist/data.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier JSON :', error);
    return [];
  
  }
}

function generateToken(userId: number): string {
  const secretKey = 'potat';
  const expiresIn = '1h';
  const payload = { userId };

  return jwt.sign(payload, secretKey, { expiresIn });
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({error: 'Token manquant ou invalide'})
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant. Authentification requise.' });
  }

  console.log('Token reçu :', token); // Ajouter cette ligne pour voir le token reçu dans la console

  const secretKey = 'potat';
  jwt.verify(token, secretKey, (error, decoded) => {
    if (error) {
      console.log('Erreur de vérification du token :', error); // Ajouter cette ligne pour voir l'erreur dans la console

      if (error instanceof TokenExpiredError) {
        return res.status(401).json({ error: 'Token expiré. Veuillez vous reconnecter.' });
      }
      return res.status(403).json({ error: 'Token invalide.' });
    }

    console.log('Token décodé :', decoded); // Ajouter cette ligne pour voir le contenu du token décodé dans la console

    req.userId = (decoded as { userId: number }).userId;
    next();
  });
}

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'Camille',
  password: 'linux_06',
  database: 'my_db'
});

let people: Person[] = readDataFromFile();

connection.connect((error: QueryError | null) => {
  if (error) {
    console.error('Erreur de connexion à la base de données :', error);
  } else {
    console.log('Connexion à la base de données réussie');
  }
});

/**
 * @swagger
 * /people:
 *   get:
 *     summary: Récupère la liste des personnes
 *     description: Récupère la liste de toutes les personnes de la base de données.
 *     responses:
 *       200:
 *         description: Succès. Renvoie la liste des personnes.
 *       500:
 *         description: Erreur serveur.
 */

app.get('/people', authenticateToken, (req: Request, res: Response) => {
  const query = `
    SELECT p.*, GROUP_CONCAT(j.nom) AS jobs 
    FROM personnes p 
    LEFT JOIN personnes_jobs pm ON p.id = pm.personne_id 
    LEFT JOIN jobs j ON pm.metier_id = j.id 
    GROUP BY p.id
  `;
  connection.query(query, (error: QueryError | null, results: RowDataPacket[] | null) => {
    if (error) {
      console.error('Erreur lors de la récupération des personnes :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

/**
 * @swagger
 * /people/{id}:
 *   get:
 *     summary: Récupère une personne par son ID
 *     description: Récupère une personne à partir de son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la personne à récupérer.
 *     responses:
 *       200:
 *         description: Succès. Renvoie les informations de la personne.
 *       404:
 *         description: Personne non trouvée.
 *       500:
 *         description: Erreur serveur.
 */
app.get('/people/:id', authenticateToken, (req: Request, res: Response) => {
  const id = req.params.id;
  const query = 'SELECT * FROM personnes WHERE id = ?';
  connection.query(query, [id], (error: QueryError | null, results: RowDataPacket[]) => {
    if (error) {
      console.error('Erreur lors de la récupération de la personne :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } else if (results === null || results.length === 0) {
      res.status(404).json({ error: 'Personne non trouvée' });
    } else {
      res.json(results[0]);
    }
  });
});

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Récupère la liste des métiers
 *     description: Récupère la liste de tous les métiers de la base de données.
 *     responses:
 *       200:
 *         description: Succès. Renvoie la liste des métiers.
 *       500:
 *         description: Erreur serveur.
 */
app.get('/jobs', authenticateToken, (req: Request, res: Response) => {
  const query = 'SELECT * FROM jobs';
  connection.query(query, (error: QueryError | null, results: RowDataPacket[] | null) => {
    if (error) {
      console.error('Erreur lors de la récupération des métiers :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});


function writeDataToFile(data: Person[]): void {
  try {
    const updatedData = data.map(person => ({
      ...person,
      id: person.id || generateUniqueId()
    }));
    const jsonData = JSON.stringify(updatedData, null, 2);
    fs.writeFileSync('./dist/data.json', jsonData, 'utf8');
  } catch (error) {
    console.error('Erreur lors de l\'écriture dans le fichier JSON :', error);
  }
}

/**
 * @swagger
 * /people:
 *   post:
 *     summary: Ajoute une nouvelle personne
 *     description: Ajoute une nouvelle personne à la base de données.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification (doit être fourni dans le header).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               mail:
 *                 type: string
 *               phone:
 *                 type: string
 *             example:
 *               nom: Doe
 *               prenom: John
 *               mail: john.doe@example.com
 *               phone: +1234567890
 *     responses:
 *       201:
 *         description: Succès. Renvoie les informations de la personne ajoutée.
 *       500:
 *         description: Erreur serveur.
 */
app.post('/people', authenticateToken, (req: Request, res: Response) => {
  const { nom, prenom, mail, phone } = req.body;
  const query = 'INSERT INTO personnes (nom, prenom, mail, phone) VALUES (?, ?, ?, ?)';
  const values = [nom, prenom, mail, phone];
  connection.query(query, values, (error: QueryError | null, results: RowDataPacket[] & { insertId: number }) => {
    if (error) {
      console.error('Erreur lors de l\'ajout de la personne :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      const insertedPerson = { id: results.insertId, nom, prenom, mail, phone };
      res.status(201).json(insertedPerson);
    }
  });
});


/**
 * @swagger
 * /people/{personId}/jobs/{jobId}:
 *   post:
 *     summary: Associe un métier à une personne
 *     description: Associe un métier à une personne dans la base de données.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification (doit être fourni dans le header).
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la personne à associer au métier.
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du métier à associer à la personne.
 *     responses:
 *       201:
 *         description: Succès. Le métier a été associé à la personne avec succès.
 *       500:
 *         description: Erreur serveur.
 */
app.post('/people/:personId/jobs/:jobId', authenticateToken, (req: Request, res: Response) => {
  const personId = req.params.personId;
  const jobId = req.params.jobId;
  const query = 'INSERT INTO personnes_jobs (personne_id, metier_id) VALUES (?, ?)';
  const values = [personId, jobId];
  connection.query(query, values, (error: QueryError | null, results: RowDataPacket[] & { insertId: number }) => {
    if (error) {
      console.error('Erreur lors de l\'association du métier à la personne :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.status(201).json({ message: 'Métier associé à la personne avec succès' });
    }
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion en tant qu'administrateur
 *     description: Connectez-vous en tant qu'administrateur pour obtenir un token d'authentification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               username: Camille
 *               password: potat
 *     responses:
 *       200:
 *         description: Succès. Renvoie un token d'authentification.
 *       401:
 *         description: Identifiants invalides. Veuillez réessayer.
 */
app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const adminId = 999;
    const token = generateToken(adminId);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Identifiants invalides. Veuillez réessayer.' });
  }
});

/**
 * @swagger
 * /people/{id}:
 *   delete:
 *     summary: Supprime une personne
 *     description: Supprime une personne de la base de données.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification (doit être fourni dans le header).
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la personne à supprimer.
 *     responses:
 *       200:
 *         description: Succès. La personne a été supprimée avec succès.
 *       404:
 *         description: Personne non trouvée.
 *       500:
 *         description: Erreur serveur.
 */
app.delete('/people/:id', authenticateToken, (req: Request, res: Response) => {
  if (req.userId !== 999) {
    return res.status(403).json({ error: 'Accès refusé. Vous n\'êtes pas autorisé à effectuer cette action.' });
  } else {
  const id = req.params.id;
  const query = 'DELETE FROM personnes WHERE id = ?';
  connection.query(query, [id], (error: QueryError | null, results: RowDataPacket[] & { affectedRows: number }) => {
    if (error) {
      console.error('Erreur lors de la suppression de la personne :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Personne non trouvée' });
    } else {
      res.json({ message: 'Personne supprimée avec succès' });
    }
  });
  }
});

/**
 * @swagger
 * /people:
 *   put:
 *     summary: Met à jour une personne
 *     description: Met à jour les informations d'une personne dans la base de données.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification (doit être fourni dans le header).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               mail:
 *                 type: string
 *               phone:
 *                 type: string
 *             example:
 *               id: 1
 *               nom: Doe
 *               prenom: John
 *               mail: john.doe@example.com
 *               phone: +1234567890
 *     responses:
 *       200:
 *         description: Succès. Les informations de la personne ont été mises à jour avec succès.
 *       404:
 *         description: Personne non trouvée.
 *       500:
 *         description: Erreur serveur.
 */
app.put('/people', authenticateToken, (req: Request, res: Response) => {
  const { id, nom, prenom, mail, phone } = req.body;
  const query = 'UPDATE personnes SET nom = ?, prenom = ?, mail = ?, phone = ? WHERE id = ?';
  const values = [nom, prenom, mail, phone, id];
  connection.query(query, values, (error: QueryError | null, results: RowDataPacket[] & { affectedRows: number }) => {
    if (error) {
      console.error('Erreur lors de la mise à jour de la personne :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Personne non trouvée' });
    } else {
      res.json({ message: 'Personne mise à jour avec succès' });
    }
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on('SIGINT', () => {
  connection.end();
  process.exit();
});
