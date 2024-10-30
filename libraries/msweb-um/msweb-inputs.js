/*
 * Компонент, позволяющий создавать альтернативные поля ввода
 * из обычных div блоков. также при необходимости с кнопками +-
 * без jQuery
 * В месте где необходимо поместить поле ввода необходимо разместить блок
 * <div class="msweb-input"></div>
 * Ему можно задать при необходимости свой собственный стиль и другие аттрибуты
 * Получение значения с помощью метода getValue у '.msweb-input' (метод записывается в свойство нода при рендеринге)
 *
 * доступные аттрибуты для настройки:
 *
 * value - предустановленное значение (по умолчанию для number - 1)
 *
 * max - максимальное значение (только для типа number)
 *
 * min - минимальное значение (только для типа number)
 *
 * type - text | email | number
 *
 * controls="true" - наличие кнопок + -
 *
 * validator - название своей функции, например "myValidatorFunction" или myComp.myОnchangeFunction. В неё будет передаваться событие keyup. Должна вернуть true если проверка пройдена.
 *
 * defaultvalidator="true" - работает только для email | number
 *
 * editable - true | false
 *
 * onchange - название своей функции, например "myОnchangeFunction" или myComp.myОnchangeFunction.
 *
 *
 * Активировать на странице:
 *
 *
 	var MSInputsObj = null;
 	document.addEventListener("DOMContentLoaded", function () {
		MSInputsObj = new MSInputs();
	});

 * Или к конкретному элементу:
 	 MSInputsObj.renderInput(DOMElement);

 * @author Mixail Sayapin
 * https://ms-web.ru
 */

/**
 * @param {{validateOnFocusOut: boolean}} params
 * @constructor
 */
function MSInputs(params) {
	/**
	 * @type {{validateOnFocusOut: boolean}}
	 */
	this.params = params || {
		validateOnFocusOut: false
	};
	this.types = ['text', 'email', 'number'];
	this.onchange = this.params.onchange || null;
	this.beforeCallbackTimeout = false;
	this.init();
}

MSInputs.CLASSLIST = {
	placeholder: 'ms-inputs-placeholder' // TODO
};

MSInputs.prototype.init = function () {
	this.addCSS();
	var inputs = document.querySelectorAll('.msweb-input');
	for (var i = 0; i < inputs.length; i++)
		this.renderInput(inputs[i]);
};

MSInputs.prototype.addCSS = function () {
	if (MSInputs.cssRendered)
		return;
	var css = '.msweb-input{position: relative;background:#fff;}.msweb-input-area {border: 1px solid silver;min-height: 25px;border-radius: 3px;width: 50px;margin: auto;display: block;line-height: 25px;font-size: 14px;padding: 0px 5px 0px 5px;box-sizing:border-box;z-index:1}.msweb-input-area.wrong {border: 2px solid red;}.msweb-inputs-minus {width: 20px;height: 20px;border: 1px solid silver;border-radius: 20px;text-align: center;cursor: pointer;font-size: 30px;line-height: 13px;background: #e1ffbe;margin: auto;}.msweb-inputs-plus {width: 20px;height: 20px;border: 1px solid silver;border-radius: 20px;text-align: center;cursor: pointer;font-size: 22px;line-height: 17px;background: #e1ffbe;margin: auto;}.msweb-inputs-plus:hover, .msweb-inputs-minus:hover {background: #cae6a9;}table.msweb-inputs-controls-table {width:100%;}.msweb-inputs-minus:active, .msweb-inputs-plus:active {border-width: 2px;} .msweb-inputs-plus, .msweb-inputs-minus  {-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;}.msweb-input-area.disabled {color: #5d5d5d;cursor: not-allowed;}.ms-inputs-placeholder{position: absolute;top: 0;line-height: 25px;font-size: 14px;padding-left: 5px; display: none;color:#8a8a8a;z-index:0}.ms-inputs-placeholder.visible {display: block;}.msweb-input-textarea {background:#fff;} .msweb-input-textarea .msweb-input-area {min-height: 75px}';
	var style = document.createElement('style');
	style.type = 'text/css';
	if (style.styleSheet) {
		// This is required for IE8 and below.
		style.styleSheet.cssText = css;
	}
	else {
		style.appendChild(document.createTextNode(css));
	}
	var head = document.head || document.getElementsByTagName('head')[0];
	head.appendChild(style);
	MSInputs.cssRendered = true;
};

