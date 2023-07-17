import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Person } from './person';
import { generateUniqueId } from './person';
import { QueryError, RowDataPacket } from 'mysql2';
import cors from 'cors';
import fs from 'fs';
import mysql from 'mysql2';
const app = express();

app.use(cors());
app.use(bodyParser.json());

const port = 3000;
//const mysql = require('mysql2');

function readDataFromFile() {
  try {
    const data = fs.readFileSync('dist/data.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier JSON :', error);
    return [];
  
  }
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


app.get('/people', (req: Request, res: Response) => {
  const query = 'SELECT * FROM personnes';
  connection.query(query, (error: QueryError | null, results: RowDataPacket[] | null) => {
    if (error) {
      console.error('Erreur lors de la récupération des personnes :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

app.get('/people/:id', (req: Request, res: Response) => {
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

app.post('/people', (req: Request, res: Response) => {
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

app.delete('/people/:id', (req: Request, res: Response) => {
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
});

app.put('/people', (req: Request, res: Response) => {
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
