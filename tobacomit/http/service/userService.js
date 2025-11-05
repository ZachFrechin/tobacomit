const { Response } = require('../../config/response');

class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async register(name, password) {
        try {
            const response = await this.userRepository.create(name, password);
            return response;
        } catch (error) {
            return new Response(500, 'Failed to register user: ' + error.message, null);
        }

    }

    async login(name, password) {
        try {
            const user = await this.userRepository.findByName(name);
            if (!user) {
                return new Response(404, 'User not found: ' + name, null);
            }
            
            const passwordCheck = await this.userRepository.verifyPassword(name, password);
            if (!passwordCheck) {
                return new Response(401, 'Invalid password for user: ' + name, null);
            }
            
            return new Response(200, 'Login successful: ' + name, user);
        } catch (error) {
            return new Response(500, 'Failed to login user: ' + error.message, null);
        }
    }

    async changeDate(id, date) {
        try {
            const response = await this.userRepository.updateDate(id, date);
            return response;
        } catch (error) {
            return new Response(500, 'Failed to change date: ' + error.message, null);
        }
    }

    async getDays(date) {
        const parsedDate = await this.parseDate(date);
        if (!parsedDate) {
            return new Response(400, 'Invalid date format', null);
        }
        const days = Math.floor((new Date() - parsedDate) / (1000 * 60 * 60 * 24));
        return days;
    }

    async parseDate(dateString) {
        if (!dateString) return null;
        if (dateString instanceof Date) {
            return dateString;
        }
        
        const dateStr = String(dateString).trim();
        
        console.log('Parsing date string:', dateStr);
        const ddMMyyyyMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+\d{2}:\d{2}:\d{2})?$/);
        if (ddMMyyyyMatch) {
            const [, day, month, year] = ddMMyyyyMatch;
            console.log('Matched DD-MM-YYYY format:', day, month, year);
            const date = new Date(Date.UTC(year, month - 1, day));
            console.log('Created date:', date.toISOString());
            return date;
        }
        
        const yyyyMMddMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+\d{2}:\d{2}:\d{2})?$/);
        if (yyyyMMddMatch) {
            const [, year, month, day] = yyyyMMddMatch;
            console.log('Matched YYYY-MM-DD format:', year, month, day);
            const date = new Date(Date.UTC(year, month - 1, day));
            console.log('Created date:', date.toISOString());
            return date;
        }
        
        if (dateStr.includes('T') || dateStr.includes('Z')) {
            return new Date(dateStr);
        }
        
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) {
            throw new Error(`Invalid date format: ${dateString}`);
        }
        console.log('Parsed with standard Date():', parsed.toISOString());
        return parsed;
    }

    async getMoney(date) {
        const days = await this.getDays(date);
        return days * 7.7;
    }

    async getGoudron(date) {
        const days = await this.getDays(date);
        return days * 10 * 0.01;
    }

    async getCigarettes(date) {
        const days = await this.getDays(date);
        return days * 10;
    }

    async getPaquets(date) {
        const days = await this.getDays(date);
        return days * 10 / 20;
    }
}

module.exports = { UserService };