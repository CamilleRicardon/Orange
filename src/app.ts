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

app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Vérifiez si les informations d'identification correspondent à celles de l'administrateur
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Générez le JWT avec un identifiant spécifique pour l'administrateur (par exemple, 999)
    const adminId = 999; // Remplacez ceci par l'ID de l'administrateur
    const token = generateToken(adminId);

    // Renvoyez le JWT au client
    res.json({ token });
  } else {
    // Si l'authentification échoue, renvoyez un message d'erreur approprié
    res.status(401).json({ error: 'Identifiants invalides. Veuillez réessayer.' });
  }
});


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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on('SIGINT', () => {
  connection.end();
  process.exit();
});
