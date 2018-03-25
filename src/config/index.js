const chalk = require('chalk');
const deepExtend = require('deep-extend');
const FileSystem = require('../common/FileSystem');

const configPath = './linize.config.json';
const defaultConfig = {
	generate: {
		train: 5000,
		test: 200
	}
};

module.exports = async () => {
	const configExists = await FileSystem.exists(configPath);

	if(!configExists){
		console.log(chalk.cyan("Generated Default Configuration File."));

		await FileSystem.write(configPath, JSON.stringify(defaultConfig, null, '\t'));
	}

	const userConfig = JSON.parse(await FileSystem.read(configPath));

	return deepExtend(defaultConfig, userConfig);
};
