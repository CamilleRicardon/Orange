"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const person_1 = require("./person");
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
        const jsonData = JSON.stringify(data, null, 2);
        fs_1.default.writeFileSync('./dist/data.json', jsonData, 'utf8');
    }
    catch (error) {
        // Gérer les erreurs d'écriture dans le fichier
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
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
