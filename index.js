import {H5Lock} from './H5Lock.js';

var canvas = document.getElementById('can');
var gestureparent = document.getElementById('gestureparent').getBoundingClientRect();
canvas.setAttribute('width',1000);
canvas.setAttribute('height',1000);

var aa = new H5Lock({
	elem:canvas
});
