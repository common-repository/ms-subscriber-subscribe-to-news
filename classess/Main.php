<?php

namespace MS_WEB\MS_SUBSCRIBER;

/**
 * Author Mixail Sayapin
 *  https://ms-web.ru
 */
class Main {

	const DOMAIN = 'ms-subscriber';
	const MAIN_PAGE_NAME = 'ms-plugins'; // главная страница со всеми плагинами
	const PAGE_NAME = 'ms-subscriber'; // страница плагина
	const PREFIX = 'msweb_ms_subscriber';
	const EDITOR_ID = 'msweb_ms_subscriber-editor';
	const PRIMARY_TABLE = 'ms_subscriber';
	const OPTIONS_TABLE = 'ms_subscriber_options';
	const TEMPLATES_TABLE = 'ms_subscriber_templates';
	const DB_VERSION = '1.0';
	const WP_TEXT_DOMAIN = 'ms-subscriber-subscribe-to-news';

	static public $options = array();

	static public function install() {
		global $wpdb;

		$sql = "CREATE TABLE IF NOT EXISTS " . $wpdb->prefix . self::PRIMARY_TABLE . " (
							  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
							  `time` bigint(11) DEFAULT '0' NOT NULL,
							  `email` text NOT NULL,
							  `subscribe_page` text NOT NULL,
							  `verification` text NOT NULL,
							  `active` text NOT NULL,
							  UNIQUE KEY id (id)
						) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
		$wpdb->query($sql);