MSInputs.prototype.renderInput = function (el) {
	if (el.isrendered)
		return;

	var controls = el.getAttribute('controls');
	var defaulValidatorEnabled = el.getAttribute('defaulvalidator') || el.getAttribute('defaultvalidator');
	defaulValidatorEnabled = defaulValidatorEnabled !== 'false';
	var type = el.getAttribute('type');
	if (!this.types.includes(type)) {
		type = 'text';
	}
	var validator = el.getAttribute('validator');
	validator = this.getFunctionFromString(validator) || this.params.validator;
	var editable = el.getAttribute('editable');
	editable = !(editable && editable === 'false');
	var value = el.getAttribute('value');

	var placeholder = el.getAttribute('data-placeholder');

	var input = document.createElement('div');
	input.parent_ = el;
	el.inputElement_ = input;
	input.addEventListener('paste', function (e) {
		var el = document.createElement('div');
		el.innerHTML = e.clipboardData.getData('text') || '';
		this.parent_.setValue(el.innerText);
		e.preventDefault();
		if (window.msweb && msweb.setCursorInEnd) {
			msweb.setCursorInEnd(this);
		}
	});
	input.addEventListener('keydown', function (e) {
		if (e.keyCode === 13 && !e.target.parent_.classList.contains('msweb-input-textarea')) {
			e.preventDefault();
		}
	});
	input.className = 'msweb-input-area';

	if (this.params.classes) {
		if (typeof this.params.classes === 'string')
			this.params.classes = this.params.classes.split(' ');
		this.params.classes.forEach(function (item) {
			input.classList.add(item);
		});
	}

	if (type === 'number') {
		input.innerHTML = value || 1;
		input.style.textAlign = 'center';
	}
	else if (value)
		input.innerHTML = value;
	if (editable)
		input.setAttribute('contenteditable', true);
	if (validator) {
		input.addEventListener('focusout', function (ev) {
			if (!validator(input.parentElement.getValue()))
				this.setState(input, 'wrong');
			else
				this.setState(input, 'success');
		}.bind(this));

		input.addEventListener('keyup', function (ev) {
			this.setState(input, 'default');
		}.bind(this));

	}
	else if (defaulValidatorEnabled) {
		if (type === 'number') {
			if (!this.params.validateOnFocusOut) {
				input.addEventListener('keydown', this.validateNumber.bind(this));
				input.addEventListener('keyup', this.validateMinMax.bind(this));
				input.addEventListener('focusout', function (e) {
					this.validateMinMax(e, true);
				}.bind(this));
			}
			else {
				input.addEventListener('focusout', function (e) {
					this.validateNumber.bind(this);
					this.validateMinMax(e, true);
				}.bind(this));
			}
		}
		else {
			input.addEventListener('keyup', function () {
				this.parent_.getValue() && this.parent_.setState('default');
			});
		}
	}


	if (this.params.useMSabc) {
		input.addEventListener('focusout', function (e) {
			this.setValue(input.parentElement, msweb.abc(this.getValue(input.parentElement)));
		}.bind(this));
	}

	var tr = this.getControlsWrapper(el, controls);
	var td;
	if (type === 'number' && controls) {
		var leftControl = document.createElement('div');
		leftControl.className = 'msweb-inputs-minus';
		leftControl.innerHTML = '-';
		leftControl.addEventListener('click', function (ev) {
			this.onMinus(input);
			var A = this;
			if (this.beforeCallbackTimeout &&
				(this.onchange && typeof this.onchange === 'function' || input.onchange)
			) {
				var interval = setInterval(function () {
					if (!A.beforeCallbackTimeout) {
						A.onchange(el);
						if (input.onchange) {
							input.onchange(el);
						}
						clearInterval(interval);
					}
				}, 60);

			}
		}.bind(this));
		this.createControlsTd(leftControl, tr, '33.33333%', controls);
	}

	var placeholderDiv;
	if (placeholder) {
		placeholderDiv = document.createElement('div');
		placeholderDiv.innerText = placeholder;
		placeholderDiv.className = MSInputs.CLASSLIST.placeholder;
		input.placeholder_ = placeholderDiv;
	}
	this.createControlsTd(input, tr, controls ? '33.33333%' : '100%', controls, placeholderDiv);

	if (placeholder) {
		input.addEventListener('keypress', function (e) {
			this.classList.remove('visible');
		}.bind(placeholderDiv));
		input.addEventListener('keyup', function (e) {
			if (!e.target.parent_.getValue()) {
				this.classList.add('visible');
			}
			else {
				this.classList.remove('visible');
			}
		}.bind(placeholderDiv));
	}


	if (type === 'number' && controls) {
		var rightControl = document.createElement('div');
		rightControl.className = 'msweb-inputs-plus';
		rightControl.innerHTML = '+';
		rightControl.addEventListener('click', function (ev) {
			this.onPlus(input);
			if (this.beforeCallbackTimeout &&
				(this.onchange && typeof this.onchange === 'function' || input.onchange)
			) {
				var A = this;
				var interval = setInterval(function () {
					if (!A.beforeCallbackTimeout) {
						A.onchange(el);
						if (input.onchange) {
							input.onchange(el);
						}
						clearInterval(interval);
					}
				}, 60);
			}
		}.bind(this));
		this.createControlsTd(rightControl, tr, '33.33333%', controls);
	}

	var onchange = el.getAttribute('onchange');
	if (onchange && (onchange = this.functionExists(onchange, el))) {
		input.oninput = onchange.bind(el);
		input.onchange = onchange.bind(el);
		el.removeAttribute('onchange');
	}


	el.getValue = this.getValue.bind(el);
	el.setValue = this.setValue.bind(el);
	el.setState = this.setState.bind(el);
	el.isrendered = true;

	if (placeholder) {
		if (!el.getValue()) {
			placeholderDiv.classList.add('visible');
		}
	}
};

