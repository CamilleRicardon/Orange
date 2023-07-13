"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Person = void 0;
class Person {
    constructor(nom, prenom, mail, phone) {
        this.nom = nom;
        this.prenom = prenom;
        this.mail = mail;
        this.phone = phone;
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
}
exports.Person = Person;
