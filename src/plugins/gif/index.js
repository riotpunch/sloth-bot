import Promise from 'bluebird';
import Giphy from 'giphy'

const giphy = new Giphy('dc6zaTOxFJmzC');

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    commands: [{
        alias: ['gif'],
        command: 'gif'
    }],
    help: [{
        command: ['gif'],
        usage: 'gif <search>'
    }],
    gif(user, channel, input = false) {
        return new Promise((resolve, reject) => {
            if (input)
                giphy.search({
                    q: input.replace(' ', '+'),
                    limit: 1,
                    rating: 'r',
                    fmt: 'json'
                }, (err, res) => {
                    if (res.pagination.count > 0) {
                        return resolve({
                            type: 'channel',
                            message: res.data[0] ? res.data[0].images.original.url : 'Error selecting a gif'
                        });
                    } else
                        resolve({
                            type: 'channel',
                            message: 'No Gifs Found :('
                        });
                });
            else
                return resolve({
                    type: 'channel',
                    message: 'Please enter a search'
                });
        });
    }
};