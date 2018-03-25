const program = require('commander');
const config = require('./config/command');
const generate = require('./generate/command');

program
	.version('1.0.0');

program
	.command('generate')
	.description("Generate datasets")
	.action(generate);

program
	.command('config')
	.description("Create default configuration file")
	.action(config);

program
	.parse(process.argv);
