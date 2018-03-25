const fs = require('fs');
const mkdirp = require('mkdirp');
const {promisify} = require('util');

module.exports = {
	mkdirs: (path) => promisify(mkdirp)(path),
	write: (file, data) => promisify(fs.writeFile)(file, data),
	writeStream: (file, data) => new Promise((resolve, reject) => {
		data.pipe(fs.createWriteStream(file));
		data.on('end', resolve);
		data.on('error', reject);
	}),
	read: (file) => promisify(fs.readFile)(file, 'utf8'),
	exists: (path) => new Promise(resolve => {
		promisify(fs.access)(path)
			.then(res => resolve(true))
			.catch(e => resolve(false));
	})
};
