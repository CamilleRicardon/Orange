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
const mysql2_1 = __importDefault(require("mysql2"));
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
const connection = mysql2_1.default.createConnection({
    host: 'localhost',
    user: 'Camille',
    password: 'linux_06',
    database: 'my_db'
});
let people = readDataFromFile();
connection.connect((error) => {
    if (error) {
        console.error('Erreur de connexion à la base de données :', error);
    }
    else {
        console.log('Connexion à la base de données réussie');
    }
});
app.get('/people', (req, res) => {
    const query = `
    SELECT p.*, GROUP_CONCAT(j.nom) AS jobs 
    FROM personnes p 
    LEFT JOIN personnes_jobs pm ON p.id = pm.personne_id 
    LEFT JOIN jobs j ON pm.metier_id = j.id 
    GROUP BY p.id
  `;
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des personnes :', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
        else {
            res.json(results);
        }
    });
});
app.get('/people/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM personnes WHERE id = ?';
    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération de la personne :', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
        else if (results === null || results.length === 0) {
            res.status(404).json({ error: 'Personne non trouvée' });
        }
        else {
            res.json(results[0]);
        }
    });
});
app.get('/jobs', (req, res) => {
    const query = 'SELECT * FROM jobs';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des métiers :', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
        else {
            res.json(results);
        }
    });
});
function writeDataToFile(data) {
    try {
        const updatedData = data.map(person => (Object.assign(Object.assign({}, person), { id: person.id || (0, person_1.generateUniqueId)() })));
        const jsonData = JSON.stringify(updatedData, null, 2);
        fs_1.default.writeFileSync('./dist/data.json', jsonData, 'utf8');
    }
    catch (error) {
        console.error('Erreur lors de l\'écriture dans le fichier JSON :', error);
    }
}
app.post('/people', (req, res) => {
    const { nom, prenom, mail, phone } = req.body;
    const query = 'INSERT INTO personnes (nom, prenom, mail, phone) VALUES (?, ?, ?, ?)';
    const values = [nom, prenom, mail, phone];
    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'ajout de la personne :', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
        else {
            const insertedPerson = { id: results.insertId, nom, prenom, mail, phone };
            res.status(201).json(insertedPerson);
        }
    });
});
app.post('/people/:personId/jobs/:jobId', (req, res) => {
    const personId = req.params.personId;
    const jobId = req.params.jobId;
    const query = 'INSERT INTO personnes_jobs (personne_id, metier_id) VALUES (?, ?)';
    const values = [personId, jobId];
    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'association du métier à la personne :', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
        else {
            res.status(201).json({ message: 'Métier associé à la personne avec succès' });
        }
    });
});
app.delete('/people/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM personnes WHERE id = ?';
    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression de la personne :', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
        else if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Personne non trouvée' });
        }
        else {
            res.json({ message: 'Personne supprimée avec succès' });
        }
    });
});
app.put('/people', (req, res) => {
    const { id, nom, prenom, mail, phone } = req.body;
    const query = 'UPDATE personnes SET nom = ?, prenom = ?, mail = ?, phone = ? WHERE id = ?';
    const values = [nom, prenom, mail, phone, id];
    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour de la personne :', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
        else if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Personne non trouvée' });
        }
        else {
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
