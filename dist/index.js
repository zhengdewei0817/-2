/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * Created by zhengdewei on 2016/8/3.
	 * Canvas解锁插件
	 * 思路：合并参数对象
	 *  这里有一个要注意的，就是由于手机端不能直接写xp，所以需要换算成比例
	 *  还是按照设计稿进行设置，一般应该采用Iphone6的样式吧，如果不是  额~~~~ 自己改改
	 *  然后获取 比例*具体设置的值 = 实际的值
	 * 执行init方法
	 *     初始化所有的数据，这时候需要确定一个数组，用来存放当前所有点的中心点
	 * 绘制现有静态图案
	 * 执行事件注册
	 *
	 */

	/**
	 * option参数说明,所有的参数都是设计稿的参数
	 */
	'use strict';

	exports.__esModule = true;
	var configObj = {
	    elem: null, //绘制的canvas对象
	    color: '#666666', //默认的颜色
	    newColor: '#FF0000', //圆环颜色
	    ringWidth: 4, //圆环宽度
	    ringR: 60, //圆环的半径
	    circleR: 20, //圆的半径
	    circleInterval: 60, //圆的间距
	    Gtop: 400, //圆圈左上角作为基点，
	    Gleft: 200, //圆左上角作为基点
	    row: 3, //横排3个
	    ver: 3, //一列4个
	    lineWidth: 4 };

	/**
	 * 合并两个对象 不知道有没有  就瞎写一个
	 * @constructor
	 */
	//线条宽度
	var Objectextends = function Objectextends(oldobj, obj) {
	    if (Object.prototype.toString.call(obj) != '[object Object]') {
	        return false;
	    }
	    for (var a in obj) {
	        oldobj[a] = obj[a];
	    }
	};

	var wid = window.screen.width;
	var _ringR;
	var _lineWidth;
	/**
	 * 获取实际的px
	 */
	var px2px = function px2px(str) {
	    return str / 750 * wid;
	};

	//--------------------------------------------------------------------------------

	function H5Lock(option) {
	    if (!this) {
	        return;
	    }
	    this.option = configObj;
	    this.posArr = []; //存储坐标点的数组
	    this.touchflag = false; //当前是否鼠标点下
	    this.selectPoint = []; //已经选择了的点
	    this.selectLinePoint = []; //已经选择了的线的两端
	    this.surplusPoint = []; //剩余点的数组，用作是否碰到的判断，如果从数组中剔除，则不列入判断范围
	    this.selectId = []; //存储已经选择了的ID编号
	    if (option) {
	        Objectextends(this.option, option);
	    }
	    this.init();
	}

	//----------------------------------------------------------------------------------

	/**
	 * //这个方法是用来处理当前舞台的坐标
	 * 这里采用闭包 避免外界直接访问
	 */
	H5Lock.prototype.setpx2pxoption = function () {
	    _ringR = px2px(this.option.ringR);
	    _lineWidth = px2px(this.option.lineWidth);
	};

	/**
	 * 初始化方法
	 * @returns {Promise}
	 */
	H5Lock.prototype.init = function () {
	    if (!this.option.elem) {
	        console.log('无法找到Canvas对象');
	    }
	    this.ctx = this.option.elem.getContext('2d');
	    //this.ctx.globalCompositeOperation = 'source-atop';

	    this.reset();
	    this.setpx2pxoption();
	    this.AddEvent();
	};

	/**
	 * 恢复出厂设置
	 */
	H5Lock.prototype.reset = function () {
	    this.posArr = []; //存储坐标点的数组
	    this.touchflag = false; //当前是否鼠标点下
	    this.selectPoint = []; //已经选择了的点
	    this.selectLinePoint = []; //已经选择了的线的两端
	    this.surplusPoint = [];
	    this.selectId = [];
	    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	    this.getPosition();
	    for (var i = 0; i < this.posArr.length; i++) {
	        this.DrawOne(this.posArr[i]._x, this.posArr[i]._y, this.option.color);
	    }
	};

	/**
	 * 设置初始化的坐标点数据
	 */
	H5Lock.prototype.getPosition = function () {
	    var allnum = this.option.row * this.option.ver;
	    for (var r = 0; r < allnum; r++) {
	        var X = r % this.option.row;
	        var Y = Math.floor(r / this.option.row);
	        this.posArr.push({
	            _x: px2px(this.option.Gleft + X * (2 * this.option.ringR + this.option.circleInterval)),
	            _y: px2px(this.option.Gtop + Y * (2 * this.option.ringR + this.option.circleInterval)),
	            id: r
	        });
	    }
	    this.surplusPoint = this.surplusPoint.concat([], this.posArr);
	};

	//绘制画布
	H5Lock.prototype.DrawStage = function () {};

	/**
	 * 绘制一整个圆
	 * @param _x
	 * @param _y
	 * @param color
	 * @constructor
	 */
	H5Lock.prototype.DrawOne = function (_x, _y, color) {
	    this.DrawOneRing(_x, _y, color);
	    this.DrawOneCircle(_x, _y, color);
	};

	/**
	 * 绘制一个圆环
	 * @constructor
	 */
	H5Lock.prototype.DrawOneRing = function (_x, _y, color) {
	    var x = _x;
	    var y = _y;
	    var r = px2px(this.option.ringR);
	    this.ctx.strokeStyle = color;
	    this.ctx.fillStyle = '#FFFFFF';
	    this.ctx.lineWidth = px2px(this.option.ringWidth);
	    this.ctx.beginPath();
	    this.ctx.arc(x, y, r, 0, Math.PI * 2, true);
	    this.ctx.closePath();
	    this.ctx.stroke();
	    this.ctx.fill();
	};

	/**
	 * 绘制一个圆心
	 * @param _x
	 * @param _y
	 * @param color
	 * @constructor
	 */
	H5Lock.prototype.DrawOneCircle = function (_x, _y, color) {
	    var x = _x;
	    var y = _y;
	    var r = px2px(this.option.circleR);
	    this.ctx.fillStyle = color;
	    this.ctx.beginPath();
	    this.ctx.arc(x, y, r, 0, Math.PI * 2, true);
	    this.ctx.closePath();
	    this.ctx.fill();
	};

	//绘制三角
	H5Lock.prototype.DrawTriangle = function () {};

	/**
	 * 绘制线条
	 * @constructor
	 */
	H5Lock.prototype.DrawLine = function (po) {
	    this.ctx.beginPath();
	    this.ctx.lineWidth = _lineWidth;
	    for (var i = 0; i < this.selectLinePoint.length; i++) {
	        var locmovepos = this.selectLinePoint[i][0];
	        var loctopos = this.selectLinePoint[i][1] || { _x: po.x, _y: po.y };
	        this.ctx.moveTo(locmovepos._x, locmovepos._y);
	        this.ctx.lineTo(loctopos._x, loctopos._y);
	        this.ctx.stroke();
	        this.ctx.closePath();
	    }
	};

	/**
	 * 获取当前手指的坐标点
	 * @param e
	 * @returns {{x: number, y: number}}
	 */
	H5Lock.prototype.getTouchPosition = function (e) {
	    var cur = e.currentTarget.getBoundingClientRect();
	    var po = {
	        x: e.touches[0].clientX - cur.left,
	        y: e.touches[0].clientY - cur.top
	    };
	    return po;
	};

	H5Lock.prototype.getTouchendPosition = function (e) {
	    var cur = e.currentTarget.getBoundingClientRect();
	    var po = {
	        x: e.changedTouches[0].clientX - cur.left,
	        y: e.changedTouches[0].clientY - cur.top
	    };
	    return po;
	};

	/**
	 * //更新逻辑
	 * 清空整个画布
	 * 然后绘制整个画板
	 * @param po
	 */
	H5Lock.prototype.update = function (po) {
	    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	    this.DrawLine(po);
	    for (var i = 0; i < this.posArr.length; i++) {
	        this.DrawOne(this.posArr[i]._x, this.posArr[i]._y, this.option.color);
	    }

	    for (var j = 0; j < this.selectPoint.length; j++) {
	        this.DrawOne(this.selectPoint[j]._x, this.selectPoint[j]._y, this.option.newColor);
	    }

	    for (var l = 0; l < this.surplusPoint.length; l++) {
	        var pt = this.surplusPoint[l];
	        if (Math.pow(Math.abs(po.x - pt._x), 2) + Math.pow(Math.abs(po.y - pt._y), 2) < Math.pow(_ringR, 2)) {
	            this.selectLinePoint[this.selectLinePoint.length - 1][1] = pt;
	            this.selectLinePoint.push([pt]);
	            this.selectPoint.push(pt);
	            this.surplusPoint.splice(l, 1);
	            this.selectId.push(pt.id);
	            //return false;
	            break;
	        }
	    }
	};

	/**
	 * 注册事件监听
	 * 这里有一些稍微复杂的地方
	 * 点击后，获取到当前的坐标点，
	 * 通过当前的坐标点与现有坐标数组的坐标点对比，得到当前的坐标点，然后绘制当前的圆跟圆环
	 *
	 * @constructor
	 */
	H5Lock.prototype.AddEvent = function () {
	    var _this = this;

	    this.option.elem.addEventListener('touchstart', function (e) {
	        e.preventDefault();
	        var po = _this.getTouchPosition(e);
	        for (var i = 0; i < _this.posArr.length; i++) {
	            if (Math.pow(Math.abs(po.x - _this.posArr[i]._x), 2) + Math.pow(Math.abs(po.y - _this.posArr[i]._y), 2) < Math.pow(_ringR, 2)) {
	                _this.DrawOne(_this.posArr[i]._x, _this.posArr[i]._y, _this.option.newColor);
	                _this.touchflag = true;
	                _this.selectPoint.push(_this.posArr[i]);
	                _this.selectLinePoint.push([_this.posArr[i]]);
	                _this.surplusPoint.splice(i, 1);
	                _this.selectId.push(_this.posArr[i].id);
	                return false;
	            }
	        }
	    });

	    this.option.elem.addEventListener('touchmove', function (e) {
	        if (_this.touchflag) {
	            _this.update(_this.getTouchPosition(e));
	        }
	    });

	    this.option.elem.addEventListener('touchend', function (e) {
	        e.preventDefault();
	        //   var po = this.getTouchPosition(e);
	        if (_this.touchflag) {
	            _this.touchflag = false;
	            if (_this.selectLinePoint[_this.selectLinePoint.length - 1].length < 2) {
	                _this.selectLinePoint.splice(_this.selectLinePoint.length - 1, 1);
	            }
	            _this.update(_this.getTouchendPosition(e));
	            console.log(_this.selectId);
	        }
	    });
	};

	exports['default'] = H5Lock;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _H5LockJs = __webpack_require__(1);

	var canvas = document.getElementById('can');
	var gestureparent = document.getElementById('gestureparent').getBoundingClientRect();
	canvas.setAttribute('width', 1000);
	canvas.setAttribute('height', 1000);

	var aa = new _H5LockJs({
		elem: canvas
	});

/***/ }
/******/ ]);