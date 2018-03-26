class Generator {
	constructor(options) {
		this.options = options || {};

		this.defaultSettings({
			width: 256,
			height: 256,
			maxPoints: 8,
			minPoints: 3,
			closeProb: 0.4,
			arcProb: 0.4,
			arcDelta: 30,
			maxShapes: 3,
			minShapes: 1,
			randomPositionProb: 0.35,
			positionRadius: 50,
			maxStrokeWidth: 7,
			minStrokeWidth: 1
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

	getNewPoint(prev) {
		if(prev.length < 2 || this.fulfill(this.options.randomPositionProb)) {
			return [this.randomize(0, this.options.width), this.randomize(0, this.options.height)];
		} else {
			return [
				prev[0] + this.randomize(-this.options.positionRadius, this.options.positionRadius),
				prev[1] + this.randomize(-this.options.positionRadius, this.options.positionRadius)
			];
		}
	}

	getNewDelta(dx, dy) {
		return [this.randomize(-dx, dx), this.randomize(-dy, dy)];
	}

	generatePath() {
		const methods = [];

		let lastPoint = [];
		let maxPoints = 0;
		const shapes = this.randomize(this.options.minShapes, this.options.maxShapes);
		for(let i = 0; i < shapes; i++) {
			lastPoint = this.getNewPoint(lastPoint);
			methods.push(`M ${this.toNotation(lastPoint)}`);

			const points = this.randomize(this.options.minPoints, this.options.maxPoints);
			if(points > maxPoints) maxPoints = points;

			for(let p = 0; p < points; p++) {
				const newPoint = this.getNewPoint(lastPoint);
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

		const pointRangeMax = this.options.maxPoints * this.options.maxShapes;
		const pointRangeMin = this.options.minPoints * this.options.minShapes;
		const pointRange = pointRangeMax - pointRangeMin;

		const strokeRangeMax = this.options.maxStrokeWidth;
		const strokeRangeMin = this.options.minStrokeWidth;
		const strokeRange = strokeRangeMax - strokeRangeMin;

		const strokeWidth = strokeRange - (
			(strokeRange / pointRange)
			* (maxPoints * shapes - pointRangeMin)
		) + strokeRangeMin;

		return {
			methods,
			strokeWidth
		};
	}

	composeSVG({methods, strokeWidth}) {
		return '' +
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.options.width} ${this.options.height}"
	width="${this.options.width}" height="${this.options.height}">

	<path fill="none" stroke="#000" stroke-width="${strokeWidth}" d="${methods.join(' ')}"/>
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
