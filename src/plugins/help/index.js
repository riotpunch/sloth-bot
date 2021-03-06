import Promise from 'bluebird';
const config = require('../../../config.json');

module.exports = {
    commands: [{
        alias: ['help', 'h'],
        command: 'default'
    }],
    help: [{
        command: ['help', 'h'],
        usage: 'shows help for commands'
    }],
    default (user, channel, context, ts, plugins) {
        return new Promise(resolve => {
            let commands = [];

            plugins.forEach(plugin => {
                if (plugin.help && Array.isArray(plugin.help)) {
                    plugin.help.forEach(help => {
                        if (!help.command || !help.usage)
                            return;
                    
                        let cmdalias = '';
                        help.command.forEach(cmd => {
                            cmdalias += config.prefix + cmd + ' ';
                        });
                        commands.push(cmdalias + '| ' + help.usage);
                    });
                }
            });

            resolve({
                type: 'dm',
                messages: commands
            });
        });
    }
};