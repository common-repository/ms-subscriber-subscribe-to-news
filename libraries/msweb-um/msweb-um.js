/*
 * @author Mixail Sayapin
 * https://ms-web.ru
 */
(function ($) {
	if (!window.MSweb)
		MSweb = function () {
			this.currTitle_ = document.title;
			this.imgLoader = '<svg style="-webkit-animation: rotate 1s linear infinite; -moz-animation: rotate 1s linear infinite; -o-animation: rotate 1s linear infinite; animation: rotate 1s linear infinite;" width="76" height="76" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#606060"><g fill="none" fill-rule="evenodd"><g transform="translate(1 1)" stroke-width="2"><circle stroke-opacity=".5" cx="18" cy="18" r="18"></circle><path d="M36 18c0-9.94-8.06-18-18-18"></path></g></g></svg>';
			var css = '@-webkit-keyframes rotate { 0%{ -webkit-transform: rotate(0deg); } 100%{ -webkit-transform: rotate(360deg); }} @-moz-keyframes rotate{ 0%{ -moz-transform: rotate(0deg); } 100%{ -moz-transform: rotate(360deg); }}@-o-keyframes rotate{ 0%{ -o-transform: rotate(0deg); } 100%{ -o-transform: rotate(360deg); }}@keyframes rotate{ 0%{-webkit-transform: rotate(0deg);-moz-transform: rotate(0deg);-ms-transform: rotate(0deg);transform: rotate(0deg); } 100%{-webkit-transform: rotate(360deg);-moz-transform: rotate(360deg);-ms-transform: rotate(360deg);transform: rotate(360deg); }}';
			var style = document.createElement('style');
			style.innerText = css;
			var head = document.querySelector('head');
			head.appendChild(style);
		};

	MSweb.prototype.listen = function (optEl, type, selector, callback) {
		if (!optEl)
			optEl = $(document);
		else if (!(optEl instanceof jQuery)) {
			optEl = $(optEl);
		}
		optEl.on(type, selector, callback);
	};

	MSweb.prototype.unlisten = function (optEl, type, selector, callback) {
		if (!optEl)
			optEl = $(document);
		else if (!(optEl instanceof jQuery)) {
			optEl = $(optEl);
		}
		optEl.off(type, selector, callback);
	};

	MSweb.prototype.fire = function (optEl, event) {
		if (!optEl)
			optEl = $(document);
		optEl.trigger(event);
	};

	/**
	 *
	 * @param params
	 */
	MSweb.prototype.showLoader = function (params) {
		var img, bg;
		if (this.loader) {
			img = this.loader.img;
		}

		if (!params)
			params = {};

		var parent = params.parent || false;
		var width = parent ? parent.width() : window.innerWidth;
		var height = parent ? parent.height() : window.innerHeight;
		bg = this.loader ? this.loader.bg : document.createElement('div');
		var z = parent && parent[0] && parent[0].style && parent[0].style.zIndex && parent[0].style.zIndex + 1 || 999995;
		var parentPos = parent ? parent[0].getBoundingClientRect() : false;
		var info = params.info || '';

		$(bg).css({
			'background': params.background || 'rgba(0, 0, 0, 0.21)',
			'position': parent ? 'absolute' : 'fixed',
			'z-index': z,
			'top': parentPos ? parentPos.y + 'px' : 0,
			'left': parentPos ? parentPos.x + 'px' : 0,
			'width': params.width || (parentPos ? parentPos.width + 'px' : width + 'px'),
			'height': params.height || (parentPos ? parentPos.height + 'px' : height + 'px'),
			'display': 'block'
		});

		if (!parent)
			parent = $('body');

		if (!this.loader) {
			parent.append($(bg));
			img = $(this.imgLoader);
			parent.append(img);
		}
		img.css({
			left: parentPos ? width / 2 + parentPos.x - 35 : width / 2 - 30,
			top: parentPos ? height / 2 + parentPos.y - 40 : height / 2 - 30,
			position: parentPos ? 'absolute' : 'fixed',
			'z-index': 1112
		});
		if (!this.loader) {
			this.loader = {
				bg: bg,
				img: img
			};
			this.loader.info = $('<p style="z-index: 999996;display: block;position: relative;text-align: center;width: 100%;top: 80px;">' + info + '</p>')
			parent.append(this.loader.info);
			this.loader.setInfo = function (info) {
				this.loader.info.html(info);
			}.bind(this);
		}
	};

	MSweb.prototype.removeLoader = function () {
		if (this.loader) {
			clearInterval(this.loader.interval);
			for (var i in this.loader)
				if (i != 'interval' && i != 'setInfo')
					this.loader[i].remove();
		}
		this.loader = null;
	};

	MSweb.prototype.stopLoader = function () {
		this.loader && this.loader.img && this.loader.img.remove();
	};

	/**
	 *
	 * @param html - string | dom | $(dom)
	 * @param opt_params:
	 *        size - % от ширины + высоты экрана. Если не указан, то 90%
	 *        padding
	 *        ondispose
	 *
	 */
	MSweb.prototype.createModal = function (html, opt_params) {
		opt_params = opt_params || {};
		var size = opt_params && opt_params.size || 90;
		var parent = $('body');
		var cont = $('<div>', {'class': 'msweb-modal-container', style: 'display: none'});
		var bg = $('<div>', {'class': 'msweb-modal-background', style: 'display: none'});
		var closer = $('<div>X</div>', {style: 'display: none'});
		cont.css({
			position: 'fixed',
			overflow: 'auto',
			background: '#fff',
			'z-index': opt_params.zIndex || opt_params['z-index'] || 1112,
			'border-radius': '5px',
			padding: opt_params.padding !== undefined ? opt_params.padding : '10px'
		});
		bg.css({
			width: '100%',
			height: '100%',
			position: 'fixed',
			top: 0,
			left: 0,
			'background-color': 'rgba(0, 0, 0, 0.43)',
			'z-index': 1111
		});
		closer.css({
			position: 'fixed',
			background: 'red',
			color: '#fff',
			cursor: 'pointer',
			'border-radius': '30px',
			width: '24px',
			height: '24px',
			'padding-left': '6px',
			'font-size': '17px',
			'font-family': 'sans-serif',
			'font-weight': 'bold',
			'z-index': opt_params.zIndex || opt_params['z-index'] || 1113
		});
		this.refreshModalPosition_(cont, bg, closer, size);
		window.addEventListener('resize', this.refreshModalPosition_.bind(this, cont, bg, closer, size));
		cont[0].close = function () {
			this.disposeModal(cont, bg, closer, opt_params.ondispose);
		}.bind(this)
		bg.click(function () {
			cont[0].close();
		});
		closer.click(function () {
			cont[0].close();
		});
		document.addEventListener('keydown', function (ev) {
			if (ev.keyCode == 27)
				cont[0].close();
		}.bind(this));

		parent.append(cont).append(bg).append(closer);
		if (typeof html === 'string')
			cont.html(html);
		else
			cont.append(html);
		if (opt_params.speed == 'fast') {
			cont.show();
			closer.show();
			bg.show();
		}
		else {
			cont.fadeIn();
			closer.fadeIn();
			bg.fadeIn();
		}
		return cont;
	};

	/**
	 * @private
	 */
	MSweb.prototype.refreshModalPosition_ = function (cont, bg, closer, size) {
		size = 100 % size;
		var percW = size ? window.innerWidth / 100 * size : 0;
		var percH = size ? window.innerHeight / 100 * size : 0;
		var height = window.innerHeight - percH;
		var width = window.innerWidth - percW;
		var left = percW / 2;
		var top = percH / 2;
		cont.css({
			width: width + 'px',
			height: height + 'px',
			top: top + 'px',
			left: left + 'px',
		});
		closer.css({
			top: top + 'px',
			right: left + 'px'
		});
	};

	MSweb.prototype.disposeModal = function (cont, bg, closer, callback) {
		cont.fadeOut();
		bg.fadeOut();
		closer.fadeOut();
		setTimeout(function () {
			cont.remove();
			bg.remove();
			closer.remove();
		}, 800);
		if (callback && typeof callback === 'function') {
			callback();
		}
	};

	/**
	 * @param mess
	 * @param opt_type - success | warning | error
	 */
	MSweb.prototype.notify = function (mess, opt_type, time, opt_callback) {
		const div = MSweb.prototype.notify.div || $('<div>');
		MSweb.prototype.notify.div = div;
		let color = 'rgb(201, 247, 191)';
		if (opt_type === 'warning') {
			color = 'rgb(247, 238, 191)';
		}
		if (opt_type === 'error') {
			color = 'rgb(255, 219, 217)';
		}
		const top = window.innerHeight / 10;
		const right = window.innerWidth / 10;
		div.css({
			maxWidth: '90%',
			width: '400px',
			color: '#000',
			fontFamily: 'sans-serif',
			fontSize: '16px',
			position: 'fixed',
			top: top,
			right: right,
			zIndex: 99999
		});
		let cont = $('<div>');
		cont.css({
			backgroundColor: color,
			padding: '10px',
			borderRadius: '5px',
			boxShadow: '2px 2px 7px 0px black',
			margin: '5px 0'
		});
		div.append(cont);
		cont.html(mess);
		$('body').append(div);

		setTimeout(function () {
			cont.fadeOut();
			setTimeout(function () {
				cont.remove();
				if (!div.children().length) {
					div.remove();
				}
			}, 700);
			if (typeof opt_callback === 'function') {
				opt_callback();
			}
		}, time || 3000);
	};

	/**
	 *
	 */
	MSweb.prototype.initTooltips = function (params) {
		if (this.initTooltips.inited)
			return;
		var A = this;
		this.tooltipContainer = $('<div>');
		$('body').append(this.tooltipContainer);
		this.tooltipContainer.css({
			'z-index': 999999,
			'position': 'absolute',
			'display': 'none',
			'top': '0px',
			'left': '0px',
			'background-color': 'rgba(21, 66, 197, 0.83)',
			'padding': '5px 10px 5px 10px',
			'color': 'white',
			'opacity': '0.8',
			'border-radius': '5px',
			'font-size': '12pt',
			'max-width': '250px'
		});
		var work = function (ev) {
			var el = ev.target;
			var elParent = el.parentNode;
			var elPP = elParent && elParent.parentNode;
			var elPPP = elPP && elPP.parentNode;
			var umWidth = el.getAttribute('um-width');
			if (umWidth)
				this.tooltipContainer.css({
					width: umWidth,
					'max-width': ''
				});
			else
				this.tooltipContainer.css({
					width: '',
					'max-width': '250px'
				});
			var tooltip = el.getAttribute && el.getAttribute('um-tooltip') ||
				elParent && elParent.getAttribute && elParent.getAttribute('um-tooltip') ||
				elPP && elPP.getAttribute && elPP.getAttribute('um-tooltip');

			if (tooltip) {
				A.tooltipContainer.html(tooltip);
				var width = A.tooltipContainer.width();
				var left = width / 2 + 5;
				A.tooltipContainer.css({
					"top": ev.clientY + window.scrollY + 20,
					"left": (ev.clientX - left) > 0 ? ev.clientX - left : 0
				})
					.show();
			}
			else if (el != A.tooltipContainer[0] && elPP != A.tooltipContainer[0] && elPPP != A.tooltipContainer[0]) {
				A.tooltipContainer.hide()
					.text("")
					.css({
						"top": 0,
						"left": 0
					});
			}
		}.bind(this);

		document.body.addEventListener('mousemove', work);
		document.body.addEventListener('click', work);
		this.initTooltips.inited = true;
	};

	MSweb.prototype.urlGet = function (param) {
		var url = new URL(window.location.href);
		return url.searchParams.get(param) || undefined;
	};

	/**
	 * Установить параметр(ы) в урл
	 * @param param - string | object {key: value}
	 * @param value
	 */
	MSweb.prototype.urlSet = function (key, value) {
		key = encodeURIComponent(key);
		value = encodeURIComponent(value);
		var kvp = document.location.search.substr(1).split('&');

		for (var i = 0; i < kvp.length; i++) {
			if (kvp[i].startsWith(key + '=')) {
				var pair = kvp[i].split('=');
				pair[1] = value;
				kvp[i] = pair.join('=');
				break;
			}
		}

		if (i >= kvp.length) {
			kvp[kvp.length] = [key, value].join('=');
		}

		// can return this or...
		var params = kvp.join('&');

		var newUrl = window.location.href.replace(window.location.search, '') + '?' + params;
		history.pushState(null, null, newUrl);
	};

	/**
	 * Склонение слов в зависимости от числа
	 * @param n - число
	 * @param text_forms - ['минута', 'минуты', 'минут']
	 * @returns {*}
	 */
	MSweb.prototype.declineByNumber = function (n, text_forms) {
		if (!n) n = 0;
		n = Math.abs(n) % 100;
		var n1 = n % 10;
		if (n > 10 && n < 20) {
			return text_forms[2];
		}
		if (n1 > 1 && n1 < 5) {
			return text_forms[1];
		}
		if (n1 == 1) {
			return text_forms[0];
		}
		return text_forms[2];
	};

	/**
	 * форматирует числа добавляя пробел после каждого 3-го знака
	 * @param n
	 * @returns {string}
	 */
	MSweb.prototype.abc = function (n) {
		return (n + "").replace(/[\s]/g, '').split("").reverse().join("").replace(/(\d{3})/g, "$1 ").split("").reverse().join("").replace(/^ /, "");
	};

	MSweb.prototype.validateEmail = function (email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	};

	/**
	 * Получение случайного целого числа
	 * @param min
	 * @param max
	 * @returns {*}
	 */
	MSweb.prototype.rand = function (min, max) {
		max++;
		return Math.floor(Math.random() * (max - min)) + min;
	};


	/**
	 * Простой таймер обратного отсчёта
	 * @param duration - кол-во секунд до конца отсчёта
	 * @param container
	 * @returns {Console | void}
	 */
	MSweb.prototype.simpleTimer = function (duration, container) {
		container = container || document.querySelector('#ms-simple-timer');
		if (!duration || !container)
			return window.console && console.warn('SimpleTimer - empty required parameters');
		var timer = duration, minutes, seconds, hours;
		setInterval(function () {
			hours = parseInt(timer / 60 / 60, 10);
			minutes = parseInt((timer / 60) % 60, 10);
			seconds = parseInt(timer % 60, 10);

			minutes = minutes < 10 ? "0" + minutes : minutes;
			seconds = seconds < 10 ? "0" + seconds : seconds;

			container.textContent = hours + ':' + minutes + ":" + seconds;

			if (--timer < 0) {
				timer = duration;
			}
		}, 1000);
	};

	/**
	 * Анимация случайных чисел в контейнере перед вставкой результата.
	 * @param target - куда вставляется результат
	 * @param opt_value - значение (опционально)
	 * если не передано значение, тогда надо передавать минимальное и максимальное:
	 * @param opt_min
	 * @param opt_max
	 * @param opt_timeout - время анимации. По умолчанию 1 секунда
	 * @param opt_speed - 'slow', 'medium', 'fast' скорость анимации по умолчанию medium
	 * @param opt_random - вставлять в анимацию случайные цифры от и до или по порядку
	 */
	MSweb.prototype.animateRandom = function (target, opt_value, opt_min, opt_max, opt_timeout, opt_speed, opt_random) {
		var A = this;
		opt_min = opt_min || 0;
		opt_max = opt_max || 1000;
		opt_max += 2;
		opt_value = opt_value || this.rand(opt_min, opt_max);
		opt_random = opt_random === undefined ? false : !!opt_random;

		if (String(opt_value).length < String(opt_max).length)
			opt_max = opt_value;

		var tempVal = opt_random ? A.rand(opt_min, opt_max) : opt_min;

		opt_speed = opt_speed == 'slow' ? 100 : (opt_speed == 'medium' || !opt_speed ? 50 : '');

		var aaa = Math.floor((opt_max - opt_min) / ((opt_timeout || 1000) / 50));

		if (opt_speed) {
			var interval = setInterval(function () {
				tempVal = opt_random ? A.rand(opt_min, opt_max) : (opt_min = opt_min + (aaa));
			}, 50);
		}

		$({numberValue: opt_min}).animate({numberValue: opt_value}, {
			duration: opt_timeout || 1000,
			easing: "linear",
			step: function (val) {
				target.innerHTML = tempVal;
			},
			complete: function () {
				target.innerHTML = opt_value;
				if (opt_speed) {
					clearInterval(interval);
				}
				console.log(opt_value);
			}
		});
	};

	MSweb.prototype.getRandomId = function (opt_length, opt_chars) {
		opt_length = opt_length || 8;
		opt_chars = opt_chars || 'ABCDEFGHJKLMNPQRSTYVWXYZ23456789';
		var str = '';
		var ln = opt_chars.length - 1;
		while (opt_length) {
			str += opt_chars[this.rand(0, ln)];
			opt_length--;
		}
		return str;
	};

	MSweb.prototype.htmlspecialchars = function (text) {
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};

		return text.replace(/[&<>"']/g, function (m) {
			return map[m];
		});
	};

	MSweb.prototype.htmlspecialchars_decode = function (str) {
		if (typeof (str) == "string") {
			str = str.replace(/&amp;/g, '&'); /* must do &amp; first */
			str = str.replace(/&quot;/g, '"');
			str = str.replace(/&#039;/g, "'");
			str = str.replace(/&lt;/g, "<");
			str = str.replace(/&gt;/g, ">");
		}
		return str;
	};

	MSweb.prototype.blinkTitle = function (blinktitle) {
		if (this.isBlinking_)
			this.blinkTitleStop();
		document.title = blinktitle;
		var a = 1;
		this.titleInterval_ = setInterval(function () {
			if (a) {
				document.title = this.currTitle_;
				a = 0;
			}
			else {
				document.title = blinktitle;
				a = 1;
			}
		}.bind(this), 1000);
		this.isBlinking_ = true;
	};

	MSweb.prototype.blinkTitleStop = function () {
		document.title = this.currTitle_;
		clearInterval(this.titleInterval_);
		this.isBlinking_ = false;
	};
	/**
	 * Перключение класса с интервалом
	 * @param el jQuery | DOMElement
	 * @param className {String}
	 * @param interval {opt msec}
	 */
	MSweb.prototype.setIntervalToggleClass = function (el, className, interval, clearOnHover) {
		el = el instanceof jQuery ? el : $(el);
		clearOnHover = clearOnHover || true;

		if (!el[0].mswebIntervalToggleClass) {
			el[0].mswebIntervalToggleClass = {};
		}
		if (el[0].mswebIntervalToggleClass[className])
			return;
		el[0].mswebIntervalToggleClass[className] = className;
		interval = interval || 1000;

		var interval = setInterval(function () {
			el.toggleClass(className);
		}, interval);
		if (clearOnHover)
			el.on('mouseover click contextmenu focus', function () {
				el.removeClass(className);
				clearInterval(interval);
			});
	};

	/**
	 * Поиск в объекте содержащем объекты по значению ключа в них.
	 * например для получения из объекта: {
	 *  2: {option_name: "Цель кредита", id: "2", option_type: "select", status: "1", option_values: Array(17)}
			9: {
				option_name: "Занятость"
				id: "9"
				option_type: "select"
				status: "1"
				option_values: (5) [{…}, {…}, {…}, {…}, {…}]
			}
	 * }
	 * дочернего объекта с option_name = "Занятость"
	 * @param obj - объект для поиска
	 * @param key - ключ, например 'option_name'
	 * @param val - значение искомого ключа, например "Занятость"
	 */
	MSweb.prototype.findByKey = function (obj, key, val) {
		if (!obj.length) {
			for (var i in obj) {
				if (obj[i][key] == val)
					return obj[i];
			}
		}
	};

	MSweb.prototype.createCaretPlacer = function (atStart) {
		return function (el) {
			el.focus();
			if (typeof window.getSelection != "undefined"
				&& typeof document.createRange != "undefined") {
				var range = document.createRange();
				range.selectNodeContents(el);
				range.collapse(atStart);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}
			else if (typeof document.body.createTextRange != "undefined") {
				var textRange = document.body.createTextRange();
				textRange.moveToElementText(el);
				textRange.collapse(atStart);
				textRange.select();
			}
		};
	}

	MSweb.prototype.setCursorInEnd = function (el) {
		let [r, s] = [document.createRange(), window.getSelection()];
		r.selectNodeContents(el);
		r.collapse(false);
		s.removeAllRanges();
		s.addRange(r);
	};

	MSweb.prototype.wrapWords = function (el) {
		var A = this;
		if (el instanceof jQuery)
			el = el[0];
		el.innerHTML = A.wrapWord_(el.innerHTML);
	};

	MSweb.prototype.wrapWord_ = function (text) {
		var RusA = "[абвгдеёжзийклмнопрстуфхцчшщъыьэюя]";
		var RusV = "[аеёиоуыэю\я]";
		var RusN = "[бвгджзклмнпрстфхцчшщ]";
		var RusX = "[йъь]";
		var Hyphen = "\xAD";

		var re1 = new RegExp("(" + RusX + ")(" + RusA + RusA + ")", "ig");
		var re2 = new RegExp("(" + RusV + ")(" + RusV + RusA + ")", "ig");
		var re3 = new RegExp("(" + RusV + RusN + ")(" + RusN + RusV + ")", "ig");
		var re4 = new RegExp("(" + RusN + RusV + ")(" + RusN + RusV + ")", "ig");
		var re5 = new RegExp("(" + RusV + RusN + ")(" + RusN + RusN + RusV + ")", "ig");
		var re6 = new RegExp("(" + RusV + RusN + RusN + ")(" + RusN + RusN + RusV + ")", "ig");
		text = text.replace(re1, "$1" + Hyphen + "$2");
		text = text.replace(re2, "$1" + Hyphen + "$2");
		text = text.replace(re3, "$1" + Hyphen + "$2");
		text = text.replace(re4, "$1" + Hyphen + "$2");
		text = text.replace(re5, "$1" + Hyphen + "$2");
		text = text.replace(re6, "$1" + Hyphen + "$2");
		return text
	};

	MSweb.prototype.copyToClipboard = function (target) {
		var rng, sel;
		if (document.createRange) {
			rng = document.createRange();
			rng.selectNode(target)
			sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(rng);
		}
		else {
			var rng = document.body.createTextRange();
			rng.moveToElementText(target);
			rng.select();
		}
		document.execCommand("Copy");
	};


	if (window.msweb)
		msweb = Object.assign(new MSweb(), msweb);
	else
		msweb = new MSweb();

	MSweb.prototype.placeCaretAtStart = msweb.createCaretPlacer(true);
	MSweb.prototype.placeCaretAtEnd = msweb.createCaretPlacer(false);

})(jQuery);