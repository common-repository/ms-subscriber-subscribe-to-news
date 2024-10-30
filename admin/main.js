(function ($) {

	var A = msweb.plugins.msSubscribe;
	if (!A.inited) {
		A.init();
	}

	A.msInputsObj = new MSInputs({
		validateOnFocusOut: true
	});

	A.saveEmail = function () {

		if (!document.getElementById('sendertypesmtp').checked) {
			A.post({
				action: 'disable_smtp'
			}, function (d) {
				swal(A.text.success, '', 'success');
			});
			return;
		}

		var empty = false;

		var emailInput = $('.msweb-input[name="smtp-email"]')[0];
		var email = emailInput.getValue();

		if (!A.validateEmail(email)) {
			emailInput.setState('wrong');
			empty = true;
		}

		var serverSelect = $('.smtp-server-select');
		var server = serverSelect.val();

		if (!server) {
			A.setState(serverSelect, 'danger');
			A.addListenerOnSetState(serverSelect, 'default');
			empty = true;
		}

		var password = $('.msweb-input[name="smtp-password"]')[0];
		var passwordValue = password.getValue();
		if (!passwordValue) {
			password.setState('wrong');
			empty = true;
		}

		var inpOtherServer,
			inpOtherPort,
			inpOtherServerValue = '',
			inpOtherPortValue = '';

		if (server === 'other') {
			inpOtherServer = $('[name="smtp-server-other"]')[0];
			inpOtherServerValue = inpOtherServer.getValue();
			inpOtherPort = $('[name="smtp-server-other-port"]')[0];
			inpOtherPortValue = inpOtherPort.getValue();


			if (!inpOtherServerValue) {
				inpOtherServer.setState('wrong');
				empty = true;
			}
			if (!inpOtherPortValue) {
				inpOtherPort.setState('wrong');
				empty = true;
			}
		}

		if (empty) {
			return;
		}

		A.setLoader();

		var data = {
			action: 'save_email',
			email: email,
			password: passwordValue,
			server: server,
			otherServer: inpOtherServerValue,
			otherPort: inpOtherPortValue
		};

		A.post(data, function (d) {
			if (d.data.message == true)
				$('[data-on-save-email-mess]').removeClass('hidden');
			else
				$('[data-on-save-email-error]').removeClass('hidden').text(d.data.message);
			$('[data-subscriber-smtp-email]').text(email);
			A.removeLoader();
		});
	};

	A.onchangeServer = function (value) {
		if (value == 'other') {
			$('.msweb_ms_subscriber-smtp-server-other-options').show();
		}
		else {
			$('.msweb_ms_subscriber-smtp-server-other-options').hide();
		}
	};

	A.getEditorContent = function () {
		var timce = window.tinyMCE && tinyMCE.get && tinyMCE.get(this.editorId);
		if (!timce) {
			swal(A.text.error, A.text.novisualeditorfound, 'error');
			return;
		}
		return timce && timce.getContent && timce.getContent();
	};

	A.sendNews = function () {

		var content = this.getEditorContent();
		if (!content) {
			swal(A.text.entertext, '', 'warning');
			return;
		}

		swal({
			title: A.text.whatactiontoperform + '?',
			text: "",
			buttons: [A.text.lettertosubscribers, A.text.lettertoadministrator],
		})
			.then((sendToSubscribers) => {
				if (sendToSubscribers !== undefined)
					A.sendNews_(content, !sendToSubscribers);
			});
	};

	A.saveTemplate = function (replacetemplate) {
		var content = this.getEditorContent();
		if (!content) {
			swal(A.text.entertext, '', 'warning');
			return;
		}

		if (!replacetemplate) {
			swal({
				title: A.text.entertemplatename,
				content: "input",
				button: {
					text: A.text.save
				}
			}).then(function (name) {
				if (!name) {
					A.saveTemplate.name = name;
					return;
				}
				//debugger;
				A.saveTemplatename = name;
				if (!replacetemplate && A.templateNames.includes(name))
					return swal({
						title: A.text.replacetemplate,
						buttons: {
							ok: A.text.yes,
							no: A.text.no
						}
					}).then(function (state) {
						if (state == 'ok') {
							return A.saveTemplate(true);
						}
					});
				//debugger;
				A.setLoader();
				A.post({
					action: 'savetemplate',
					name: name,
					content: content
				}, function (d) {
					if (d.status != 200) {
						swal({
							icon: 'error',
							text: d.error
						})
					}
					A.removeLoader()
				});
			});
		}
		else {
			A.setLoader();
			A.post({
				action: 'savetemplate',
				name: A.saveTemplatename,
				content: content
			}, function (d) {
				if (d.status != 200) {
					swal({
						icon: 'error',
						text: d.error
					})
				}
				A.removeLoader()
				A.saveTemplate.name = undefined
			});
		}

	};

	A.changeTemplate = function (templateName, replaceContent) {
		var content = this.getEditorContent();
		if (content && !replaceContent) {
			swal({
				title: A.text.replacecontent,
				buttons: {
					ok: A.text.yes,
					no: A.text.no
				}
			}).then(function (state) {
				if (state == 'ok')
					return A.changeTemplate(templateName, true);
			});
			return;
		}
		var timce = window.tinyMCE && tinyMCE.get && tinyMCE.get(this.editorId);
		if (!templateName) {
			return timce && timce.getContent && timce.setContent('');
		}
		A.setLoader();
		A.post({
			action: 'get_template',
			name: templateName
		}, function (d) {
			if (d.status == 200) {

				timce && timce.getContent && timce.setContent(d.shtml);
			}
			else {
				swal({
					icon: 'error',
					text: d.error
				});
			}
			A.removeLoader();
		});
	};

	A.sendNews_ = function (content, toSubscribers) {
		A.setLoader();
		A.post({
			action: 'send_news',
			toSubscribers: toSubscribers,
			content: content
		}, function () {
			A.removeLoader();
		});
	};

	A.toggleClass = function (el, class1, class2) {
		if (!(el instanceof jQuery))
			el = $(el);
		if (el.hasClass(class1))
			el.removeClass(class1).addClass(class2);
		else if (el.hasClass(class2))
			el.removeClass(class2).addClass(class1);
	};

	A.onfindedPageClick = function (el) {
		A.settingsChanged = true;
		var pageIdInp = $('[msweb-plugins-subscriber-output-page-id]');
		var currval = pageIdInp.val();
		currval = currval.replace(/[^0-9, ]/g, '');
		var currvalArr = currval.replace(/[^0-9,]/sg, '').split(',');
		var val = el.getAttribute('data-id');

		if (!currvalArr.includes(val)) {
			if (currval)
				currval = currval + ', ' + val;
			else
				currval = val;
			pageIdInp.val(currval);
		}
		else {
			var newVal = '';
			for (var i = 0; i < currvalArr.length; i++)
				if (currvalArr[i] != val)
					newVal += currvalArr[i] + ', ';
			newVal += val;
			pageIdInp.val(newVal);
			A.alert(A.text.duplicateshavebeenremoved, 'danger', {top: '5%', right: '5%'});
		}
		A.setState(pageIdInp, 'success');
		setTimeout(function () {
			A.setState(pageIdInp, 'default');
		}, 150);
	};

	A.saveWidgetOutput = function () {
		if (!A.a) {
			var el = document.createElement('a');
			el.setAttribute('href', A.buyHref);
			el.setAttribute('target', '_blank');
			el.innerText = A.text.getupgrade;
			swal({
				text: A.text.paidversion,
				content: el
			});
			return;
		}


		var pagesInp = $('[msweb-plugins-subscriber-output-page-id]');
		var useOnSame = $('#ms-subscriber-use-only-on-page').is(':checked') || false;
		var pageId = pagesInp.val();
		if (useOnSame && !pageId) {
			swal('', A.text.enterpageid, 'warning');
			return;
		}
		if (/[^0-9,\s]/.test(pageId)) {
			swal('', A.text.wrongvalue, 'warning');
			A.setState(pagesInp, 'danger');
			A.addListenerOnSetState(pagesInp, 'default');
			return;
		}
		A.settingsChanged = false;
		A.post({
			action: 'save_widget_output',
			useOnSame: useOnSame,
			pageId: pageId,
			color_min_background: $('[name="color_min_background"]').val(),
			color_min_text: $('[name="color_min_text"]').val(),
			color_max_background: $('[name="color_max_background"]').val(),
			color_max_text: $('[name="color_max_text"]').val(),
			color_max_background_button: $('[name="color_max_background_button"]').val(),
			color_max_button_text: $('[name="color_max_button_text"]').val()
		}, function (d) {
			if (d.error) {
				swal('', d.error, 'warning');
			}
			else {
				swal(A.text.success + '!', '', 'success');
			}
		});
	};


	A.onInstallMCEClick = function () {
		var src = msweb.plugins.adminURL + 'plugin-install.php?tab=plugin-information&plugin=tinymce-advanced';

		var tmpElem = $('<div></div>');
		tmpElem[0].innerHTML = '<iframe name="install-mce" id="install-mce-frame" src="' + src + '"></iframe>';
		var iframe = tmpElem[0].firstChild;

		var closeBtn = $('<div class="msweb-plugins-subscriber-close-button">X</div>');

		tmpElem.prepend(closeBtn);


		document.body.appendChild(tmpElem[0]);

		iframe.style.width = '100%';
		iframe.style.height = '100%';
		tmpElem.css({
			'background': '#fff',
			'position': 'fixed',
			'top': '20px',
			'width': '90%',
			'height': '90%',
			'left': '5%',
			'right': '5%',
			'z-index': 99999999
		});

		A.setLoader(tmpElem);

		iframe.onload = function () {
			A.removeLoader();
			var frame = iframe && iframe.contentDocument;
			var btn = $(frame).find('#plugin_install_from_iframe');
			var href = btn.attr('href');
			var text = btn.text();
			var newBtn = $('<button style="padding: 5px; background: #4CAF50; color: white;">' + text + '</button>');

			btn.replaceWith(newBtn);
			newBtn.click(function () {
				window.location.href = href;
			});
			newBtn.parent().css({'text-align': 'right'});
		};

		closeBtn.click(function () {
			tmpElem.remove();
		});
		return tmpElem;
	};

	A.newerNotifyAboutMCE = function () {
		$('.msweb-subscribe-warrning').hide();
		A.post({
			action: 'disable_notify_mce'
		}, function (d) {
		});
	};


	$(document).ready(function () {
		$('[data-toggle="tooltip"]').tooltip();

		$('[data-toggle="collapse"]').click(function () {
			var item = $(this);
			A.toggleClass(this, 'minimized', 'maximized');
			$('[data-toggle="collapse"]').each(function () {
				var el = $(this);
				if (el.is(item)) {
					$('#' + el.attr('targetId')).collapse('toggle');
				}
				else {
					$('#' + el.attr('targetId')).collapse('hide');
					el.removeClass('maximized').addClass('minimized');
				}
			});
			//$('#' + $(this).attr('targetId')).collapse('toggle');
		});

		$('[msweb-plugins-subscriber-output-page-title]').keyup(function (ev) {
			if (A.funcKeys.includes(ev.keyCode))
				return;
			clearTimeout(A.timers.findPage);
			var words = this.value;
			var resDiv = $('.msweb-plugins-subscriber-output-find-page-message');

			A.timers.findPage = setTimeout(function () {
				if (words.length < 2)
					return;

				resDiv.html('');

				if (A.posts.searchpage)
					A.posts.searchpage.abort();
				A.posts.searchpage = false;
				A.removeLoader();

				A.setLoader(resDiv);
				A.posts.searchpage = A.post({
					action: 'find_page',
					words: words
				}, function (d) {
					A.removeLoader();
					var content = '';
					if (!d.data.length) {
						content += '<p>' + A.text.emptyresult + '</p>';
					}
					else {
						content += '<p>' + A.text.finded + ' ' + d.data.length + ' ' + A.text.chooseone + '</p>';
						for (var i in d.data) {
							if (i == 'length')
								continue;
							content += '<span class="' + A.cssPrefix + 'finded-title" data-id="' + d.data[i].id + '"><b>page id ' + d.data[i].id + '</b> ' + d.data[i].post_title + '</span><br>';
						}
					}
					resDiv.html(content);
					$('.' + A.cssPrefix + 'finded-title').click(function () {
						A.onfindedPageClick(this);
					});
					A.posts.searchpage = false;
				});
			}, 700);
		});


		$('#ms-subscriber-use-only-on-page').click(function () {
			A.settingsChanged = true;
			var block = $('.msweb-plugins-subscriber-use-only-on-page');
			if (this.checked) {
				block.show();
			}
			else {
				block.hide();
			}
		});

		var form = A.showForm(true);
		var minForm = A.showButtonToShowForm(true);

		$('[ms-subscriber-widget-for-setting]').append(form).append(minForm);

		$('input[name="color_max_background"]').wpColorPicker({
			change: function () {
				form.css({background: this.value});
				A.settingsChanged = true;
			}
		});
		$('input[name="color_max_text"]').wpColorPicker({
			change: function () {
				form.find('.msweb-subscribe__title, .msweb-subscribe__close').css({color: this.value});
				A.settingsChanged = true;
			}
		});

		$('input[name="color_min_background"]').wpColorPicker({
			change: function () {
				minForm.css({background: this.value});
				A.settingsChanged = true;
			}
		});

		$('input[name="color_min_text"]').wpColorPicker({
			change: function () {
				minForm.css({color: this.value});
				A.settingsChanged = true;
			}
		});
		$('input[name="color_max_background_button"]').wpColorPicker({
			change: function () {
				form.find('.msweb-subscribe__button').css({background: this.value});
				A.settingsChanged = true;
			}
		});
		$('input[name="color_max_button_text"]').wpColorPicker({
			change: function () {
				form.find('.msweb-subscribe__button').css({color: this.value});
				A.settingsChanged = true;
			}
		});
	});

	$('#sendertypesmtp').change(function () {
		var inp = $(this);
		var form = $('.subscriber-smtp-form');
		if (inp.is(':checked'))
			form.show();
		else
			form.hide();
	});


	$(window).on('beforeunload', function (ev) {
		if (A.a && A.settingsChanged) {
			return A.text.beforeunload;
		}
	});

	$('#mssubscriberactiveonly').change(function () {
		var tableNotActiveRows = $('#mssubscriber_subscribers_list').find('.ms-subscriber-row-user-not-active');
		if (this.checked) {
			tableNotActiveRows.hide();
		}
		else {
			tableNotActiveRows.show();
		}
	})

})(jQuery);