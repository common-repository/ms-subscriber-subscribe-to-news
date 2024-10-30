<?php

namespace MS_WEB\MS_SUBSCRIBER;

if (current_user_can('manage_options')) {

	$smtpServer = !empty($param['smtp']['smtp_server']) ? $param['smtp']['smtp_server'] : '';
	$isYandex = $isGoogle = $isOther = $isMailRu = false;
	if ($smtpServer) {
		$isYandex = $smtpServer === 'yandex';
		$isMailRu = $smtpServer === 'mail';
		$isGoogle = $smtpServer === 'google';
		$isTimeWeb = $smtpServer === 'timeweb';
		$isOther = !$isYandex && !$isGoogle && !$isMailRu && !$isTimeWeb;
	}
	?>
	<div class="container">
		<div class="col-sm-12">
			<h4><?php _e('Settings', 'ms-subscriber-subscribe-to-news'); ?> MS-Subscriber</h4>
		</div>
		<div class="row">
			<div class="col-sm-12" style="box-shadow: 2px 11px 20px #00000052;">
				<ul class="nav nav-tabs" id="myTab" role="tablist">
					<li class="nav-item">
						<a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab"
							 aria-controls="home" aria-selected="true"><?php _e('Primary', 'ms-subscriber-subscribe-to-news'); ?></a>
					</li>
				</ul>
				<div class="tab-content" id="myTabContent">
					<div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">

						<!-- 1 section  Run newsletter -->

						<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">

							<div class="panel panel-primary">
								<div class="panel-heading minimized" role="tab" id="headingTwo" data-toggle="collapse"
										 targetId="collapseTwo">
									<h5 class="panel-title">
										<a class="collapsed" data-parent="#accordion" aria-expanded="false"
											 aria-controls="collapseTwo">
											<?php _e('Run newsletter', 'ms-subscriber-subscribe-to-news'); ?>
										</a>
									</h5>
								</div>
								<div id="collapseTwo" class="panel-collapse collapse" role="tabpanel"
										 aria-labelledby="headingTwo">

									<div class="col-sm-12 text-center" style="padding: 20px">
										<?php
										if (!$param['mce_notify_disabled']) {
											?>
											<div class="msweb-subscribe-warrning">
												<div class="text-right">
													<button class="btn btn-sm p-0" onclick="msweb.plugins.msSubscribe.newerNotifyAboutMCE();"><?php _e('Newer show this again'); ?></button>
												</div>
												<p><?php _e('Recommended for installing the TinyMCE Advanced plugin. It allows you to edit content, while setting a lot of settings, including font size in paragraphs, text color, background color, etc.', 'ms-subscriber-subscribe-to-news'); ?></p>
												<div class="text-right">
													<button class="btn btn-success btn-sm"
																	onclick="msweb.plugins.msSubscribe.onInstallMCEClick();"><?php _e('Install TinyMCE', 'ms-subscriber-subscribe-to-news'); ?></button>
												</div>
											</div>
										<?php } ?>
										<?php echo wp_editor('', $param['editor_id'], $param['editor_params']); ?>
									</div>
									<div class="msweb-plugins-subscriber-menu-item">
										<div class="row">
											<div class="col-sm-12">
												<?php
												echo Main::getTemplatesList();
												?>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="col-sm-6 text-center">
											<button class="btn btn-success"
															onclick="msweb.plugins.msSubscribe.saveTemplate()"><?php _e('Save as template', 'ms-subscriber-subscribe-to-news'); ?></button>
											<br>
											<?php
											// поставил проверку, поэтому этого больше не надо
											// _e('You must turn off and turn on again a plugin, to use this functionality', MS_WEB\MS_SUBSCRIBER\Main::WP_TEXT_DOMAIN);
											?>
										</div>
										<div class="col-sm-6 text-center">
											<button class="btn btn-success"
															onclick="msweb.plugins.msSubscribe.sendNews()"><?php _e('Send', 'ms-subscriber-subscribe-to-news'); ?></button>
										</div>
									</div>
								</div>
							</div>
						</div>
						<!-- END 1 section  Run newsletter -->


						<div class="panel panel-primary">
							<div class="panel-heading minimized" role="tab" id="headingOne" data-toggle="collapse"
									 targetId="collapseOne">
								<h5 class="panel-title">
									<a data-parent="#accordion" aria-expanded="true" aria-controls="collapseOne">
										<?php _e('The way to send letters', 'ms-subscriber-subscribe-to-news'); ?>
									</a>
								</h5>
							</div>
							<div id="collapseOne" class="panel-collapse collapse in" role="tabpanel"
									 aria-labelledby="headingOne">
								<div class="msweb-plugins-subscriber-menu-item">
									<input type="checkbox" id="sendertypesmtp" <?php
									if ($param['use_smtp']) {
										echo 'checked';
									}
									?>>
									<label for="sendertypesmtp"><?php _e('Use', 'ms-subscriber-subscribe-to-news'); ?> SMTP</label>
									<span class="dashicons dashicons-editor-help" data-toggle="tooltip"
												title="<?php _e('Send letters using your mailbox (tested on mail servers', 'ms-subscriber-subscribe-to-news'); ?> yandex.ru, mail.ru и gmail.com, smtp.beget.com, smtp.timeweb.ru)"></span>
									<div class="subscriber-smtp-form <?php
									if ($param['use_smtp']) {
										echo 'visible';
									}
									?>">
										<label>Email
											(<?php _e('mail for the domain is also suitable', 'ms-subscriber-subscribe-to-news'); ?>)</label>
										<div name="smtp-email" class="msweb-input"
												 data-placeholder="<?php
										     _e('Enter Email', 'ms-subscriber-subscribe-to-news');
										     ?>"
												 value="<?php
										     if (!empty($param['smtp']['smtp_email'])) {
											     echo $param['smtp']['smtp_email'];
										     }
										     else {
											     _e('Enter Email', 'ms-subscriber-subscribe-to-news');
										     }
										     ?>"
										validator="msweb.plugins.msSubscribe.validateEmail"></div>
										<label>Пароль</label>
										<div name="smtp-password" class="msweb-input"
												 data-placeholder="<?php
										     _e('Password', 'ms-subscriber-subscribe-to-news');
										     ?>"
												 value="<?php
										     if (!empty($param['smtp']['smtp_password'])) {
											     echo $param['smtp']['smtp_password'];
										     }
										     ?>"></div>

										<label><?php _e('Select the server where the mailbox is located', 'ms-subscriber-subscribe-to-news'); ?>
											:</label><br>
										<div class="col-sm-12">
											<select class="form-control smtp-server-select"
															onchange="msweb.plugins.msSubscribe.onchangeServer(this.value)">
												<option value=""><?php _e('Choose server', 'ms-subscriber-subscribe-to-news'); ?></option>
												<option disabled></option>
												<option
													value="yandex"<?php
												if ($isYandex) {
													echo 'selected=" selected"';
												}
												?>>
													Yandex.ru
												</option>
												<option
													value="mail"<?php
												if ($isMailRu) {
													echo 'selected=" selected"';
												}
												?>>
													Mail.ru
												</option>
												<option
													value="google"<?php
												if ($isGoogle) {
													echo 'selected=" selected"';
												}
												?>>
													Google
												</option>
												<option
													value="timeweb"<?php
												if ($isTimeWeb) {
													echo 'selected=" selected"';
												}
												?>>
													Timeweb.ru
												</option>
												<option
													value="other"<?php
												if ($isOther) {
													echo 'selected=" selected"';
												}
												?>>
													<?php _e('Other', 'ms-subscriber-subscribe-to-news'); ?>
												</option>
											</select>
											<div class="col-sm-12 msweb_ms_subscriber-smtp-server-other-options<?php if ($isOther) echo ' visible'; ?>">
												<label><?php _e('Specify the server', 'ms-subscriber-subscribe-to-news'); ?></label>
												<div name="smtp-server-other" class="msweb-input"
														 data-placeholder="<?php
												     _e('For example, smtp.yandex.ru or ssl://smtp.yandex.ru', 'ms-subscriber-subscribe-to-news');
												     ?>"
														 value="<?php
												     if (!empty($param['smtp']['smtp_server'])) {
													     echo $param['smtp']['smtp_server'];
												     }
												     ?>"></div>
												<label><?php _e('Specify the port', 'ms-subscriber-subscribe-to-news'); ?></label>
												<div name="smtp-server-other-port" class="msweb-input"
														 data-placeholder="<?php
												     _e('For example, 465', 'ms-subscriber-subscribe-to-news');
												     ?>"
														 value="<?php
												     if (!empty($param['smtp']['smtp_port'])) {
													     echo $param['smtp']['smtp_port'];
												     }
												     ?>"></div>
											</div>
										</div>

									</div>
									<p>
										<button class="btn btn-success"
														onclick="msweb.plugins.msSubscribe.saveEmail();"><?php _e('Save SMTP Settings', 'ms-subscriber-subscribe-to-news'); ?></button>
										<span class="save-email-loader-container"></span></p>
									<div class="alert alert-success hidden" data-on-save-email-mess>
										<button type="button" class="close" data-dismiss="alert" aria-label="Close">
											<span aria-hidden="true">&times;</span>
										</button>
										<?php _e('An email was sent to the site administrator\'s mailbox.', 'ms-subscriber-subscribe-to-news'); ?>
										<b
											data-subscriber-smtp-email></b> <?php _e('for check. If the letter was not delivered, check the correctness of the specified data or try to specify another mail.', 'ms-subscriber-subscribe-to-news'); ?>
									</div>
									<div class="alert alert-danger hidden" data-on-save-email-error>
									</div>
								</div>
							</div>
						</div>

						<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">

							<div class="panel panel-primary">
								<div class="panel-heading minimized" role="tab" id="headingTwo" data-toggle="collapse"
										 targetId="collapseThree">
									<h5 class="panel-title">
										<a class="collapsed" data-parent="#accordion" aria-expanded="false"
											 aria-controls="collapseThree">
											<?php _e('Widget output', 'ms-subscriber-subscribe-to-news'); ?>
										</a>
									</h5>
								</div>
								<div id="collapseThree" class="panel-collapse collapse" role="tabpanel"
										 aria-labelledby="headingThree">
									<div class="row ms-subscriber-admin-row" style="display:none;">
										<label><input type="checkbox" <?php if (Main::getOption('simpleform')) echo ' checked'; ?>> <?php _e('Use simple form, calling by shortcode'); ?>
										</label>
									</div>
									<div class="row ms-subscriber-admin-row">
										<?php if (!$param['active']) { ?>
											<div class="col-sm-12">
												<div
													class="alert alert-warning"><?php _e('This functionality available in premium version. It cost', 'ms-subscriber-subscribe-to-news'); ?> <?php echo Main::getOption('price'); ?> <?php _e('RUB', 'ms-subscriber-subscribe-to-news'); ?>
													<a href="<?php echo Main::getWebHref(array('action' => 'buy', 'plugin' => 'ms_subscriber', 'domain' => $_SERVER['SERVER_NAME'], 'callback_url' => get_site_url() . '?ms_subscriber_activate_callback=1')); ?>"><?php _e('Get upgrade', 'ms-subscriber-subscribe-to-news'); ?></a>
												</div>
											</div>
										<?php } ?>
										<div class="col-sm-6">
											<?php __('Choose widget color', 'ms-subscriber-subscribe-to-news'); ?>
											<div>
												<input name="color_min_background" type="text"
															 value="<?php echo $param['widget_opts']['color_min_background']; ?>"/>
												<label><?php _e('Minimized background', 'ms-subscriber-subscribe-to-news'); ?></label>
											</div>
											<div>
												<input name="color_min_text" type="text" value="<?php echo $param['widget_opts']['color_min_text']; ?>"/>
												<label><?php _e('Minimized text color', 'ms-subscriber-subscribe-to-news'); ?></label>
											</div>
											<div>
												<input name="color_max_background" type="text" value="<?php echo $param['widget_opts']['color_max_background']; ?>"/>
												<label><?php _e('Maximized background', 'ms-subscriber-subscribe-to-news'); ?></label>
											</div>
											<div>
												<input name="color_max_text" type="text" value="<?php echo $param['widget_opts']['color_max_text']; ?>"/>
												<label><?php _e('Maximized text color', 'ms-subscriber-subscribe-to-news'); ?></label>
											</div>
											<div>
												<input name="color_max_background_button" type="text" value="<?php echo $param['widget_opts']['color_max_background_button']; ?>"/>
												<label><?php _e('Maximized button background', 'ms-subscriber-subscribe-to-news'); ?></label>
											</div>
											<div>
												<input name="color_max_button_text" type="text" value="<?php echo $param['widget_opts']['color_max_button_text']; ?>"/>
												<label><?php _e('Maximized button text color', 'ms-subscriber-subscribe-to-news'); ?></label>
											</div>
										</div>

										<div class="col-sm-6">
											<div class="col-sm-12" ms-subscriber-widget-for-setting></div>
											<div class="col-sm-12">
												<?php // todo доп опции менять текст  ?>
											</div>
										</div>

									</div>
									<div class="row ms-subscriber-admin-row">
										<?php if (!$param['active']) { ?>
											<div class="col-sm-12">
												<div
													class="alert alert-warning"><?php _e('This functionality available in premium version. It cost', 'ms-subscriber-subscribe-to-news'); ?> <?php echo Main::getOption('price'); ?> <?php _e('RUB', 'ms-subscriber-subscribe-to-news'); ?>
													<a href="<?php echo Main::getWebHref(array('action' => 'buy', 'plugin' => 'ms_subscriber', 'domain' => $_SERVER['SERVER_NAME'], 'callback_url' => get_site_url() . '?ms_subscriber_activate_callback=1')); ?>"><?php _e('Get upgrade', 'ms-subscriber-subscribe-to-news'); ?></a>
												</div>
											</div>
										<?php } ?>
										<div class="col-sm-12">
											<?php _e('By default widget is shown on all pages', 'ms-subscriber-subscribe-to-news'); ?><br>
											<label><input type="checkbox"
																		id="ms-subscriber-use-only-on-page" <?php
												if ($param['use_on_same']['use_on_same']) {
													echo 'checked';
												}
												?>> <?php _e('Show widget on the same page', 'ms-subscriber-subscribe-to-news'); ?>
											</label>
											<div
												class="msweb-plugins-subscriber-use-only-on-page<?php
												if ($param['use_on_same']['use_on_same']) {
													echo ' visible';
												}
												?>">
												<label><?php _e('Enter page id', 'ms-subscriber-subscribe-to-news'); ?></label><br>
												<?php _e('You can specify multiple id\'s, separated by commas. For example: 12, 151, 214', 'ms-subscriber-subscribe-to-news'); ?>
												<input msweb-plugins-subscriber-output-page-id class="form-control"
															 placeholder="For example, 123" <?php
												if (!empty($param['use_on_same']['same_page_id'])) {
													echo 'value="' . $param['use_on_same']['same_page_id'] . '"';
												}
												?>><br>
												<b><?php _e('OR', 'ms-subscriber-subscribe-to-news'); ?></b><br>
												<label><?php _e('Start typing the page title', 'ms-subscriber-subscribe-to-news'); ?></label><br>
												<input msweb-plugins-subscriber-output-page-title class="form-control"
															 placeholder=""><br>
												<div class="msweb-plugins-subscriber-output-find-page-message"></div>
											</div>
										</div>

									</div>

									<div class="col-sm-12 text-center" style="padding: 20px">
										<button class="btn btn-success" onclick="msweb.plugins.msSubscribe.saveWidgetOutput()"><?php _e('Save output', 'ms-subscriber-subscribe-to-news'); ?></button>
									</div>

								</div>
							</div>
						</div>

						<!-- subscribers list -->
						<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">

							<div class="panel panel-primary">
								<div class="panel-heading minimized" role="tab" id="headingFour" data-toggle="collapse"
										 targetId="collapseFour">
									<h5 class="panel-title">
										<a class="collapsed" data-parent="#accordion" aria-expanded="false"
											 aria-controls="collapseFour">
											<?php _e('Subscribers', 'ms-subscriber-subscribe-to-news'); ?>
										</a>
									</h5>
								</div>
								<div id="collapseFour" class="panel-collapse collapse" role="tabpanel"
										 aria-labelledby="headingFour">
									<div>
										<div class="col-12">
											<label><input type="checkbox" class="form-control" id="mssubscriberactiveonly"><?php _e('Active only');?></label>
										</div>
									</div>
									<div class="row ms-subscriber-admin-row">
										<?php echo Main::getSubscribersList(); ?>
									</div>
								</div>
							</div>
						</div>
						<!-- end subscribers list -->

					</div>
				</div>
			</div>

		</div>
	</div>

<?php } ?>