import _ from 'lodash';
import Promise from 'bluebird';
import permissions from './permissions';
import slackTools from './slack';
import config from '../config.json';
import {
    find as findPlugins
}
from './utils/plugins';

var plugins = [];

findPlugins().forEach(plugin => {
    plugins.push(require('./plugins/' + plugin));
});


const getUserlevel = user => {
    if ((permissions.superadmins.indexOf(user) > -1))
        return 'superadmin';
    else if ((permissions.admins.indexOf(user) > -1))
        return 'admin';
    else
        return 'user';
};

module.exports = {
    parse(user, channel, text, ts) {
        return new Promise((resolve, reject) => {
            let username = user.name.toString().toLowerCase();
            let userLevel = getUserlevel(username);

            // If user is muted and is not an admin
            if (permissions.muted.indexOf(username) > -1 && userLevel != 'superadmin') {
                slackTools.deleteMessage(channel.id, ts);
                return resolve(false);
            }

            if (text.charAt(0) !== config.prefix)
                return resolve(false);

            console.log("IN", user.name + ':', text);
            // If user is ignored and is not an admin (or if the user is the bot itself)
            if (((permissions.allIgnored.indexOf(username) > -1) && userLevel != 'superadmin') || user.name.toString().toLowerCase() === config.botname)
                return resolve(false);

            let command = text.substr(1).split(' ')[0].toLowerCase();
            let context = (text.indexOf(' ') >= 0) ? text.substr(1).split(' ').splice(1).join(' ') : undefined;

            let cmdLevel = false;
            let call = false;
            let plugin = _.find(plugins, plugin => {
                return _.find(plugin.commands, cmd => {
                    if (cmd.alias.indexOf(command) > -1) {
                        if (cmd.userLevel)
                            cmdLevel = cmd.userLevel;

                        call = cmd.command;
                        return true;
                    } else
                        return false;
                });
            });

            if (!plugin) {
                console.log('Command not found');
                return; //reject('Command not found');
            }

            // If userLevel required and you don't match the required level or if you're an admin trying to pull shit on a superadmin
            if (cmdLevel && (cmdLevel.indexOf(userLevel) === -1 || (userLevel === 'admin' && (context && getUserlevel(context.split(' ')[0]) === 'superadmin'))))
                return resolve({
                    type: 'channel',
                    message: 'Insufficient Permissions'
                });

            plugin[call](user, channel, context, ts, plugins, userLevel)
                .then(resolve)
                .catch(reject);
        });
    }
};