/**
 *
 * @param str
 * @param optEl
 * @returns {boolean}
 */
MSInputs.prototype.functionExists = function (str, optEl) {
	try {
		var exist = true;
		var arrOnChange = str.split('.');
		var obj;
		for (var i = 0, ln = arrOnChange.length; i < ln; i++) {
			if (i === 0) {
				if (!window[arrOnChange[i]]) {
					exist = false;
					break;
				}
				obj = window[arrOnChange[i]];
			}
			else {
				if (!obj[arrOnChange[i]]) {
					exist = false;
					throw new Error();
				}
				obj = obj[arrOnChange[i]];
			}

		}
		return exist ? obj : false;
	} catch (e) {
		this.consoleError('Undefined function ' + str + '. Element and stack below:');
		optEl && console.log(optEl);
		console.warn(e);
		return false;
	}
};

MSInputs.prototype.validateMinMax = function (e, immediately) {
	var input = e.target || e;
	var min = input.parent_.getAttribute('min') || this.params.min;
	var max = input.parent_.getAttribute('max') || this.params.max;
	this.beforeCallbackTimeout = true;
	if (this.validateMinMaxTimeout)
		clearTimeout(this.validateMinMaxTimeout);
	this.validateMinMaxTimeout = setTimeout(function () {
		if (min && +input.innerText.replace(/[^0-9]/g, '') < +min) {
			input.innerText = min;
			msweb.placeCaretAtEnd(input);
		}
		if (max && +input.innerText.replace(/[^0-9]/g, '') > +max) {
			input.innerText = max;
			msweb.placeCaretAtEnd(input);
		}
		this.beforeCallbackTimeout = false;
	}.bind(this), immediately ? 10 : 1000);
};

MSInputs.prototype.onMinus = function (el) {
	var value = parseFloat(el.innerText) || 1;
	el.innerText = --value;
	this.validateMinMax(el);
};

MSInputs.prototype.onPlus = function (el) {
	var value = parseFloat(el.innerText) || 0;
	el.innerText = ++value;
	this.validateMinMax(el);
};

MSInputs.prototype.createControlsTd = function (contentEl, parentEl, width, controls, placeholder) {
	if (controls) {
		var td = document.createElement('td');
		td.style.width = width;
		td.appendChild(contentEl);
		parentEl.appendChild(td);
	}
	else {
		contentEl.style.width = width;
		parentEl.appendChild(contentEl);
	}
	if (placeholder) {
		parentEl.appendChild(placeholder);
	}
};

