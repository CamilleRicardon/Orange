"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Person = exports.generateUniqueId = void 0;
function generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${timestamp}-${random}`;
}
exports.generateUniqueId = generateUniqueId;
class Person {
    constructor(nom, prenom, mail, phone, id) {
        this.nom = nom;
        this.prenom = prenom;
        this.mail = mail;
        this.phone = phone;
        this.id = generateUniqueId();
    }
    getNom() {
        return this.nom;
    }
    setNom(nom) {
        this.nom = nom;
    }
    getPrenom() {
        return this.prenom;
    }
    setPrenom(prenom) {
        this.prenom = prenom;
    }
    getMail() {
        return this.mail;
    }
    setMail(mail) {
        this.mail = mail;
    }
    getPhone() {
        return this.phone;
    }
    setPhone(phone) {
        this.phone = phone;
    }
    getId() {
        return this.id;
    }
}
exports.Person = Person;
