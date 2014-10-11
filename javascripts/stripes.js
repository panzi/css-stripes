$(document).ready(function () {
	$('.colorpicker').colorpicker({
		parts: ['map', 'bar', 'hex', 'hsv', 'rgb', 'alpha', 'lab', 'cmyk', 'preview', 'swatches', 'footer'],
		showOn: 'button',
		buttonColorize: true,
		alpha: true,
		colorFormat: 'RGBA',
		buttonImage: 'images/ui-colorpicker.png',
		buttonImageOnly: true,
		select: updateStripes
	});

	$('#stripes-form input, #stripes-form select').change(updateStripes);
	$('#stripes-form').submit(updateStripes);

	var resizeXOffset = 0;
	var resizeYOffset = 0;
	var resizing = false;
	$('#resizer').mousedown(function (event) {
		var preview = $('#preview')[0];
		var rect = preview.getBoundingClientRect();
		resizing = true;
		resizeXOffset = event.clientX - rect.left - rect.width;
		resizeYOffset = event.clientY - rect.top  - rect.height;
		event.stopPropagation();
		event.preventDefault();
	});

	$(window).mousemove(function (event) {
		if (resizing) {
			var preview = $('#preview')[0];
			var rect = preview.getBoundingClientRect();
			preview.style.width  = Math.max(0, event.clientX - rect.left - resizeXOffset)+'px';
			preview.style.height = Math.max(0, event.clientY - rect.top  - resizeYOffset)+'px';
			event.stopPropagation();
			event.preventDefault();
		}
	}).mouseup(function (event) {
		resizing = false;
	});

	updateStripes();

	function updateStripes () {
		var stroke       = $('#stroke').val();
		var bgcolor      = $('#bg-color').val();
		var stroke_width = +$('#width').val();
		var gap          = +$('#gap').val();
		var angle        = +$('#angle').val();
		var repeat       = $('#repeat').val();
		var alpha        = Math.abs(angle * Math.PI / 180);

		var width, height;

		// so there are no rounding errors for the simple case
		if (angle === 0 || angle === 180) {
			height = stroke_width + gap;
			width  = 1;
		}
		else if (angle === 90 || angle == -90) {
			height = 1;
			width  = stroke_width + gap;
		}
		else {
			height = (stroke_width + gap) / Math.cos(alpha);
			width  = Math.tan(Math.PI / 2 - alpha) * height;
		}

		var diag = Math.sqrt(width * width + height * height);
		var x1, x2;

		if (angle >= 0) {
			x1 = 0;
			x2 = Math.ceil(diag);
		}
		else {
			// could be done better, ask someone who knows math:
			x1 = Math.floor(-diag);
			x2 = Math.ceil(diag);
		}

		var y1 = -gap - stroke_width / 2;
		var y2 = stroke_width / 2;
		var y3 = y2 + gap + stroke_width;

		var svg = '<svg width="'+width+'" height="'+height+'" viewPort="0 0 '+width+' '+height+
		          '" version="1.1" xmlns="http://www.w3.org/2000/svg"><g stroke="'+stroke+
		          '" stroke-width="'+stroke_width+'" stroke-linecap="square" transform="rotate('+angle+')">'+
				  '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y1+'"/>'+
				  '<line x1="'+x1+'" y1="'+y2+'" x2="'+x2+'" y2="'+y2+'"/>'+
				  '<line x1="'+x1+'" y1="'+y3+'" x2="'+x2+'" y2="'+y3+'"/>'+
				  '</g></svg>';
		var url = 'data:image/svg+xml;base64,'+btoa(svg);
		var css = {};

		if (bgcolor !== 'none' && bgcolor !== 'transparent' && bgcolor !== 'rgba(0,0,0,0)') {
			css['background-color'] = bgcolor;
		}

		if (repeat !== 'repeat') {
			css['background-repeat'] = repeat;
		}

		css['background-image'] = 'url('+url+')';

		$('#preview').css({
			backgroundColor: '',
			backgroundRepeat: ''
		}).css(css);

		var buf = ['.stripes {'];
		for (var name in css) {
			buf.push('\t'+name+': '+css[name]+';');
		}
		buf.push('}');

		$('#css').val(buf.join('\n'));
	}
});
