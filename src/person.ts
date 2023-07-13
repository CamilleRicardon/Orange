export class Person {
    private nom: string;
    private prenom: string;
    private mail: string;
    private phone: string;

    constructor(nom: string, prenom: string, mail: string, phone: string) {
        this.nom = nom;
        this.prenom = prenom;
        this.mail = mail;
        this.phone = phone;
    }

    public getNom(): string {
        return this.nom;
    }
    public setNom(nom: string): void {
        this.nom = nom;
    }
    public getPrenom(): string {
        return this.prenom;
    }
    public setPrenom(prenom: string): void {
        this.prenom = prenom;
    }
    public getMail(): string {
        return this.mail;
    }
    public setMail(mail: string): void {
        this.mail = mail;
    }
    public getPhone(): string {
        return this.phone;
    }
    public setPhone(phone: string): void {
        this.phone = phone;
    }
    
}