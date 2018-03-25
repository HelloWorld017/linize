const childProcess = require('child_process');
const path = require('path');

module.exports = (setName) => new Promise((resolve, reject) => {
	const im = childProcess.spawn('magick', [
		'mogrify',
		'-resize', '256x256',
		'-background', 'transparent',
		'-gravity', 'center',
		'-extent', '256x256',
		'-format', 'png',
		'-path', `../${setName}_x`,
		`*.svg`
	], {
		cwd: path.join("./results", "dataset", `${setName}_y`)
	});

	let stdout = [];
	let stderr = [];

	im.stdout.on('data', c => stdout.push(c));
	im.stderr.on('data', e => stderr.push(e));

	im.on('exit', (code) => {
		stdout = stdout.join('');
		stderr = stderr.join('');

		if(code > 0) {
			const codeError = new Error(`ImageMagick returned error code ${code}!`);
			codeError.stdout = stdout;
			codeError.stderr = stderr;

			reject(codeError);
		}

		resolve({stdout, stderr});
	});
});
