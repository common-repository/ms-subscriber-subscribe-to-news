<?php
/**
 * Author Mixail Sayapin
 *  https://ms-web.ru
 */

namespace MS_WEB\MS_SUBSCRIBER;
if (current_user_can('manage_options')) {
	?>
	<div class="container">
		<div class="row">
			<h2><?php _e('List of all plugins', 'ms-subscriber-subscribe-to-news'); ?></h2>
		</div>
		<div class="row ms-plugins-main-item">
			<div class="col-sm-2 ms-plugins-main-preview">
				<span class="dashicons dashicons-admin-comments"></span>
			</div>
			<div class="col-sm-8 ms-plugins-main-description">
				<h4><?php _e('MS-Reviews', 'ms-subscriber-subscribe-to-news'); ?></h4>
				<p><?php _e('Allows you to set reviews on any page via shortcode. It will be useful to those who want to get reviews customers about the site.', 'ms-subscriber-subscribe-to-news'); ?></p>
			</div>
			<div class="col-sm-2 ms-plugins-main-preview">
				<?php
				if (is_plugin_active('ms-reviews/reviews.php')) { ?>
					<a class="btn btn-success btn-sm"
						 href="<?php echo get_admin_url(); ?>/admin.php?page=msweb-plugins-reviews"><?php _e('View'); ?></a>
				<?php }
				else if (!file_exists($pluginsDirPath . '/ms-reviews/reviews.php')) {
					$link = wp_nonce_url(admin_url('update.php?action=install-plugin&plugin=ms-reviews'), 'install-plugin_ms-reviews');
					?>
					<a class="btn btn-success btn-sm" href="<?php echo $link; ?>"><?php _e('Install'); ?></a>
				<?php }
				else {
					$path = 'ms-reviews/reviews.php';
					$link = wp_nonce_url(admin_url('plugins.php?action=activate&plugin=' . $path), 'activate-plugin_' . $path);
					?>
					<a class="btn btn-success btn-sm" href="<?php echo $link; ?>"><?php _e('Activate'); ?></a>
				<?php } ?>
			</div>
		</div>

		<div class="row ms-plugins-main-item">
			<div class="col-sm-2 ms-plugins-main-preview">
				<span class="dashicons dashicons-editor-code"></span>
			</div>
			<div class="col-sm-8 ms-plugins-main-description">
				<h4>MS-EasyJS</h4>
				<p><?php _e('It is easy to add JS code without editing any files, directly through the admin area. You can quickly add metrics counters, Google-Analitycs or callback scripts and more. And most importantly, that when you upgrade nothing will be lost.', 'ms-subscriber-subscribe-to-news'); ?></p>
			</div>
			<div class="col-sm-2 ms-plugins-main-preview">
				<?php
				if (is_plugin_active('ms-easyjs/easy-js.php')) { ?>
					<a class="btn btn-success btn-sm"
						 href="<?php echo get_admin_url(); ?>/admin.php?page=MS-EasyJS"><?php _e('View'); ?></a>
				<?php }
				else if (!file_exists($pluginsDirPath . '/ms-easyjs/ms-easyjs.php')) {
					$link = wp_nonce_url(admin_url('update.php?action=install-plugin&plugin=ms-easyjs'), 'install-plugin_ms-easyjs');
					?>
					<a class="btn btn-success btn-sm" href="<?php echo $link; ?>"><?php _e('Install'); ?></a>
				<?php }
				else {
					$path = 'ms-easyjs/ms-easyjs.php';
					$link = wp_nonce_url(admin_url('plugins.php?action=activate&plugin=' . $path), 'activate-plugin_' . $path);
					?>
					<a class="btn btn-success btn-sm" href="<?php echo $link; ?>"><?php _e('Activate'); ?></a>
				<?php } ?>
			</div>
		</div>

		<div class="row ms-plugins-main-item">
			<div class="col-sm-2 ms-plugins-main-preview">
				<span class="dashicons dashicons-email-alt"></span>
			</div>
			<div class="col-sm-8 ms-plugins-main-description">
				<h4>MS-Subscriber</h4>
				<p><?php _e('Places on any page or all widget with a subscription form for news. From the admin page, you can send out to all subscribers. SMTP support (yandex, gmail, etc.) Editing a letter using the standard WordPress editor', 'ms-subscriber-subscribe-to-news'); ?></p>
			</div>
			<div class="col-sm-2 ms-plugins-main-preview">
				<?php
				if (is_plugin_active('ms-subscriber-subscribe-to-news/ms-subscriber.php')) { ?>
					<a class="btn btn-success btn-sm"
						 href="<?php echo get_admin_url(); ?>/admin.php?page=ms-subscriber"><?php _e('View'); ?>
					</a>
				<?php }
				else if (!file_exists($pluginsDirPath . '/ms-subscriber/ms-subscriber.php')) {
					$link = wp_nonce_url(admin_url('update.php?action=install-plugin&plugin=ms-subscriber'), 'install-plugin_ms-subscriber');
					?>
					<a class="btn btn-success btn-sm" href="<?php echo $link; ?>"><?php _e('Install'); ?></a>
				<?php }
				else {
					$path = 'ms-subscriber/ms-subscriber.php';
					$link = wp_nonce_url(admin_url('plugins.php?action=activate&plugin=' . $path), 'activate-plugin_' . $path);
					?>
					<a class="btn btn-success btn-sm" href="<?php echo $link; ?>"><?php _e('Activate'); ?></a>
				<?php } ?>
			</div>
		</div>


	</div>
<?php } ?>