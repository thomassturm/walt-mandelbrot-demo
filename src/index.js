// ############################################################
// Walt Mandelbrot Test
// by Thomas Sturm - thomas@sturm.to - storiesinflight.com
// ############################################################

import makeMandel from './walt/mandel.walt'

window.onload = function() {
	const width = document.documentElement.clientWidth;
	const height = document.body.clientHeight;

	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');
	ctx.scale(1, 1);
	canvas.setAttribute('width', width+'px');
	canvas.setAttribute('height', height+'px');
	var canvasData = ctx.createImageData(width, height);
	var newData = canvasData.data;


	// allow the Walt code to log to console
	const log = (val) => {
		console.log('WALT: ' + val);
	};


	// helper methods for Walt to determine canvas size
	const getCanvasWidth = () => width;
	const getCanvasHeight = () => height;

	
	// globals for the pixel renderer
	let rasterCount = 0;
	let pixelCount = 0;


	// called from the walt code to set the next num pixels to the color r
	const setRasterPixel = (r, num) => {
		for (var x=0; x<num; x++) {
			newData[(rasterCount * width * 4) + (pixelCount * 4)] = r;
			newData[(rasterCount * width * 4) + (pixelCount * 4) + 1] = 0;
			newData[(rasterCount * width * 4) + (pixelCount * 4) + 2] = 0;
			newData[(rasterCount * width * 4) + (pixelCount * 4) + 3] = 255;
			pixelCount++;
		}
		if (pixelCount === width) {							// check if we have received a full raster line
			pixelCount = 0;
			rasterCount++;
			if (rasterCount === height) {					// check if we have received all raster lines for a full canvas
				ctx.putImageData(canvasData, 0, 0);			// write new canvas
				rasterCount = 0;
			}
		}
	};


	// method calls to publish to the walt code
	const env = {
		getCanvasWidth,
		getCanvasHeight,
		setRasterPixel,
		log
	};


	// globals for the main loop
	let xminOffset = 0;
	let xmaxOffset = 0;
	let yminOffset = 0;
	let ymaxOffset = 0;
	let stopped = false;


	// main loop - call Walt code to request a full new Mandelbrot set and iterate bounding box to slowly zoom in
	makeMandel( {env} ).then(wasmModule => {
		function step() {
			if (!stopped) {
				wasmModule.instance.exports.createMandelbrot(xminOffset, xmaxOffset, yminOffset, ymaxOffset);
				xminOffset += .01;
				xmaxOffset -= .015;
				yminOffset += .013;
				ymaxOffset -= .005;
				window.requestAnimationFrame(step);
			}
		}
		window.requestAnimationFrame(step);
	});


	// watchdog timer - stops the main loop after a number of seconds
	var _t = setTimeout(function() {
		stopped = true;
	}, 10*1000);
}




