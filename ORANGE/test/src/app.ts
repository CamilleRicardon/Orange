import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Person } from './person';
import { generateUniqueId } from './person';
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

function writeDataToFile(data: Person[]): void {
  try {
    const updatedData = data.map(person => ({
      ...person,
      id: person.id || generateUniqueId() // Génère un nouvel ID si l'ID est manquant ou non défini
    }));
    const jsonData = JSON.stringify(updatedData, null, 2);
    fs.writeFileSync('./dist/data.json', jsonData, 'utf8');
  } catch (error) {
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

app.delete('/people/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const index = people.findIndex(person => person.id === id);
  if (index !== -1) {
    const deletedPerson = people.splice(index, 1)[0];
    writeDataToFile(people);
    res.json(deletedPerson);
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});

app.put('/people/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const { nom, prenom, mail, phone } = req.body;
  const index = people.findIndex(person => person.id === id);
  if (index !== -1) {
    const updatedPerson = new Person(nom, prenom, mail, phone, people[index].id);
    people[index] = updatedPerson;
    writeDataToFile(people);
    res.json(updatedPerson);
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});