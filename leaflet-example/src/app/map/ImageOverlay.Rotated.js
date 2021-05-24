/*
 * Based on comments by @runanet and @coomsie 
 * https://github.com/CloudMade/Leaflet/issues/386
 *
 * Wrapping function is needed to preserve L.Marker.update function
 */
(function () {
	var _old__animateZoom = L.ImageOverlay.prototype._animateZoom;
	var _old__reset = L.ImageOverlay.prototype._reset;
	L.ImageOverlay.include({
		_updateImg: function (i, a, s) {
			a = L.point(s).divideBy(2)._subtract(L.point(a));
			var transform = '';
			transform += ' translate(' + -a.x + 'px, ' + -a.y + 'px)';
			transform += ' rotate(' + this.options.angle + 'deg)';
			transform += ' translate(' + a.x + 'px, ' + a.y + 'px)';
			i.style[L.DomUtil.TRANSFORM] += transform;
			i.style[L.DomUtil.TRANSFORM + 'Origin'] = '50% 50%';
		},

		_getShortestEndDegree: function (startDegrees, endDegrees) {
			var turnAngle = Math.abs(endDegrees - startDegrees);
			var turnAnglePositive = (endDegrees - startDegrees) >= 0;
			if (turnAngle <= 180) return endDegrees;
			var result = startDegrees + (360 - turnAngle) * (turnAnglePositive ? -1 : 1);
			return result;
		},

		setAngle: function (angle, imageSize, imageAnchor) {
			// find shortest angle to turn over
			this.options.angle = this._getShortestEndDegree(this.options.angle || 0, angle);
			this.options.imageSize = imageSize;
			this.options.imageAnchor = imageAnchor;

			this._reset();
		},

		_reset: function () {
			_old__reset.apply(this);
			console.log("_reset");
			if (this.options.angle) {
				var image = this._image;
				var s = this.options.imageSize;
				var a = this.options.imageAnchor;
				this._updateImg(image, a, s);
			}
		},

		_animateZoom: function (e) {
			_old__animateZoom.apply(this, [e]);
			console.log("_animateZoom");
			if (this.options.angle) {
				var image = this._image;
				var s = this.options.imageSize;
				var a = this.options.imageAnchor;
				this._updateImg(image, a, s);
			}
		}
	});
}());