const { User } = require('../model/user');
const bcrypt = require('bcrypt');
const { Response } = require('../../config/response');

class UserRepository {
    constructor(dbPool) {
        this.dbPool = dbPool;
    }

    async create(name, password) {
        const connection = await this.dbPool.getConnection();
        try {
            const foundUser = await this.findByName(name);
            if (foundUser) {
                return new Response(400, 'User already exists: ' + name, null);
            }
            const hashedPassword = this.getHashedPassword(password);
            const [result] = await connection.query('INSERT INTO users (name, password) VALUES (?, ?)', [name, hashedPassword]);
            return new Response(201, 'User created successfully: ' + name, await this.findById(result.insertId));
        } catch (error) {
            return new Response(500, 'Failed to create user: ' + error.message, null);
        }finally {
            connection.release();
        }
    }

    async update(id, name, date) {
        const connection = await this.dbPool.getConnection();
        try {
            await connection.query('UPDATE users SET name = ?, date = ? WHERE id = ?', [name, date, id]);
            return new Response(200, 'User updated successfully: ' + name, await this.findById(id));
        } catch (error) {
            return new Response(500, 'Failed to update user: ' + error.message, null);
        } finally {
            connection.release();
        }
    }

    parseDate(dateString) {
        if (!dateString) return null;
        
        if (dateString instanceof Date) {
            return dateString;
        }
        
        const dateStr = String(dateString).trim();
        
        console.log('Repository parsing date string:', dateStr);
        
        const ddMMyyyyMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+\d{2}:\d{2}:\d{2})?$/);
        if (ddMMyyyyMatch) {
            const [, day, month, year] = ddMMyyyyMatch;
            console.log('Repository matched DD-MM-YYYY format:', day, month, year);
            const date = new Date(Date.UTC(year, month - 1, day));
            console.log('Repository created date:', date.toISOString());
            return date;
        }
        
        const yyyyMMddMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+\d{2}:\d{2}:\d{2})?$/);
        if (yyyyMMddMatch) {
            const [, year, month, day] = yyyyMMddMatch;
            console.log('Repository matched YYYY-MM-DD format:', year, month, day);
            const date = new Date(Date.UTC(year, month - 1, day));
            console.log('Repository created date:', date.toISOString());
            return date;
        }
        
        if (dateStr.includes('T') || dateStr.includes('Z')) {
            return new Date(dateStr);
        }
        
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) {
            throw new Error(`Invalid date format: ${dateString}`);
        }
        console.log('Repository parsed with standard Date():', parsed.toISOString());
        return parsed;
    }

    async updateDate(id, date) {
        const connection = await this.dbPool.getConnection();
        try {
            const parsedDate = this.parseDate(date);
            if (!parsedDate) {
                throw new Error('Invalid date format');
            }
            
            await connection.query('UPDATE users SET date = ? WHERE id = ?', [parsedDate, id]);
            return new Response(200, 'Date updated successfully: ' + parsedDate.toISOString(), await this.findById(id));
        } catch (error) {
            return new Response(500, 'Failed to update date: ' + error.message, null);
        } finally {
            connection.release();
        }
    }

    async findById(id) {
        const connection = await this.dbPool.getConnection();
        try {
            const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
            if (!rows || rows.length === 0) return null;
            return User.fromJson(rows[0]);
        } finally {
            connection.release();
        }
    }

    async findByName(name) {
        const connection = await this.dbPool.getConnection();
        try {
            const [rows] = await connection.query('SELECT * FROM users WHERE name = ?', [name]);
            if (!rows || rows.length === 0) return null;
            return User.fromJson(rows[0]);
        } finally {
            connection.release();
        }
    }

    async verifyPassword(name, password) {
        const connection = await this.dbPool.getConnection();
        try {
            const [rows] = await connection.query('SELECT password FROM users WHERE name = ?', [name]);
            if (!rows || rows.length === 0) return false;
            return bcrypt.compareSync(password, rows[0].password);
        } finally {
            connection.release();
        }
    }

    getHashedPassword(password) {
        return bcrypt.hashSync(password, 10);
    }
}

module.exports = { UserRepository };