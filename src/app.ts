import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Person } from './person';
import cors from 'cors';
import fs from 'fs';

const app = express();

app.use(cors());
app.use(bodyParser.json());

const port = 3000;



function readDataFromFile() {
  try {
    const data = fs.readFileSync('dist/data.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier JSON :', error);
    return [];
  
  }
}

let people: Person[] = readDataFromFile();

app.get('/people', (req: Request, res: Response) => {
  const peopleData = readDataFromFile();
  res.json(people);
});

function writeDataToFile(data: Person[]) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync('./dist/data.json', jsonData, 'utf8');
  } catch (error) {
    // Gérer les erreurs d'écriture dans le fichier
    console.error('Erreur lors de l\'écriture dans le fichier JSON :', error);
  }
}

app.post('/people', (req: Request, res: Response) => {
  const { nom, prenom, mail, phone } = req.body;
  const person = new Person(nom, prenom, mail, phone);
  people.push(person);
  writeDataToFile(people);
  res.status(201).json(person);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});