/*
 * @author Mixail Sayapin
 * https://ms-web.ru
 */

(function ($) {
	var A = msweb.plugins.msSubscribe;

	A.init = function () {
		if (A.inited)
			return;
		this.cssPrefix = 'msweb-subscribe__';
		this.timers = {};
		this.settings = localStorage.getItem('msSubscribe') || '{}';
		this.settings = JSON.parse(this.settings);
		this.blocks = {};
		this.posts = {};
		this.dots = 'px';
		this.settingsChanged = false;
		this.d = document.createElement('div');
		var img = $('<img src="' + this.directory + '/public/images/squarel.png" style="position: fixed; top: -300px">');
		this.funcKeys = [16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 91, 92, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145, 154, 157];
		$('body').append(img);
		this.text = typeof this.text == 'string' ? JSON.parse(this.text) : this.text;
		this.widgetOptions = typeof this.widgetOptions == 'string' ? JSON.parse(this.widgetOptions) : this.widgetOptions;
		this.same_page_id = typeof this.same_page_id == 'string' ? JSON.parse(this.same_page_id) : this.same_page_id;
		this.inited = true;
		A.d.style.fontSize = '14px';
		return true;
	};


	A.showForm = function (notListening) {
		if (!notListening && this.settings.hideForm)
			return this.showButtonToShowForm();
		var this_ = this;
		var form = $('<div class="' + this.cssPrefix + 'form"></div>');

		this.blocks.element = form;
		var img = $('<img src="' + this.directory + '/public/images/email.png" class="' + this.cssPrefix + 'email">');
		var closeBtn = $('<span class="' + this.cssPrefix + 'close">' + A.text.close + '</span>');
		var title = $('<div class="' + this.cssPrefix + 'title">' + A.text.title + '</div>');

		A.d.innerText = A.text.avt;

		var input = $('<div class="' + this.cssPrefix + 'input" placeholder="' + A.text.placeholderemail + '">' + A.text.placeholderemail + '</div>');
		if (!notListening) {
			input.click(function () {
				this.setAttribute('contenteditable', true);
				if (this.innerText == this.getAttribute('placeholder'))
					this.innerText = '';
				$(this).focus().focusout(function () {
					if (this.innerText == '')
						this.innerText = this.getAttribute('placeholder');
				});
			});
			input[0].addEventListener('keyup', function (ev) {
				if (ev.keyCode != 13)
					A.onEmailKeyUp(input);
			});
			input[0].addEventListener('keydown', function (ev) {
				if (ev.keyCode == 13) {
					ev.preventDefault();
					A.subscribe(input);
				}
			});
		}

		A.d.style.right = 0;

		var button = $('<div class="' + this.cssPrefix + 'button">' + A.text.subscribe + '</div>');

		if (!notListening)
			$('body').append(form);

		this.blocks.content = $('<div></div>');
		this.blocks.content.append(img).append(title).append(input).append(button);
		form.append(closeBtn).append(this.blocks.content);
		A.d.style.position = 'absolute';

		if (!notListening)
			closeBtn[0].addEventListener('click', this.hideForm.bind(this, form));
		form.addClass('bounceInLeft animated');
		this.setSparkle(form);
		this.timers.sparkle = setInterval(function () {
			this_.setSparkle(form);
		}, 5000);
		$('.' + this.cssPrefix + 'news-button').hide();

		if (!A.a)
			form.append(A.d);

		if (!notListening)
			button.click(function () {
				A.subscribe(input);
			});
		if (A.widgetOptions.color_max_background)
			form.css({background: A.widgetOptions.color_max_background});
		if (A.widgetOptions.color_max_background_button)
			form.find('.msweb-subscribe__button').css({background: A.widgetOptions.color_max_background_button});
		if (A.widgetOptions.color_max_button_text)
			form.find('.msweb-subscribe__button').css({color: A.widgetOptions.color_max_button_text});
		if (A.widgetOptions.color_max_text)
			form.find('.msweb-subscribe__title, .msweb-subscribe__close').css({color: A.widgetOptions.color_max_text});
		return form;
	};

	A.subscribe = function (input) {
		if (!A.validateEmail(input)) {
			return;
		}
		A.animateCheck();

		var email = input.text();
		swal(A.text.onsubscribemess1 + ' ' + email + ' ' + A.text.onsubscribemess2, '', 'success');
		setTimeout(function () {
			A.hideForm(A.blocks.element);
		}, 1000);
		A.settings.hideForm = true;
		localStorage.setItem('msSubscribe', JSON.stringify(A.settings));

		A.post({
			action: 'subscribe',
			email: email,
			pageId: msweb.plugins.pageId
		}, function (d) {
			clearInterval(A.timers.sparkle);
		});
	};


	/**
	 * Рисует галочку
	 * @param el - dom element
	 */
	A.animateCheck = function (el) {
		var img = $('<img src="' + this.directory + '/public/images/squarel.png">');
		img.css({width: 0, height: 0});
		if (!el) {
			el = this.blocks.content;
			el.html('');
		}
		el.append(img);
		img.animate({
			width: '60px',
			height: '60px',
			margin: '10px'
		});
		var mess = $('<div class="' + A.cssPrefix + 'congratulation-text"></div>');
		mess.innerText = A.text.congratulations;
	};

	A.hideForm = function (form) {
		A.settings.hideForm = true;
		localStorage.setItem('msSubscribe', JSON.stringify(A.settings));
		var this_ = this;
		form.removeClass('bounceInLeft animated').addClass('bounceOutLeft animated');
		clearInterval(this.timers.sparkle);
		this.showButtonToShowForm();
	};

	A.showButtonToShowForm = function (notListening) {
		var button = $('<div class="' + this.cssPrefix + 'news-button">' + A.text.subscribeText + '</div>');
		if (A.widgetOptions.color_min_background)
			button.css({background: A.widgetOptions.color_min_background});
		if (A.widgetOptions.color_min_text)
			button.css({color: A.widgetOptions.color_min_text});
		var this_ = this;
		if (!notListening)
			$('body').append(button);
		setTimeout(function () {
			button.fadeIn();
		}, 1000);
		if (!notListening)
			button.click(function () {
				this_.settings.hideForm = false;
				localStorage.setItem('msSubscribe', JSON.stringify(this_.settings));
				this_.showForm();
			});
		return button;
	};

	A.setSparkle = function (form) {
		var sparkle = $('<div class="msweb-subscribe__shine_star"><div><span></span></div></div>');
		setTimeout(function () {
			$(form).prepend(sparkle);
		}, 1000);
		A.d.style.color = 'red';
		setTimeout(function () {
			sparkle.remove();
		}, 2000);
	};

	A.onEmailKeyUp = function (input) {
		if (this.timers.emailValidation)
			clearTimeout(this.timers.emailValidation);
		input.css({border: 'none'});
		var this_ = this;
		this.timers.emailValidation = setTimeout(function () {
			this_.validateEmail(input);
		}, 1200);
	};

	/**
	 * @param input  - dom el | jquery obj | string
	 */
	A.validateEmail = function (input) {
		var pattern = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;
		var pattern2 = /^([a-z0-9_\.-])+@[a-z0-9-]+\.[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;
		if (typeof input == 'string') {
			return pattern.test(input) || pattern2.test(input);
		}
		if (!(input instanceof jQuery))
			input = $(input);

		if (!pattern.test(input.text())) {
			A.setState(input, 'danger');
		} else {
			A.setState(input, 'default');
			return true;
		}
	};

	/**
	 * @param input dom el | jQuery object
	 * @param state - 'default' | 'success' | 'danger'
	 */
	A.setState = function (input, state) {
		if (!input)
			return window.console && console.warning('input required');
		if ((input instanceof jQuery))
			input = input[0];

		var setInitial = function (input) {
			if (input.initialBorderStyle)
				return;
			input.initialBorderStyle = {};
			input.initialBorderStyle.border = input.style.border;
			input.initialBorderStyle.borderWidth = input.style.borderWidth;
			input.initialBorderStyle.borderColor = input.style.borderColor;
			input.initialBorderStyle.borderStyle = input.style.borderStyle;
		};
		var setColor = function (input, color) {
			input.style.borderWidth = '2px';
			input.style.borderColor = color;
			input.style.borderStyle = 'solid';
		};
		switch (state) {
			case 'success': {
				setInitial(input);
				setColor(input, 'green');
				break;
			}
			case 'danger' : {
				setInitial(input);
				setColor(input, 'red');
				break;
			}
			case 'default':
			default : {
				if (input.initialBorderStyle) {
					for (var i in input.initialBorderStyle)
						input.style[i] = input.initialBorderStyle[i];
				}
				break;
			}
		}
	};

	A.addListenerOnSetState = function (input, stateOnRightVal) {
		if (!(input instanceof jQuery))
			input = $(input);

		var tag = input[0] && input[0].tagName;

		if (!stateOnRightVal)
			stateOnRightVal = 'default';


		if (tag == 'INPUT') {
			input.keyup(function () {
				if (this.value.replace(/\s/ig, '') == '')
					A.setState(this, 'danger');
				else
					A.setState(this, stateOnRightVal);
			});
		}
		else if (tag == 'SELECT') {
			input.change(function () {
				if (!this.value)
					A.setState(this, 'danger');
				else
					A.setState(this, stateOnRightVal);
			});
		}
		else if (tag == 'DIV') {
			input.keyup(function () {
				if (this.innerText.replace(/\s/ig, '') == '' || this.innerText == this.getAttribute('placeholder'))
					A.setState(this, 'danger');
				else
					A.setState(this, stateOnRightVal);
			});
		}
	};

	A.post = function (data, callback) {
		var act = data.action;
		$.post(msweb.plugins.ajaxUrl, {
			action: 'msweb_plugins_ms_subscriber_ajax',
			act: act,
			data: data
		}, function (d) {
			try {
				d = JSON.parse(d);
				if (callback)
					callback.call(this, d);
			} catch (e) {
				console.log(e.message + '<br>' + d);
			}
		});
	};

	A.setLoader = function (parent) {
		var tempDiv = false;
		var A = this;
		if (!parent) {
			tempDiv = $('<div style="width: 100%; height: 100%; position: fixed; top: 0; left: 0; z-index: 9999999999999; background: #fffc; padding-top: 30%;"></div>');
			$('body').append(tempDiv);
			parent = tempDiv;
		}
		var img = $('<img src="' + A.directory + '/public/images/loading.gif" class="' + A.cssPrefix + '-loader">');
		img.css({width: '60px', height: '60px', margin: 'auto'});
		var container = $('<div class="' + A.cssPrefix + '-loader-container" style="text-align: center"></div>');
		container.append(img);
		$(parent).prepend(container);
		if (tempDiv) {
			container.on('onremoveloader', function (ev) {
				container.parent().remove();
			});
		}
	};

	A.removeLoader = function () {
		var loader = $('img.' + A.cssPrefix + '-loader');
		loader.trigger('onremoveloader');
		loader.remove();
	};

	A.alert = function (shtml, type, params) {
		if (!type)
			type = 'success';
		var div = $('<div class="alert animated bounceInRight alert-' + type + ' alert-dismissible fade show" role="alert">\n' +
			'  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
			'    <span aria-hidden="true">&times;</span>\n' +
			'  </button>\n' +
			'</div>');
		var defaults = {
			position: 'fixed',
			top: '20px',
			right: '20px',
			'z-index': 9999999999
		};
		if (params) {
			for (var i in params)
				defaults[i] = params[i];
		}
		div.css(defaults);
		div.append(shtml);
		$('body').append(div);
		setTimeout(function () {
			div.fadeOut();
			setTimeout(function () {
				div.remove();
			}, 500);
		}, 4000);
	};


	document.addEventListener('DOMContentLoaded', function () {
		if (A.isAdmin)
			return A.init();

		var interval = setInterval(function () {
			if (A.init() && A.showForm) {
				if (!A.useOnSame || A.useOnSame == '0' || A.useOnSame == "1" && A.same_page_id.includes(+msweb.plugins.pageId)) {
					A.showForm();
					A.d.style.bottom = '-18px';
					clearInterval(interval);
				}
			}
		}, 1000);

	});


})(jQuery);
