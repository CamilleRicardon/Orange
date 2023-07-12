"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const person_1 = require("./person");
const person_2 = require("./person");
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const port = 3000;
function readDataFromFile() {
    try {
        const data = fs_1.default.readFileSync('dist/data.json', 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Erreur lors de la lecture du fichier JSON :', error);
        return [];
    }
}
let people = readDataFromFile();
app.get('/people', (req, res) => {
    const peopleData = readDataFromFile();
    res.json(people);
});
function writeDataToFile(data) {
    try {
        const updatedData = data.map(person => (Object.assign(Object.assign({}, person), { id: person.id || (0, person_2.generateUniqueId)() // Génère un nouvel ID si l'ID est manquant ou non défini
         })));
        const jsonData = JSON.stringify(updatedData, null, 2);
        fs_1.default.writeFileSync('./dist/data.json', jsonData, 'utf8');
    }
    catch (error) {
        console.error('Erreur lors de l\'écriture dans le fichier JSON :', error);
    }
}
app.post('/people', (req, res) => {
    const { nom, prenom, mail, phone } = req.body;
    const person = new person_1.Person(nom, prenom, mail, phone);
    people.push(person);
    writeDataToFile(people);
    res.status(201).json(person);
});
app.delete('/people/:id', (req, res) => {
    const id = req.params.id;
    const index = people.findIndex(person => person.id === id);
    if (index !== -1) {
        const deletedPerson = people.splice(index, 1)[0];
        writeDataToFile(people);
        res.json(deletedPerson);
    }
    else {
        res.status(404).json({ error: 'Person not found' });
    }
});
app.put('/people/:id', (req, res) => {
    const id = req.params.id;
    const { nom, prenom, mail, phone } = req.body;
    const index = people.findIndex(person => person.id === id);
    if (index !== -1) {
        const updatedPerson = new person_1.Person(nom, prenom, mail, phone, people[index].id);
        people[index] = updatedPerson;
        writeDataToFile(people);
        res.json(updatedPerson);
    }
    else {
        res.status(404).json({ error: 'Person not found' });
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