		$sql = "CREATE TABLE IF NOT EXISTS " . $wpdb->prefix . self::OPTIONS_TABLE . " (
							  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
							  `option_name` text NOT NULL,
							  `option_value` text NOT NULL,
							  UNIQUE KEY id (id)
						) ENGINE=InnoDB DEFAULT CHARSET=utf8;";


		$wpdb->query($sql);

		$sql = "CREATE TABLE IF NOT EXISTS " . $wpdb->prefix . self::TEMPLATES_TABLE . " (
							  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
							  `template_name` text NOT NULL,
							  `content` text NOT NULL,
							  UNIQUE KEY id (id)
						) ENGINE=InnoDB DEFAULT CHARSET=utf8;";

		$wpdb->query($sql);

		self::setOption('version', '1.1.2');
	}

	static public function init() {
		// todo сделать так же для всех плагинов чтобы исправить console.error при подключении в админке пока не залогинился подключить jQuery
		if (
			isset($_GET['page']) &&
			($_GET['page'] == self::PAGE_NAME || $_GET['page'] == self::MAIN_PAGE_NAME) &&
			is_admin() &&
			current_user_can('manage_options')
		) {
			self::getPublicJSCSS();
			self::getAdminJSCSS();
		}
		else if (!is_admin()) {
			if ($_SERVER['SCRIPT_NAME'] != 'wp-login.php')
				self::getPublicJSCSS();
		}
		if (is_admin()) {
			wp_enqueue_style(self::MAIN_PAGE_NAME . 'admin_shared', self::getUrl() . '/shared.css', null, 2);
		}
		$opts = self::getOption(array('last_price_update', 'a'));
		$lastPriceUpdate = (int)$opts['last_price_update'];
		if (!$lastPriceUpdate || ($lastPriceUpdate + 3600 * 24) < time()) {
			$a = self::wr();
		}
		//if (isset($a) || (bool)$opts['a']) {
		wp_add_inline_script(self::PREFIX . 'JSpublic', 'msweb.plugins.msSubscribe.a = 1;', 'after');
		//}
		wp_add_inline_script(self::PREFIX . 'JSpublic', 'msweb.plugins.msSubscribe.buyHref = \'' . self::getWebHref(array('action' => 'buy', 'plugin' => 'ms_subscriber', 'domain' => $_SERVER['SERVER_NAME'], 'callback_url' => get_site_url() . '?ms_subscriber_activate_callback=1')) . '\';', 'after');
	}

	static public function getPublicJSCSS() {

		$debug = true;
		if ($debug) {
			$ver = time();
		}
		else {
			$ver = 1;
		}
		wp_enqueue_script('jquery');
		wp_enqueue_style(self::PREFIX . 'CSSpublic', self::getUrl() . '/public/style.css', null, $ver);
		wp_enqueue_style(self::PREFIX . 'CSSpublicAnimate', self::getUrl() . '/public/animate.css', null, $ver);
		wp_enqueue_script(self::PREFIX . 'JSpublic', self::getUrl() . '/public/main.js', null, $ver, true);

		$text = self::getJsText();
		$opts = self::getOption(array('use_on_same', 'same_page_id'));
		$opts['same_page_id'] = $opts['same_page_id'] ? unserialize($opts['same_page_id']) : array();
		$opts['same_page_id'] = json_encode($opts['same_page_id']);
		wp_add_inline_script(self::PREFIX . 'JSpublic', '
		if (!window.msweb)
      msweb = {plugins: {msSubscribe: {}}};
    else
      msweb.plugins.msSubscribe = {};
	  
	  msweb.plugins.msSubscribe.directory = "' . self::getUrl() . '";
	  msweb.plugins.msSubscribe.text = \'' . $text . '\';
	  msweb.plugins.msSubscribe.widgetOptions = \'' . self::getWidgetOptions() . '\';
	  msweb.plugins.msSubscribe.isAdmin = \'' . is_admin() . '\';
	  msweb.plugins.msSubscribe.cssPrefix = \'' . self::PREFIX . '\';
	  msweb.plugins.msSubscribe.editorId = \'' . self::EDITOR_ID . '\';
	  msweb.plugins.msSubscribe.useOnSame = \'' . $opts['use_on_same'] . '\';
	  msweb.plugins.msSubscribe.same_page_id = \'' . $opts['same_page_id'] . '\';
	  msweb.plugins.msSubscribe.templateNames = JSON.parse(\'' . json_encode(self::getTemplatesNames()) . '\');
	  msweb.plugins.ajaxUrl = \'' . admin_url('admin-ajax.php') . '\';
	  
    ', 'before');

		wp_enqueue_script('sweetalert', self::getUrl() . '/public/sweetalert.min.js', null, $ver, true);
	}

	static public function getUrl() {
		return str_replace('/classess', '', plugins_url('', __FILE__));
	}

	static public function getJsText() {
		global $wpdb;
		// заголовок окна
		$title = __('Be the first to know', 'ms-subscriber-subscribe-to-news') . '!';
		// текст при успешной подписке
		$congratulations = __('An email has been sent to you with a link to confirm your email. Follow the link in the letter to receive the newsletter.', 'ms-subscriber-subscribe-to-news');
		$close = __('close', 'ms-subscriber-subscribe-to-news');

		$res = self::getOption(array('title', 'congratulations', 'close'));

		foreach ($res as $optionName => $optionValue)
			switch ($optionName) {
				case 'title' :
					$title = $optionValue ? $optionValue : $title;
					break;
				case 'congratulations' :
					$congratulations = $optionValue ? $optionValue : $congratulations;
					break;
				case 'close' :
					$close = $optionValue ? $optionValue : $close;
					break;
			}

		return json_encode(array(
			'title' => $title,
			'congratulations' => $congratulations,
			'close' => $close,
			'placeholderemail' => __('Your e-mail', 'ms-subscriber-subscribe-to-news'),
			'subscribe' => __('Subscribe', 'ms-subscriber-subscribe-to-news'),
			'subscribeText' => __('Subscribe to news', 'ms-subscriber-subscribe-to-news'),
			'emptyresult' => __('Nothing found', 'ms-subscriber-subscribe-to-news'),
			'finded' => __('finded', 'ms-subscriber-subscribe-to-news'),
			'success' => __('Success', 'ms-subscriber-subscribe-to-news'),
			'enterpageid' => __('You must enter page id or find and choose page by title before save. Page id is required', 'ms-subscriber-subscribe-to-news'),
			'chooseone' => __('choose one', 'ms-subscriber-subscribe-to-news'),
			'comingsoon' => __('This functionality will be available in future releases.', 'ms-subscriber-subscribe-to-news'),
			'avt' => __('Free version'),
			'onsubscribemess1' => __('An email has been sent to', 'ms-subscriber-subscribe-to-news'),
			'onsubscribemess2' => __('Follow the link in email to subscribe to the newsletter.', 'ms-subscriber-subscribe-to-news'),
			'congratulate' => __("Congratulations! Subscription successful!", 'ms-subscriber-subscribe-to-news'),
			'unsubscribe' => __("You have successfully unsubscribed from the newsletter.", 'ms-subscriber-subscribe-to-news'),
			'error' => __('Error', 'ms-subscriber-subscribe-to-news'),
			'novisualeditorfound' => __('No visual editor found. Try to refresh the page. If this does not help, please contact the plugin support.', 'ms-subscriber-subscribe-to-news'),
			'entertext' => __('Enter the text of the letter', 'ms-subscriber-subscribe-to-news'),
			'whatactiontoperform' => __('What action to perform', 'ms-subscriber-subscribe-to-news'),
			'lettertosubscribers' => __('Letter to subscribers', 'ms-subscriber-subscribe-to-news'),
			'lettertoadministrator' => __('Sample letter to administrator', 'ms-subscriber-subscribe-to-news'),
			'paidversion' => __('The functionality is available in the paid version', 'ms-subscriber-subscribe-to-news') . ' (' . self::getOption('price') . ' RUB)',
			'getupgrade' => __('Get upgrade', 'ms-subscriber-subscribe-to-news'),
			'wrongvalue' => __('Check the correctness of the entered data', 'ms-subscriber-subscribe-to-news'),
			'duplicateshavebeenremoved' => __('duplicates have been removed', 'ms-subscriber-subscribe-to-news'),
			'beforeunload' => __('Leave the page? Changes made will not be saved.', 'ms-subscriber-subscribe-to-news'),
			'entertemplatename' => __('Enter template name', 'ms-subscriber-subscribe-to-news'),
			'yes' => __('Yes'),
			'no' => __('No'),
			'save' => __('Save'),
			'replacetemplate' => __('Template exist. Replace?', 'ms-subscriber-subscribe-to-news'),
			'replacecontent' => __('Replace content?', 'ms-subscriber-subscribe-to-news')
		));
	}

	/**
	 * @param $options mixed - str or array
	 */
	static public function getOption($options, $refresh = false) {
		if (!$refresh && !empty(self::$options)) {
			$res = array();
			if (is_array($options)) {
				foreach ($options as $option) {
					if (array_key_exists($option, self::$options))
						$res[$option] = self::$options[$option];
					else
						$res[$option] = '';
				}
			}
			else {
				$res = array_key_exists($options, self::$options) ? self::$options[$options] : '';
			}
			return $res;
		}

		global $wpdb;
		$query = "SELECT * FROM " . $wpdb->prefix . self::OPTIONS_TABLE;
		$res = $wpdb->get_results($query, ARRAY_A);
		if (!empty($res)) {
			foreach ($res as $opt) {
				self::$options[$opt['option_name']] = $opt['option_value'];
			}
			return self::getOption($options);
		}
		else {
			$res = array();
			if (is_array($options))
				foreach ($options as $option)
					$res[$option] = '';
			else
				$res = '';
		}
		return $res;
	}

	static public function getWidgetOptions($asArray = false) {
		$optsToRecive = array(
			'color_min_background',
			'color_min_text',
			'color_max_background',
			'color_max_text',
			'color_max_background_button',
			'color_max_button_text'
		);

		$defaultColors = array(
			'color_min_background' => '#3F51B5',
			'color_min_text' => '#fff',
			'color_max_background' => '#3F51B5',
			'color_max_text' => '#fff',
			'color_max_background_button' => '#4CAF50',
			'color_max_button_text' => '#fff',
		);
		$res = self::getOption($optsToRecive);
		foreach ($res as $optName => $optVal) {
			if (!$optVal)
				$res[$optName] = $defaultColors[$optName];
		}
		return $asArray ? $res : json_encode($res);
	}

	static public function getTemplatesNames() {
		if (!current_user_can('manage_options'))
			return array();
		global $wpdb;
		$res = $wpdb->get_results("SELECT template_name FROM " . $wpdb->prefix . self::TEMPLATES_TABLE);
		$res2 = array();
		foreach ($res as $item) {
			$res2[] = $item->template_name;
		}
		return $res2;
	}

	static public function getAdminJSCSS() {
		$debug = true;
		if ($debug) {
			$ver = time();
		}
		else {
			$ver = 1;
		}
		wp_enqueue_script('jquery');
		wp_enqueue_style(self::PREFIX . 'CSSadmin', self::getUrl() . '/admin/style.css', null, $ver);
		wp_enqueue_style('bootstrap', self::getUrl() . '/bootstrap/css/bootstrap.css');
		wp_enqueue_script('msweb-um', self::getUrl() . '/libraries/msweb-um/msweb-um.js', null, $ver, true);
		wp_enqueue_script('msweb-inputs', self::getUrl() . '/libraries/msweb-um/msweb-inputs.js', null, $ver, true);
		wp_enqueue_script(self::PREFIX . 'JSadmin', self::getUrl() . '/admin/main.js', null, $ver, true);
		wp_enqueue_script('bootstrap', self::getUrl() . '/bootstrap/js/bootstrap.js', null, $ver, true);
		wp_enqueue_script('bootstrapbundle', self::getUrl() . '/bootstrap/js/bootstrap.bundle.js', null, $ver, true);
		wp_enqueue_script('sweetalert', self::getUrl() . '/public/sweetalert.min.js', null, $ver, true);

		wp_add_inline_script(self::PREFIX . 'JSadmin', '
				msweb.plugins.adminURL = \'' . admin_url() . '\';	
			', 'after');

		wp_enqueue_script('wp-color-picker');
		wp_enqueue_style('wp-color-picker');
	}

	static public function wr() {
		//self::setOption('a', '1');
		return true;
		$res = wp_remote_get(self::getWebHref(array(
			'domain' => $_SERVER['SERVER_NAME'],
			'plugin' => 'ms_subscriber',
			'action' => 'is_active'
		)));

		$res = wp_remote_retrieve_body($res);
		$res = json_decode($res, true);
		if ($res && $res['data']['status']) {
			self::setOption('a', '1');
			$a = 1;
		}
		else {
			self::setOption('a', '0');
			$res = wp_remote_get(self::getWebHref(array('action' => 'get_price', 'plugin' => 'ms_subscriber')));
			$res = wp_remote_retrieve_body($res);
			$res = json_decode($res, true);
			if ($res) {
				self::setOption('price', sanitize_text_field($res['data']['price']));
			}
		}
		self::setOption('last_price_update', time());
		return isset($a);
	}

	static public function getWebHref($params) {
		$href = 'https://ms-web.ru/plugins/buy/?';
		foreach ($params as $name => $param) {
			$href .= '&' . $name . '=' . $param;
		}

		return $href;
	}

	static public function setOption($optName, $optValue) {
		global $wpdb;
		$res = $wpdb->get_var("SELECT option_name FROM " . $wpdb->prefix . self::OPTIONS_TABLE . " WHERE option_name = '$optName'");
		if ($res) {
			$wpdb->query("UPDATE " . $wpdb->prefix . self::OPTIONS_TABLE . " SET option_value = '$optValue' WHERE option_name='$optName'");
		}
		else {
			$wpdb->query("INSERT INTO " . $wpdb->prefix . self::OPTIONS_TABLE . " (option_name, option_value) VALUES ('$optName', '$optValue')");
		}
		self::$options[$optName] = $optValue;
	}

	static public function getOptionPage() {
		$param = array();
		$param['use_smtp'] = (bool)Main::getOption('use_smtp');
		$param['smtp'] = Main::getOption(array('smtp_email', 'smtp_password', 'smtp_server', 'smtp_port'));
		$param['editor_id'] = self::EDITOR_ID;
		$param['editor_params'] = array(
			'drag_drop_upload' => true,
		);
		$param['use_on_same'] = self::getOption(array('use_on_same', 'same_page_id'));
		$param['use_on_same']['same_page_id'] = is_string($param['use_on_same']['same_page_id']) && $param['use_on_same']['same_page_id'] ? unserialize($param['use_on_same']['same_page_id']) : array();
		$str = implode(', ', $param['use_on_same']['same_page_id']);
		$param['use_on_same']['same_page_id'] = $str;
		//$param['active'] = (bool)self::getOption('a');
		$param['active'] = true;
		$param['mce_installed'] = in_array('tinymce-advanced/tinymce-advanced.php', apply_filters('active_plugins', get_option('active_plugins')));
		$param['mce_active'] = is_plugin_active('tinymce-advanced/tinymce-advanced.php');
		$param['mce_notify_disabled'] = self::getOption('notify_mce_disabled') || $param['mce_installed'];
		$param['widget_opts'] = self::getWidgetOptions(true);
		include_once(self::getDir() . '/templates/admin-page.php');
	}

	static public function getDir() {
		$d = plugin_dir_path(__FILE__);
		$d = str_replace('\\', '/', $d);

		return str_replace('/classess', '', $d);
	}

	static public function disableSmtp() {
		global $wpdb;
		if ($wpdb->get_var("SELECT option_value FROM " . $wpdb->prefix . self::OPTIONS_TABLE . " WHERE option_name = 'use_smtp'") !== null) {
			$wpdb->query("UPDATE " . $wpdb->prefix . self::OPTIONS_TABLE . " SET option_value='0' WHERE option_name = 'use_smtp'");
		}
		else {
			$wpdb->query("INSERT INTO " . $wpdb->prefix . self::OPTIONS_TABLE . " (option_name, option_value) VALUES ('use_smtp', '0')");
		}
	}

	/**
	 * @param string $email
	 * @param string $password
	 * @param $server
	 * @param $port
	 * @return bool|string
	 */
	static public function updateSmtp($email = '', $password = '', $server, $port) {
		global $wpdb;

		if ($wpdb->get_var("SELECT option_value FROM " . $wpdb->prefix . self::OPTIONS_TABLE . " WHERE option_name = 'use_smtp'") !== null) {
			$wpdb->query("UPDATE " . $wpdb->prefix . self::OPTIONS_TABLE . " SET option_value='1' WHERE option_name = 'use_smtp'");
		}
		else {
			$wpdb->query("INSERT INTO " . $wpdb->prefix . self::OPTIONS_TABLE . " (option_name, option_value) VALUES ('use_smtp', '1')");
		}

		if ($wpdb->get_var("SELECT option_value FROM " . $wpdb->prefix . self::OPTIONS_TABLE . " WHERE option_name = 'smtp_email'") !== null) {
			$wpdb->query("UPDATE " . $wpdb->prefix . self::OPTIONS_TABLE . " SET option_value='$email' WHERE option_name = 'smtp_email'");
		}
		else {
			$wpdb->query("INSERT INTO " . $wpdb->prefix . self::OPTIONS_TABLE . " (option_name, option_value) VALUES ('smtp_email', '$email')");
		}

		if ($wpdb->get_var("SELECT option_value FROM " . $wpdb->prefix . self::OPTIONS_TABLE . " WHERE option_name = 'smtp_password'") !== null) {
			$wpdb->query("UPDATE " . $wpdb->prefix . self::OPTIONS_TABLE . " SET option_value='$password' WHERE option_name = 'smtp_password'");
		}
		else {
			$wpdb->query("INSERT INTO " . $wpdb->prefix . self::OPTIONS_TABLE . " (option_name, option_value) VALUES ('smtp_password', '$password')");
		}

		if ($wpdb->get_var("SELECT option_value FROM " . $wpdb->prefix . self::OPTIONS_TABLE . " WHERE option_name = 'smtp_server'") !== null) {
			$wpdb->query("UPDATE " . $wpdb->prefix . self::OPTIONS_TABLE . " SET option_value='$server' WHERE option_name = 'smtp_server'");
		}
		else {
			$wpdb->query("INSERT INTO " . $wpdb->prefix . self::OPTIONS_TABLE . " (option_name, option_value) VALUES ('smtp_server', '$server')");
		}

		if ($wpdb->get_var("SELECT option_value FROM " . $wpdb->prefix . self::OPTIONS_TABLE . " WHERE option_name = 'smtp_port'") !== null) {
			$wpdb->query("UPDATE " . $wpdb->prefix . self::OPTIONS_TABLE . " SET option_value='$port' WHERE option_name = 'smtp_port'");
		}
		else {
			$wpdb->query("INSERT INTO " . $wpdb->prefix . self::OPTIONS_TABLE . " (option_name, option_value) VALUES ('smtp_port', '$port')");
		}


		self::getServerFromAbbrev($server);

		$blogName = get_option('blogname');

		$mailer = new SendMailSmtpClass($email, $password, $server, array($blogName, $email), $port);

		$adminEmail = get_option('admin_email');

		try {
			$res = $mailer->send($adminEmail, __('Change mail server for newsletter', 'ms-subscriber-subscribe-to-news'), '
		<h4>' . __('Hello', 'ms-subscriber-subscribe-to-news') . '!</h4>
		<p>' . __('The site', 'ms-subscriber-subscribe-to-news') . ' ' . $blogName . ' ' . __(' has been changed SMTP settings for the MS-Subscriber plugin. Now the mailing will be from the address ', 'ms-subscriber-subscribe-to-news') . ' <b>' . $email . '</b>. ' . __('If you are reading this message, then everything is set up correctly.', 'ms-subscriber-subscribe-to-news') . '</p>
', array($blogName, $email));
		} catch (\Exception $exception) {
			$res = false;
		}
		return $res;
	}

	static public function getServerFromAbbrev(&$server) {
		switch ($server) {
			case 'yandex' :
			{
				$server = 'ssl://smtp.yandex.ru';
				break;
			}
			case 'google':
			{
				$server = 'ssl://smtp.gmail.com';
				break;
			}

			case 'mail':
			{
				$server = 'ssl://smtp.mail.ru';
				break;
			}
			case 'timeweb' : {
				$server = 'ssl://smtp.timeweb.ru';
				break;
			}
		}

		return $server;
	}

	static public function getSubscribersToEmail() {
		global $wpdb;

		return $wpdb->get_results("SELECT email FROM " . $wpdb->prefix . self::PRIMARY_TABLE . " WHERE active = '1'");
	}

	static public function disableSubscriber($email) {
		global $wpdb;
		$wpdb->query("UPDATE " . $wpdb->prefix . self::PRIMARY_TABLE . " SET active = '0' WHERE email = '$email'");
	}

	static public function enableSubscriber($email) {
		global $wpdb;
		$time = time();
		$wpdb->query("UPDATE " . $wpdb->prefix . self::PRIMARY_TABLE . " SET `active` = 1, `time`='$time' WHERE `email` = '$email'");
	}

	static public function searchPageByTitle($title) {
		global $wpdb;

		return $wpdb->get_results("SELECT id, post_title FROM " . $wpdb->prefix . "posts WHERE post_title LIKE '%$title%' and post_status='publish'");
	}

	static public function saveWidgetOutput($useOnSame, $pageId, $color_min_background, $color_min_text, $color_max_background, $color_max_text, $color_max_background_button, $color_max_button_text) {
		global $wpdb;
		$optsToRecive = array(
			'use_on_same',
			'same_page_id',
			'color_min_background',
			'color_min_text',
			'color_max_background',
			'color_max_text',
			'color_max_background_button',
			'color_max_button_text'
		);
		$optsNewValues = array(
			'use_on_same' => $useOnSame,
			'same_page_id' => $pageId,
			'color_min_background' => $color_min_background,
			'color_min_text' => $color_min_text,
			'color_max_background' => $color_max_background,
			'color_max_text' => $color_max_text,
			'color_max_background_button' => $color_max_background_button,
			'color_max_button_text' => $color_max_button_text
		);

		$opts = self::getOption($optsToRecive, true);

		foreach ($optsToRecive as $item) {
			if ($opts[$item] !== '') {
				$wpdb->query("UPDATE " . $wpdb->prefix . self::OPTIONS_TABLE . " SET  option_value='{$optsNewValues[$item]}' WHERE option_name = '$item'");
			}
			else {
				$wpdb->query("INSERT INTO " . $wpdb->prefix . self::OPTIONS_TABLE . " (option_name, option_value) VALUES ('$item', '{$optsNewValues[$item]}')");
			}
		}
	}

	static public function confirm_email() {
		if (isset($_GET['ms_subscriber_confirmation_code']) && isset($_GET['ms_subscriber_confirmation_email'])) {
			$email = sanitize_email($_GET['ms_subscriber_confirmation_email']);
			$code = sanitize_text_field($_GET['ms_subscriber_confirmation_code']);
			global $wpdb;
			$res = $wpdb->get_var("SELECT active FROM " . $wpdb->prefix . self::PRIMARY_TABLE . " WHERE email = '$email' AND verification = '$code'");
			if ($res !== null) {
				$wpdb->query("UPDATE " . $wpdb->prefix . self::PRIMARY_TABLE . " SET active = '1' WHERE email = '$email' AND verification = '$code'");
				wp_enqueue_script(self::PREFIX . 'confirmation', self::getUrl() . '/public/confirmation.js', null, '', true);
			}
		}
	}

	static public function unsubscribe() {
		if (isset($_GET['ms_unsubscribe']) && isset($_GET['email'])) {
			global $wpdb;
			$email = sanitize_email($_GET['email']);
			$wpdb->query("UPDATE " . $wpdb->prefix . self::PRIMARY_TABLE . " SET active = '0' WHERE email = '$email'");
			wp_enqueue_script(self::PREFIX . 'unsubscribe', self::getUrl() . '/public/unsubscribe.js', null, '', true);
		}
	}

	/**
	 * Добавляет подписчика, но не включает его, а отправляет письмо с подтверждением подписки.
	 *
	 * @param $email
	 */
	static public function setSubscriber($email, $pageId) {
		global $wpdb;
		$time = time();
		$confirmation = self::getRandomString();

		if (!$wpdb->get_var("SELECT id FROM " . $wpdb->prefix . self::PRIMARY_TABLE . " WHERE email = '$email'")) {
			$wpdb->query("INSERT INTO " . $wpdb->prefix . self::PRIMARY_TABLE . " (`email`, `time`, `active`, `verification`, `subscribe_page`) VALUES ('$email', '$time', '0', '$confirmation', '$pageId')");
		}
		else {
			$wpdb->query("UPDATE " . $wpdb->prefix . self::PRIMARY_TABLE . " SET `time`='$time', `subscribe_page` = '$pageId', `verification`='$confirmation' WHERE `email` = '$email'");
		}
		$subject = __('Subscribe to news confirmation', 'ms-subscriber-subscribe-to-news');
		$mess = __('Hello', 'ms-subscriber-subscribe-to-news') . '!<br>';
		$mess .= __('You or someone else indicated your e-mail to subscribe to the news site', 'ms-subscriber-subscribe-to-news');
		$mess .= ' <b>' . get_option('blogname') . '</b> ';
		$mess .= __('To confirm the subscription to the news, follow the link:', 'ms-subscriber-subscribe-to-news');


		$url = get_permalink($pageId);
		if (strpos($url, '?') !== false)
			$url .= '&';
		else
			$url .= '?';
		$url .= 'ms_subscriber_confirmation_code=' . $confirmation . '&ms_subscriber_confirmation_email=' . $email;

		$mess .= ' <a href="' . $url . '" target="_blank">' . $url . '</a><br><br>';
		$mess .= __('If it was not you, then just ignore this letter.', 'ms-subscriber-subscribe-to-news');


		return self::mail($email, $subject, $mess);
	}

	static public function getRandomString($length = 20) {
		$chars = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm";
		$charsLength = strlen($chars);
		$res = '';
		$x = 0;
		while ($x < $length) {
			$res .= $chars[rand(0, $charsLength)];
			$x++;
		}

		return $res;
	}

	static public function mail($mailto, $subject, $message) {
		$blogName = get_option('blogname');
		$adminEmail = get_option('admin_email');
		if ((bool)self::getOption('use_smtp')) {
			$data = self::getOption(array('smtp_email', 'smtp_password', 'smtp_server', 'smtp_port'));
			$data['smtp_server'] = self::getServerFromAbbrev($data['smtp_server']);
			$mailer = new SendMailSmtpClass($data['smtp_email'], $data['smtp_password'], $data['smtp_server'], array(
				$blogName,
				$data['smtp_email']
			), $data['smtp_port']);
			$res = $mailer->send($mailto, $subject, $message, array($blogName, $data['smtp_email']));
		}
		else {
			$headers = "MIME-Version: 1.0\r\n";
			$headers .= "Content-type: text/html; charset=utf-8\r\n";
			$headers .= "From: " . $blogName . " <" . $adminEmail . ">\r\n";
			$headers .= "Reply-To: \"$adminEmail\" <$adminEmail>";
			$headers .= "To: <" . $mailto . ">\r\n";
			$res = wp_mail($mailto, $subject, $message, $headers);
		}

		$result = array();
		$result['result'] = is_bool($res) && $res;

		if (!$result['result']) {
			$result['error'] = mb_convert_encoding($res, 'utf-8', mb_detect_encoding($res));
		}

		return $result;
	}

	static public function onActivateCallback() {
		if (isset($_GET['ms_subscriber_activate_callback'])) {
			self::wr();
		}
	}

	static public function addUnsubscribeStr(&$str, $email) {
		$str .= '<div>______________________________________________________</div>';
		$str .= '<div>' . __('If you no longer want to receive news from our website, click', 'ms-subscriber-subscribe-to-news');
		$str .= ' ' . '<a href="' . get_home_url() . '?ms_unsubscribe=true&email=' . $email . '" target="_blank">';
		$str .= __('here', 'ms-subscriber-subscribe-to-news');
		$str .= '</a>';
		$str .= '</div>';
	}

	static public function getSubscribersList() {
		global $wpdb;
		$subscribers = $wpdb->get_results("SELECT * FROM " . $wpdb->prefix . self::PRIMARY_TABLE);
		$shtml = '<table class="table table-bordered" id="mssubscriber_subscribers_list">';
		foreach ($subscribers as $subscriber) {
			$isActive = $subscriber->active > 0;
			$shtml .= '<tr';
			if (!$isActive) {
				$shtml .= ' class="ms-subscriber-row-user-not-active"';
			}
			$shtml .= '>';
			$shtml .= '<td>' . $subscriber->email . '</td>';
			$shtml .= '<td>' . date('Y-m-d', $subscriber->time) . '</td>';
			$shtml .= '<td>';
			if ($isActive)
				$shtml .= __('Active', 'ms-subscriber-subscribe-to-news');
			else
				$shtml .= __('Non active', 'ms-subscriber-subscribe-to-news');
			$shtml .= '</td>';
			$shtml .= '</tr>';
		}
		$shtml .= '</table>';
		return $shtml;
	}

	static public function getTemplatesList() {
		$list = self::getTemplatesNames();
		if (empty($list))
			return __('No templates found', 'ms-subscriber-subscribe-to-news');

		$shtml = '<label>' . __('You can select template') . '</label>';
		$shtml .= '<select class="form-control" name="templatename" onchange="msweb.plugins.msSubscribe.changeTemplate(this.value)">';
		$shtml .= '<option value=""></option>';
		foreach ($list as $item) {
			$shtml .= '<option value="' . $item . '">' . $item . '</option>';
		}
		$shtml .= '</select>';
		return $shtml;
	}

	static public function getTemplate($name) {
		global $wpdb;
		$res = $wpdb->get_var("SELECT content FROM	" . $wpdb->prefix . self::TEMPLATES_TABLE . " WHERE template_name = '$name'");
		if (!$res)
			return '';
		else {
			return wp_unslash(htmlspecialchars_decode($res));
		}
	}

	static public function saveTemplate($name, $content) {
		global $wpdb;
		$ver = self::getOption('version');
		if (!$ver || (string)$ver < '1.1.2') {
			$sql = "CREATE TABLE IF NOT EXISTS " . $wpdb->prefix . self::TEMPLATES_TABLE . " (
							  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
							  `template_name` text NOT NULL,
							  `content` text NOT NULL,
							  UNIQUE KEY id (id)
						) ENGINE=InnoDB DEFAULT CHARSET=utf8;";

			$wpdb->query($sql);
		}

		$content = htmlspecialchars($content);
		$list = self::getTemplatesNames();
		$exist = false;
		foreach ($list as $item) {
			if ($item == $name) {
				$exist = true;
				break;
			}
		}
		if ($exist) {
			$wpdb->query("UPDATE " . $wpdb->prefix . self::TEMPLATES_TABLE . " SET content = '$content' WHERE template_name = '$name'");
		}
		else {
			$wpdb->query("INSERT INTO " . $wpdb->prefix . self::TEMPLATES_TABLE . " (template_name, content) VALUES ('$name', '$content') ");
		}
	}


}