/**
 * таблица для инпута
 * @returns {Element} tr
 */
MSInputs.prototype.getControlsWrapper = function (parent, controls) {
	var maxWidth = parent.getAttribute('max-width');
	var margin = parent.getAttribute('margin');
	if (controls) {
		var table = document.createElement('table');
		table.className = 'msweb-inputs-controls-table';
		if (maxWidth)
			table.style.maxWidth = maxWidth;
		if (margin)
			table.style.margin = margin;
		parent.appendChild(table);
		table.appendChild(document.createElement('tbody'));
		table.tBodies[0].appendChild(document.createElement('tr'));
		return table.tBodies[0].children[0];
	}
	else {
		if (maxWidth)
			parent.style.maxWidth = maxWidth;
		if (margin)
			parent.style.margin = margin;
		return parent;
	}

};

MSInputs.prototype.validateNumber = function (e) {
	if (
		!(e.keyCode >= 48 && e.keyCode <= 57 && !e.shiftKey) && // int
		!(e.keyCode >= 96 && e.keyCode <= 105) && // num
		!(e.keyCode === 8) && // backspace
		!(e.keyCode === 39) && // arrow right
		!(e.keyCode === 37) && // arraow left
		!(e.keyCode === 9) && // tab
		!(e.keyCode === 46) && // delete
		!(e.keyCode === 65 && e.ctrlKey) && // ctrl+A
		!(e.keyCode === 82 && e.ctrlKey) // ctrl+r
	) {
		e.preventDefault();
	}
};

/**
 * @param {string='default'} [type] - wrong | success | default
 */
MSInputs.prototype.setState = function (type) {
	var el;
	if (
		arguments.length === 2 &&
		arguments[0] instanceof HTMLElement &&
		typeof arguments[1] === "string"
	) {
		el = arguments[0];
		type = arguments[1];
	}
	else {
		el = this.inputElement_;
	}
	el.classList.remove('wrong');
	el.classList.remove('success');
	el.classList.add(type);
};

MSInputs.prototype.getValue = function (el) {
	el = el || this;
	el = el.querySelector('.msweb-input-area');
	return el && el.innerText || '';
};

MSInputs.prototype.consoleError = function (message) {
	var style = ['padding: 5px;',
		'background: yellow;',
		'font: 16px Georgia;',
		'color: black;'].join('');
	message = 'MSInputs \n' + message;
	console.log('%c%s', style, message);
};

MSInputs.prototype.setValue = function (el, value) {
	if (arguments.length === 2) {
		el = el || this;
	}
	else {
		value = el || '';
		el = this;
	}
	el = el.querySelector('.msweb-input-area');
	el && (el.innerText = value);
	if (!value && el.placeholder_) {
		el.placeholder_.classList.add('visible');
	}
	else if (el.placeholder_) {
		el.placeholder_.classList.remove('visible');
	}
};

MSInputs.prototype.setDisabled = function (el, disabled) {
	var area = el.querySelector('.msweb-input-area');
	if (disabled) {
		area.removeAttribute('contenteditable');
		area.classList.add('disabled');
	}
	else {
		area.setAttribute('contenteditable', true);
		area.classList.remove('disabled');
	}
};

MSInputs.prototype.setDisabled = function (el, disabled) {
	var area = el.querySelector('.msweb-input-area');
	if (disabled) {
		area.removeAttribute('contenteditable');
		area.classList.add('disabled');
	}
	else {
		area.setAttribute('contenteditable', true);
		area.classList.remove('disabled');
	}
};

/**
 * @param {string} [str] - name of the global function or string like this 'someObj.obj.obj.functionName'
 * @returns {boolean|function}
 */
MSInputs.prototype.getFunctionFromString = function (str) {
	if (!str) {
		return false;
	}
	var arr = str.split('.');
	var func = window;
	for (let i = 0, ln = arr.length; i < ln; i++) {
		func = func[arr[i]];
		if (!func) {
			break;
		}
	}
	return typeof func === 'function' ? func : false;
};