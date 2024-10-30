/*
	создание стилизованных выпадающих списков
 */
function MSSelect(params) {
	this.params = params || {};
	this.onchange = this.params.onchange || null;
	this.addCSS();
};
MSSelect.BASEPATH = '/public/msweb-um';

MSSelect.CLASSLIST = {
	select: 'msweb-select',
	option: 'msweb-select-option',
	title: 'msweb-select-title',
	down: 'msweb-select-down',
	optsContainer: 'msweb-select-opts-container',
	selectedCont: 'msweb-select-selected-cont'
};

MSSelect.prototype.init = function () {
	var items = document.querySelectorAll('.' + MSSelect.CLASSLIST.select);
	for (var i = 0; i < items.length; i++) {
		var data = {},
			item = items[i];
		data.options = item.options;
		data.selected = item.selectedOptions[0];
		data.select = items[i];
		var parent = items[i].parentElement;
		items[i].style.display = 'none';
		this.create(data, parent);
	}
};

MSSelect.prototype.addCSS = function () {
	if (MSSelect.cssRendered)
		return;
	var style = document.createElement('link');
	style.rel = 'stylesheet';
	var ver = Math.floor(new Date() / 1000);
	style.href = MSSelect.BASEPATH + '/msweb-select.css?v=' + ver;
	var head = document.head || document.getElementsByTagName('head')[0];
	head.appendChild(style);
	MSSelect.cssRendered = true;
};

/**
 *
 * @param data = {
 *   options - required
 *   selected - selected option (required)
 *   select - optional
 *   classes - optional string | array,
 *   title
 * }
 * @param parent
 */
MSSelect.prototype.create = function (data, parent) {
	var cont = document.createElement('div');
	cont.className = MSSelect.CLASSLIST.select;
	parent = parent || data.select.parentElement;
	if (data.select)
		data.select.style.display = 'none';
	parent.appendChild(cont);

	if (data.classes) {
		if (typeof data.classes !== 'object')
			data.classes = data.classes.split(' ');
		data.classes.forEach(function (item) {
			cont.classList.add(item);
		});
	}

	var sTitle = data.title || 'Выберите из списка';
	var title = document.createElement('div');
	title.className = MSSelect.CLASSLIST.title;
	title.innerText = sTitle;
	cont.append(title);

	var down = document.createElement('div');
	down.className = MSSelect.CLASSLIST.down;
	cont.append(down);

	var selectedCont = document.createElement('div');
	selectedCont.className = MSSelect.CLASSLIST.selectedCont;
	cont.append(selectedCont);
	selectedCont.innerText = data.options[0].innerText;

	var optsContainer = document.createElement('div');
	optsContainer.className = MSSelect.CLASSLIST.optsContainer;
	optsContainer.style.display = 'none';
	cont.appendChild(optsContainer);
	var listened = false;
	var A = this;

	var work = function (ev, mouseup) {
		var parent = optsContainer.parentElement;

		if (parent != ev.target && parent != ev.target.parentElement && parent != ev.target.parentElement.parentElement)
			return optsContainer.style.display = 'none';

		if (
			!mouseup &&
			(
				ev.target.classList.contains(MSSelect.CLASSLIST.down) ||
				ev.target.classList.contains(MSSelect.CLASSLIST.title) ||
				ev.target.classList.contains(MSSelect.CLASSLIST.selectedCont) ||
				ev.target.classList.contains(MSSelect.CLASSLIST.select)
			)
		) {
			if (optsContainer.style.display)
				optsContainer.style.display = '';
			else
				optsContainer.style.display = 'none';
		}
		else if (ev.target.classList.contains(MSSelect.CLASSLIST.option)) {
			if (data.select) {
				data.select.value = ev.target.getAttribute('value');
			}
			selectedCont.innerText = ev.target.innerText;
			if (data.onchange) {
				data.onchange('', selectedCont.innerText);
			}
			optsContainer.style.display = 'none';
			A.setState(cont, 'success');
		}
		else {
			optsContainer.style.display = 'none';
		}
	};

	document.addEventListener('click', function (ev) {
		work(ev);
	});
	document.addEventListener('mouseup', function (ev) {
		work(ev, true);
	});

	for (var i = 0, ln = data.options.length; i < ln; i++) {
		var dOpt = data.options[i];
		var opt = document.createElement('div');
		opt.setAttribute('value', dOpt.value);
		opt.className = MSSelect.CLASSLIST.option;
		opt.innerText = dOpt.innerText;
		optsContainer.append(opt);
	}
	cont.setState = this.setState.bind(cont);

};

MSSelect.prototype.setState = function (el, type) {
	el.classList.remove('wrong');
	el.classList.remove('success');
	el.classList.add(type);
};
