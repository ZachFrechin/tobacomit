const winston = require('winston');

function getLogger(fileName) {
    const fs = require('fs');
    if (fs.existsSync(`${__dirname}/../logs/${fileName}`)) {
        return winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: `${__dirname}/../logs/${fileName}` })
            ],
        });
    } else {
        fs.writeFileSync(`${__dirname}/../logs/${fileName}`, '');
        return winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: `${__dirname}/../logs/${fileName}` })
            ],
        });
    }
}

module.exports = { getLogger };
