class Generator {
	constructor(options) {
		this.options = options || {};

		this.defaultSettings({
			width: 128,
			height: 128,
			maxPoints: 10,
			minPoints: 3,
			closeProb: 0.4,
			arcProb: 0.3,
			arcDelta: 30,
			maxShapes: 3,
			minShapes: 1,
			maxStrokeWidth: 30,
			minStrokeWidth: 10
		});
	}

	defaultSettings(options) {
		Object.keys(options).forEach(k => {
			if(this.options[k] === undefined) this.options[k] = options[k]
		});
	}

	randomize(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	fulfill(prob) {
		return Math.random() < prob;
	}

	toNotation(point) {
		return point.join(' ');
	}

	getNewPoint() {
		return [this.randomize(0, this.options.width), this.randomize(0, this.options.height)];
	}

	getNewDelta(dx, dy) {
		return [this.randomize(-dx, dx), this.randomize(-dy, dy)];
	}

	generatePath() {
		const methods = [];

		let lastPoint = [];
		const shapes = this.randomize(this.options.minShapes, this.options.maxShapes);
		for(let i = 0; i < shapes; i++) {
			lastPoint = this.getNewPoint();
			methods.push(`M ${this.toNotation(lastPoint)}`);

			const points = this.randomize(this.options.minPoints, this.options.maxPoints);
			for(let p = 0; p < points; p++) {
				const newPoint = this.getNewPoint();
				const delta = [newPoint[0] - lastPoint[0], newPoint[1] - lastPoint[1]];

				if(this.fulfill(this.options.arcProb)) {
					const p1 = this.getNewDelta(this.options.arcDelta, this.options.arcDelta);
					const p2 = this.getNewDelta(this.options.arcDelta, this.options.arcDelta);

					methods.push(`c ${this.toNotation(p1)}, ${this.toNotation(p2)}, ${this.toNotation(delta)}`);
				} else {
					methods.push(`l ${this.toNotation(delta)}`);
				}

				lastPoint = newPoint;
			}

			if(this.fulfill(this.closeProb)) {
				methods.push('Z');
			}
		}

		return methods;
	}

	composeSVG(methods) {
		return '' +
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.options.width} ${this.options.height}"
	width="${this.options.width}" height="${this.options.height}">

	<path fill="none" stroke="#000" d="${methods.join(' ')}"/>
</svg>`;

	}

	generate(counts) {
		const svgList = [];

		for(let i = 0; i < counts; i++) {
			svgList.push(this.composeSVG(this.generatePath()));
		}

		return svgList;
	}
}

module.exports = Generator;
