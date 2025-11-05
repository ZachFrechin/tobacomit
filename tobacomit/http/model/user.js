class User {
    constructor(id, name, email, date, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.date = date;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static fromJson(json) {
        return new User(json.id, json.name, json.email, json.date, json.createdAt, json.updatedAt);
    }

    toJson() {
        return { id: this.id, name: this.name, email: this.email, date: this.date, createdAt: this.createdAt, updatedAt: this.updatedAt };
    }
}

module.exports = { User };