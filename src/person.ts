export function generateUniqueId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${timestamp}-${random}`;
  }

export class Person {
    private nom: string;
    private prenom: string;
    private mail: string;
    private phone: string;
    public id: string;
    constructor(
        nom: string,
        prenom: string,
        mail: string,
        phone: string,
        id?: string
        ) {
        this.nom = nom;
        this.prenom = prenom;
        this.mail = mail;
        this.phone = phone;
        this.id = generateUniqueId();
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
    public getId(): string {
        return this.id;
    }
    
}