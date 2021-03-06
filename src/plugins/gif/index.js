import Promise from 'bluebird';
import Giphy from 'giphy'

const giphy = new Giphy('dc6zaTOxFJmzC');

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
    commands: [{
        alias: ['gif'],
        command: 'gif'
    }],
    help: [{
        command: ['gif'],
        usage: 'gif <query>'
    }],
    gif(user, channel, input = false) {
        return new Promise((resolve, reject) => {
            if (!input)
                return resolve({
                    type: 'dm',
                    message: 'Usage: gif <query> - Returns the first returned result for query'
                });
            giphy.search({
                q: input.replace(' ', '+'),
                limit: 4,
                rating: 'r',
                fmt: 'json'
            }, (err, res) => {
                if (res.pagination.count > 0) {
                    return resolve({
                        type: 'channel',
                        message: res.data[Math.floor(Math.random() * res.pagination.count)].images.downsized_medium.url
                    });
                } else
                    resolve({
                        type: 'channel',
                        message: 'No Gifs Found :('
                    });
            });
        });
    }
};