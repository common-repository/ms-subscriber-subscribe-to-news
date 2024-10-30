<?php
/**
 * @package MS-Subscriber
 * @version 1.2.2
 */
/*
Plugin Name: MS-Subscriber Subscribe to news
Description: Places on all pages (or selected) widget with a form to subscribe to the newsletter. The widget can be minimized. Supports sending messages via SMTP (this option is guaranteed to deliver letters to your recipients). Remembers the form view. That is, if the user minimized the widget, it will be minimized until the user opens it himself. Therefore, it will not interfere with your visitors. This plugin stores information about your clients in the database of your site, and does not transfer it to anyone, unlike many third-party services.
Author: Mixail Sayapin
Version: 1.2.91
Author URI: https://ms-web.ru/
Text Domain: ms-subscriber-subscribe-to-news
*/

require_once 'classess/Ajax.php';
require_once 'classess/Main.php';
require_once 'classess/SendMailSmtpClass.php';

// "shared" code (repeat in all plugins) functions for all ms - plugins
if (!function_exists('msweb_MSPlugins_menu_page')) {
	function msweb_MSPlugins_menu_page()
	{
		$pluginsDirPath = plugin_dir_path(__DIR__);
		include_once 'templates/main.php';
	}
}


if (!function_exists('msweb_MSPlugins_menu')) {
	/**
	 * Одно меню на все плагины
	 */
	function msweb_MSPlugins_menu()
	{
		add_menu_page('MS-plugins', 'MS-plugins', 'manage_options', 'ms-plugins', 'msweb_MSPlugins_menu_page', 'none');
	}
}
add_action('admin_menu', 'msweb_MSPlugins_menu');

if (!function_exists('msweb_plugins_get_post_id')) {
	function msweb_plugins_get_post_id()
	{
		if (isset($_POST['action']) && $_POST['action'] == 'heartbeat')
			return;
		wp_enqueue_script('msweb-plugins', plugins_url('', __FILE__) . '/shared.js');
		wp_add_inline_script('msweb-plugins', '
		if (!window.msweb)
      msweb = {plugins: {}};
    msweb.plugins.pageId = \'' . get_the_ID() . '\'
    ');
	}
}
add_action('wp', 'msweb_plugins_get_post_id');

// end "shared" (repeat in all plugins) functions for all ms - plugins

function msweb_plugins_subscriber_confirm_email()
{
	\MS_WEB\MS_SUBSCRIBER\Main::confirm_email();
}

add_action('wp', 'msweb_plugins_subscriber_confirm_email');

function msweb_plugins_subscriber_unsubscribe()
{
	\MS_WEB\MS_SUBSCRIBER\Main::unsubscribe();
}

add_action('wp', 'msweb_plugins_subscriber_unsubscribe');


function msweb_plugins_subscriber_on_activate_callback()
{
	\MS_WEB\MS_SUBSCRIBER\Main::onActivateCallback();
}

add_action('wp', 'msweb_plugins_subscriber_on_activate_callback');

function msweb_MSSubscriber_menu() {
	add_submenu_page('ms-plugins', __('MS-Subscriber to news', 'ms-subscriber-subscribe-to-news'), 'MS-Subscriber', 'manage_options', \MS_WEB\MS_SUBSCRIBER\Main::PAGE_NAME, 'msweb_MSSubscriberPageOption');
}

add_action('admin_menu', 'msweb_MSSubscriber_menu');

function msweb_plugins_ms_subscriber_init()
{
	if (isset($_POST['action']) && $_POST['action'] == 'heartbeat')
		return;
	MS_WEB\MS_SUBSCRIBER\Main::init();
}

add_action('init', 'msweb_plugins_ms_subscriber_init');


function msweb_plugins_ms_subscriber_ajax()
{
	if (isset($_POST['action']) && $_POST['action'] == 'heartbeat')
		return;
	MS_WEB\MS_SUBSCRIBER\Ajax::callback();
}

add_action('wp_ajax_nopriv_msweb_plugins_ms_subscriber_ajax', 'msweb_plugins_ms_subscriber_ajax');
add_action('wp_ajax_msweb_plugins_ms_subscriber_ajax', 'msweb_plugins_ms_subscriber_ajax');


//add_action('plugins_loaded', 'msweb_plugins_ms_subscriber_translator');
//
//function msweb_plugins_ms_subscriber_translator()
//{
//	load_plugin_textdomain(MS_WEB\MS_SUBSCRIBER\Main::WP_TEXT_DOMAIN, false, dirname(plugin_basename(__FILE__)) . '/languages/');
//}

function msweb_MSSubscriberPageOption()
{
	if (isset($_POST['action']) && $_POST['action'] == 'heartbeat')
		return;
	MS_WEB\MS_SUBSCRIBER\Main::getOptionPage();
}

function msweb_MSSubscriber_install()
{
	MS_WEB\MS_SUBSCRIBER\Main::install();
}

register_activation_hook(__FILE__, 'msweb_MSSubscriber_install');
