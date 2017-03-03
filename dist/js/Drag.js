(function (window, undefined) {
	'use strict';

	var document = window.document,
		IS_TOUCH_START = false,
	 	ua = navigator.userAgent.toLowerCase(),
	 	IS_IPAD = ua.match(/ipad/i) == "ipad",
	 	IS_IPHONEOS = ua.match(/iphone os/i) == "iphone os",
	 	IS_MIDP = ua.match(/midp/i) == "midp",
	 	IS_UC7 = ua.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
	 	IS_UC = ua.match(/ucweb/i) == "ucweb",
	 	IS_ANDROID = ua.match(/android/i) == "android",
	 	IS_CE = ua.match(/windows ce/i) == "windows ce",
	 	IS_WM = ua.match(/windows mobile/i) == "windows mobile";

	if (IS_IPAD || IS_IPHONEOS || IS_MIDP || IS_UC7 || IS_UC || IS_ANDROID || IS_CE || IS_WM) {
		IS_TOUCH_START = true;
	}

	var TOUCH_START = IS_TOUCH_START ? 'touchstart' : 'mousedown',
	    TOUCH_MOVE = IS_TOUCH_START ? 'touchmove' : 'mousemove',
	    TOUCH_END = IS_TOUCH_START ? 'touchend' : 'mouseup';

	// 构造函数Dial
	var Drag = function (options) {
	 	this.config = Drag.config;

	 	for(var i in options) {
	 		this.config[i] = options[i];
	 	}

	 	this._init();
	};

	Drag.config = {
		target: null,
		border: null
	}

	Drag.prototype = {
		constructor: Drag,

		handleEvent: function (e) {
			switch(e.type) {
				case TOUCH_START: 
					this._start(e); break;
				case TOUCH_MOVE:
					this._move(e); break;
				case TOUCH_END: 
					this._end(e); break;
			}
		},

		_init: function () {
			var config = this.config,
				el = config.target, 
				border = config.border,
				self = this;

			if(!el) {
				return;
			}

			function saveDom (dom, el) {
				if(typeof dom === "string") {
					dom = document.querySelector(dom);
				}

				if(dom.nodeType === 1) {
					self[el] = dom;
				}
			}

			saveDom(el, "el");

			if(border) {
				saveDom(border, "border");
				border = this.border;
				el = this.el;

				var bcr = border.getBoundingClientRect(),
					ecr = el.getBoundingClientRect(),
					bl = bcr.left,
					bt = bcr.top,
					br = bcr.right,
					bb = bcr.bottom,
					bw = bcr.width || br - bl,
					bh = bcr.height || bb - bt,
					ew = ecr.width || ecr.right - ecr.left,
					eh = ecr.height || ecr.bottom - ecr.top,
					sl = document.documentElement.scrollLeft,
					st = document.documentElement.scrollTop;

				this.borderLeft = bl;
				this.borderTop = bt;
				this.borderRight = br;
				this.borderBottom = bb;
				this.bw = bw;
				this.bh = bh;
				this.ew = ew;
				this.eh = eh;
				this.scrollLeft = sl;
				this.scrollTop = st;
			}

			this._bind(self.el, TOUCH_START);

			if(IS_TOUCH_START) {
				this._bind(this.el, TOUCH_MOVE);
				this._bind(this.el, TOUCH_END);
			}
		},

		_bind: function (el, type, bubble){
			el.addEventListener(type, this, !!bubble);
		},

		_unbind: function (el, type, bubble) {
			el.removeEventListener(type, this, !!bubble);
		},

		_start: function (e) {
			e.preventDefault();
			e.stopPropagation();

			var sx, sy, oL, oT, dx, dy,
				border = this.border,
				el = this.el, bl, bt;

			sx = IS_TOUCH_START ? e.touches[0].pageX : e.clientX,
			sy = IS_TOUCH_START ? e.touches[0].pageY : e.clientY;

			oL = el.offsetLeft;
			oT = el.offsetTop;

			bl = this.borderLeft;
			bt = this.borderTop;

			dx = sx - oL - bl;	
			dy = sy - oT - bt;

			this.startX = sx;
			this.startY = sy;
			this.disX = dx;
			this.disY = dy;

			if(this.config.onTouchStart) {
				this.config.onTouchStart.call(this, this);
			}

			if(!IS_TOUCH_START) {
				this._bind(document, TOUCH_MOVE);
				this._bind(document, TOUCH_END);
			}
		},

		_move: function (e) {
			e.preventDefault();
			e.stopPropagation();

			var config = this.config,
				mx, my, oL, oT,
				dx = this.disX,
				dy = this.disY;

			mx = IS_TOUCH_START ? e.touches[0].pageX : e.clientX;
			my = IS_TOUCH_START ? e.touches[0].pageY : e.clientY;

			oL = mx - dx;
			oT = my - dy;

			this.moveX = mx;
			this.moveY = my;

			this.offsetLeft = oL;
			this.offsetTop = oT;

			var border = this.border;

			console.log(mx, my, dx, dy, oL, oT);

			if(border) {
				var bl, bt, br, bb, ew, eh, sl, st;

				bl = this.borderLeft;
				bt = this.borderTop;
				br = this.borderRight;
				bb = this.borderBottom;
				ew = this.ew;
				eh = this.eh;
				sl = this.scrollLeft;
				st = this.scrollTop;

				if(oL <= bl) {
					oL = 0;
				}

				if(oL >= br - bl - ew) {
					oL = br - bl - ew;
				}

				if(oT <= bt) {
					oT = 0;
				}

				if(oT >= bb - bt - eh) {
					oT = bb - bt - eh;
				}
			}

			this.el.style.left = oL + "px";
			this.el.style.top = oT + "px";

			if(this.config.onTouchMove) {
				this.config.onTouchMove.call(this, this);
			}
		},

		_end: function (e) {
			e.preventDefault();
			e.stopPropagation();

			var config = this.config,
				ex, ey;

			ex = IS_TOUCH_START ? e.changedTouches[0].pageX : e.clientX;
			ey = IS_TOUCH_START ? e.changedTouches[0].pageY : e.clientY;

			this.endX = ex;
			this.endY = ey;

			if(this.config.onTouchEnd) {
				this.config.onTouchEnd.call(this, this);
			}

			if(!IS_TOUCH_START) {
				this._unbind(document, TOUCH_MOVE);
				this._unbind(document, TOUCH_END);
			}
		},

		destory: function () {
			var el = this.el;

			this._unbind(el, TOUCH_START);

			if(!IS_TOUCH_START) {
				el = document;
			}
			
			this._unbind(el, TOUCH_MOVE);
			this._unbind(el, TOUCH_END);
		},

		start: function () {
			this._init();
		}
	}

	window.Drag = Drag;
})(window);