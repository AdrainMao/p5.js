/**
 * Provides methods to draw 2d primitives.
 * @for p5
 */
define(function(require) {

  'use strict';

  var p5 = require('core');
  var canvas = require('canvas');
  var constants = require('constants');

  /**
   * Draw an arc.
   *
   * If a,b,c,d,start and stop are the only params provided, draws an
   * open pie.
   * If mode is provided draws the arc either open, chord or pie, dependant
   * on the variable provided.
   * 
   * @method arc
   * @param  {Number} a X-coordinate of the arc's ellipse
   * @param  {Number} b Y-coordinate of the arc's ellipse
   * @param  {Number} c Width of the arc's ellipse by default
   * @param  {Number} d Height of the arc's ellipse by default
   * @param  {Number} start Angle to start the arc, specified in radians
   * @param  {Number} stop Angle to stop the arc, specified in radians
   * @param  {Mode} [mode] Optional parameter to determine the way of drawing the arc
   * @return {p5} Returns the p5 object.
   */
  p5.prototype.arc = function(a, b, c, d, start, stop, mode) {
    var vals = canvas.arcModeAdjust(a, b, c, d, this.settings.ellipseMode);
    var radius = (vals.h > vals.w) ? vals.h / 2 : vals.w / 2,
            xScale = (vals.h > vals.w) ? vals.w / vals.h : 1, //scale the arc if it is oblong
            yScale = (vals.h > vals.w) ? 1 : vals.h / vals.w;
    this.curElement.context.scale(xScale, yScale);
    this.curElement.context.beginPath();
    this.curElement.context.arc(vals.x, vals.y, radius, start, stop);
    this.curElement.context.stroke();
    if (mode === constants.CHORD || mode === constants.OPEN) {
      this.curElement.context.closePath();
    } else if (mode === constants.PIE || mode === undefined) {
      this.curElement.context.lineTo(vals.x, vals.y);
      this.curElement.context.closePath();
    }
    this.curElement.context.fill();
    if (mode !== constants.OPEN && mode !== undefined) { // final stroke must be after fill so the fill does not cover part of the line
      this.curElement.context.stroke();
    }
    
    return this;
  };

  /**
   * Draws an ellipse (oval) to the screen. An ellipse with equal width and height is a circle. By default, the first two parameters set the location, and the third and fourth parameters set the shape's width and height. The origin may be changed with the ellipseMode() function. 
   * 
   * @method ellipse
   * @param {Number} a X-coordinate of the ellipse.
   * @param {Number} b Y-coordinate of the ellipse.
   * @param {Number} c Width of the ellipse.
   * @param {Number} d Height of the ellipse.
   * @return {p5} Returns the p5 object.
   */
  p5.prototype.ellipse = function(a, b, c, d) {
    var vals = canvas.modeAdjust(a, b, c, d, this.settings.ellipseMode);
    var kappa = 0.5522848,
            ox = (vals.w / 2) * kappa, // control point offset horizontal
            oy = (vals.h / 2) * kappa, // control point offset vertical
            xe = vals.x + vals.w, // x-end
            ye = vals.y + vals.h, // y-end
            xm = vals.x + vals.w / 2, // x-middle
            ym = vals.y + vals.h / 2;  // y-middle
    this.curElement.context.beginPath();
    this.curElement.context.moveTo(vals.x, ym);
    this.curElement.context.bezierCurveTo(vals.x, ym - oy, xm - ox, vals.y, xm, vals.y);
    this.curElement.context.bezierCurveTo(xm + ox, vals.y, xe, ym - oy, xe, ym);
    this.curElement.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.curElement.context.bezierCurveTo(xm - ox, ye, vals.x, ym + oy, vals.x, ym);
    this.curElement.context.closePath();
    this.curElement.context.fill();
    this.curElement.context.stroke();

    return this;
  };

  /**
   * Draws a line (a direct path between two points) to the screen. The version of line() with four parameters draws the line in 2D. To color a line, use the stroke() function. A line cannot be filled, therefore the fill() function will not affect the color of a line. 2D lines are drawn with a width of one pixel by default, but this can be changed with the strokeWeight() function. The version with six parameters allows the line to be placed anywhere within XYZ space. Drawing this shape in 3D with the z parameter requires the P3D parameter in combination with size() as shown in the above example. 
   * 
   * @method line
   * @param {Number} x1 
   * @param {Number} y1 
   * @param {Number} x2 
   * @param {Number} y2 
   * @return {p5} Returns the p5 object.
   */
  p5.prototype.line = function(x1, y1, x2, y2) {
    if (this.curElement.context.strokeStyle === 'rgba(0,0,0,0)') {
      return;
    }
    this.curElement.context.beginPath();
    this.curElement.context.moveTo(x1, y1);
    this.curElement.context.lineTo(x2, y2);
    this.curElement.context.stroke();

    return this;
  };

  /**
   * Draws a point, a coordinate in space at the dimension of one pixel. The first parameter is the horizontal value for the point, the second value is the vertical value for the point, and the optional third value is the depth value. Drawing this shape in 3D with the z parameter requires the P3D parameter in combination with size() as shown in the above example. 
   * 
   * @param {Number} x
   * @param {Number} y
   * @return {p5} Returns the p5 object.
   */
  p5.prototype.point = function(x, y) {
    var s = this.curElement.context.strokeStyle;
    var f = this.curElement.context.fillStyle;
    if (s === 'rgba(0,0,0,0)') {
      return;
    }
    x = Math.round(x);
    y = Math.round(y);
    this.curElement.context.fillStyle = s;
    if (this.curElement.context.lineWidth > 1) {
      this.curElement.context.beginPath();
      this.curElement.context.arc(x, y, this.curElement.context.lineWidth / 2, 0, constants.TWO_PI, false);
      this.curElement.context.fill();
    } else {
      this.curElement.context.fillRect(x, y, 1, 1);
    }
    this.curElement.context.fillStyle = f;

    return this;
  };

  /**
   * Draw a quad. A quad is a quadrilateral, a four sided polygon. It is similar to a rectangle, but the angles between its edges are not constrained to ninety degrees. The first pair of parameters (x1,y1) sets the first vertex and the subsequent pairs should proceed clockwise or counter-clockwise around the defined shape.
   * 
   * @method quad
   * @param {type} x1
   * @param {type} y1
   * @param {type} x2
   * @param {type} y2
   * @param {type} x3
   * @param {type} y3
   * @param {type} x4
   * @param {type} y4
   * @return {p5} Returns the p5 object.
   */
  p5.prototype.quad = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    this.curElement.context.beginPath();
    this.curElement.context.moveTo(x1, y1);
    this.curElement.context.lineTo(x2, y2);
    this.curElement.context.lineTo(x3, y3);
    this.curElement.context.lineTo(x4, y4);
    this.curElement.context.closePath();
    this.curElement.context.fill();
    this.curElement.context.stroke();

    return this;
  };

  p5.prototype.rect = function(a, b, c, d) {
    var vals = canvas.modeAdjust(a, b, c, d, this.settings.rectMode);
    this.curElement.context.beginPath();
    this.curElement.context.rect(vals.x, vals.y, vals.w, vals.h);
    this.curElement.context.fill();
    this.curElement.context.stroke();

    return this;
  };

  p5.prototype.triangle = function(x1, y1, x2, y2, x3, y3) {
    this.curElement.context.beginPath();
    this.curElement.context.moveTo(x1, y1);
    this.curElement.context.lineTo(x2, y2);
    this.curElement.context.lineTo(x3, y3);
    this.curElement.context.closePath();
    this.curElement.context.fill();
    this.curElement.context.stroke();

    return this;
  };

  return p5;

});
