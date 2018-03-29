const chalk = require('chalk');
const cliProgress = require('cli-progress');
const path = require('path');

const getConfig = require('../config');
const FileSystem = require('../common/FileSystem');
const Generator = require('./Generator');
const renderSvg = require('./render');

const basePath = path.resolve('./results', 'dataset');

const generate = async (setName, config) => {
	const svgGenerator = new Generator;
	const generated = svgGenerator.generate(config.generate[setName]);

	console.log(chalk.cyan(`Generating ${setName} datasets...`));

	const bar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
	bar.start(config.generate[setName], 0);

	const targetDirX = path.join(basePath, `${setName}_x`);
	const targetDirY = path.join(basePath, `${setName}_y`);

	await FileSystem.mkdirs(targetDirX);
	await FileSystem.mkdirs(targetDirY);

	for(let i in generated) {
		await FileSystem.write(path.join(targetDirY, `${i}.svg`), generated[i].svg);
		await FileSystem.write(path.join(targetDirY, `${i}.json`), JSON.stringify(generated[i].matrix));

		bar.update(i);
	}

	bar.stop();

	console.log(chalk.cyan(`Rendering ${setName} datasets...`));
	try {
		await renderSvg(setName);
	} catch(err) {
		console.log(err);
		console.log(err.stdout, err.stdout);
	}
};

module.exports = async () => {
	const config = await getConfig();
	for(let key of Object.keys(config.generate)) {
		await generate(key, config);
	}
};
