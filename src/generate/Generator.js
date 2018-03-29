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

	clamp(point) {
		point[0] = Math.min(this.options.width, Math.max(0, point[0]));
		point[1] = Math.min(this.options.width, Math.max(0, point[1]));

		return point;
	}

	toNotation(point) {
		return point.join(' ');
	}

	toAbsolute(point, position) {
		return [point[0] + position[0], point[1] + position[1]];
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
			methods.push(['M', lastPoint]);

			const points = this.randomize(this.options.minPoints, this.options.maxPoints);
			if(points > maxPoints) maxPoints = points;

			for(let p = 0; p < points; p++) {
				const newPoint = this.clamp(this.getNewPoint(lastPoint));

				if(this.fulfill(this.options.arcProb)) {
					const p1 = this.clamp(this.toAbsolute(
						this.getNewDelta(this.options.arcDelta, this.options.arcDelta), lastPoint
					));

					const p2 = this.clamp(this.toAbsolute(
						this.getNewDelta(this.options.arcDelta, this.options.arcDelta), lastPoint
					));

					methods.push(['C', p1, p2, newPoint]);
				} else {
					methods.push(['L', newPoint]);
				}

				lastPoint = newPoint;
			}

			if(this.fulfill(this.closeProb)) {
				methods.push(['Z']);
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

	composeMethod(method) {
		return `${method[0]} ${method.slice(1).map(v => this.toNotation(v)).join(' ')}`;
	}

	composeSVG({methods, strokeWidth}) {
		const composedMethod = methods.map(v => this.composeMethod(v)).join(' ');

		return '' +
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.options.width} ${this.options.height}"
	width="${this.options.width}" height="${this.options.height}">

	<path fill="none" stroke="#000" stroke-width="${strokeWidth}" d="${composedMethod}"/>
</svg>`;

	}

	composeMatrix({methods}) {
		const methodName = {
			'M': [1., 0., 0., 0.],
			'L': [0., 1., 0., 0.],
			'C': [0., 0., 1., 0.],
			'Z': [0., 0., 0., 1.]
		};

		return methods.map(method => {
			const matrix = [
				methodName[method[0]]
			];

			for(let i = 1; i < 4; i++) {
				if(method[i]) {
					matrix.push([
						method[i][0] / this.options.width,
						method[i][1] / this.options.width,
						.0,
						.0
					]);
					continue;
				}

				matrix.push([.0, .0, .0, .0]);
			}

			return matrix;
		});
	}

	generate(counts) {
		const list = [];

		for(let i = 0; i < counts; i++) {
			const path = this.generatePath();

			list.push({
				svg: this.composeSVG(path),
				matrix: this.composeMatrix(path)
			});
		}

		return list;
	}
}

module.exports = Generator;
