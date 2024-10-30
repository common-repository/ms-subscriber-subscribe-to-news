<?php

/**
 * Author Mixail Sayapin
 *  https://ms-web.ru
 */

namespace MS_WEB\MS_SUBSCRIBER;

class Ajax {

  static public function callback() {
	$action = isset($_POST['act']) ? $_POST['act'] : '';
	$answer = array('status' => 200, 'error' => '', 'message' => '', 'data' => array());
	try {
	  switch ($action) {
		case 'subscribe' : {
			if (empty($_POST['data']['email'])) {
			  throw new \Exception('Bad param');
			}
			$email = sanitize_email($_POST['data']['email']);
			$pageId = (int) ($_POST['data']['pageId']);
			if ($pageId <= 0) {
			  throw new \Exception('Bad param');
			}

			$answer['data'] = Main::setSubscriber($email, $pageId);
			break;
		  }

		case 'disable_smtp' : {
			Main::disableSmtp();
			break;
		  }
		case 'save_email': {
			if (!current_user_can('manage_options')) {
			  throw new \Exception('Access denied', 401);
			}
			$email = sanitize_email($_POST['data']['email']);
			$password = sanitize_text_field($_POST['data']['password']);
			$server = sanitize_text_field($_POST['data']['server']);
			$otherServer = sanitize_text_field($_POST['data']['otherServer']);
			$otherPort = sanitize_text_field($_POST['data']['otherPort']);
			switch ($server) {
			  case 'google':
			  case 'mail':
			  case 'yandex':
				case 'timeweb':
				{
				  $port = 465;
				  break;
				}
			  case 'other': {
				  $port = $otherPort;
					$server = $otherServer;
				  break;
				}
			}
			$answer['data']['message'] = Main::updateSmtp($email, $password, $server, $port);
			break;
		  }

		case 'send_news': {
			$toSubscribers = !empty($_POST['data']['toSubscribers']) && $_POST['data']['toSubscribers'] != 'false';
			$subject = __('Newsletter from the site', 'ms-subscriber-subscribe-to-news');
			$subject .= ' ' . get_option('blogname');
			if ($toSubscribers) {
			  $subscribers = Main::getSubscribersToEmail();
			  foreach ($subscribers as $subscriber) {
				$content = wp_unslash($_POST['data']['content']);
				Main::addUnsubscribeStr($content, $subscriber->email);
				Main::mail($subscriber->email, $subject, $content);
			  }
			} else {
			  $content = wp_unslash($_POST['data']['content']);
			  $adminEmail = get_option('admin_email');
			  Main::addUnsubscribeStr($content, $adminEmail);
			  Main::mail($adminEmail, $subject, $content);
			}
			break;
		  }

		case 'find_page' : {
			$str = !empty($_POST['data']['words']) ? sanitize_text_field($_POST['data']['words']) : '';
			$answer['data'] = Main::searchPageByTitle($str);
			$answer['data']['length'] = count($answer['data']);
			break;
		  }

		case 'save_widget_output' : {
			$useOnSame = !empty($_POST['data']['useOnSame']) && $_POST['data']['useOnSame'] != "false";
			$pageId = !empty($_POST['data']['pageId']) ? $_POST['data']['pageId'] : '';

			if ($useOnSame && empty($pageId)) {
			  throw new \Exception(__('Page id is required', 'ms-subscriber-subscribe-to-news'));
			}

			$pagesArr = explode(',', $pageId);
			foreach ($pagesArr as &$page)
			  $page = (int) $page;

			$pageId = serialize($pagesArr);

			$color_min_background = !empty($_POST['data']['color_min_background']) ? sanitize_text_field($_POST['data']['color_min_background']) : '';
			$color_min_text = !empty($_POST['data']['color_min_text']) ? sanitize_text_field($_POST['data']['color_min_text']) : '';
			$color_max_background = !empty($_POST['data']['color_max_background']) ? sanitize_text_field($_POST['data']['color_max_background']) : '';
			$color_max_text = !empty($_POST['data']['color_max_text']) ? sanitize_text_field($_POST['data']['color_max_text']) : '';
			$color_max_background_button = !empty($_POST['data']['color_max_background_button']) ? sanitize_text_field($_POST['data']['color_max_background_button']) : '';
			$color_max_button_text = !empty($_POST['data']['color_max_button_text']) ? sanitize_text_field($_POST['data']['color_max_button_text']) : '';

			Main::saveWidgetOutput($useOnSame, $pageId, $color_min_background, $color_min_text, $color_max_background, $color_max_text, $color_max_background_button, $color_max_button_text);
			break;
		  }
		case 'get_template' : {
			if (empty($_POST['data']['name']))
			  throw new \Exception('Bad param');
			$answer['shtml'] = Main::getTemplate(sanitize_text_field($_POST['data']['name']));
			break;
		  }
		case 'savetemplate' : {
		  if (empty($_POST['data']['name']))
			  throw new \Exception('Bad param');
			Main::saveTemplate(sanitize_text_field($_POST['data']['name']), $_POST['data']['content']);
			break;
		  }

		  case 'disable_notify_mce' : {
				Main::setOption('notify_mce_disabled', true);
				break;
		  }
		default: {
			throw new \Exception('Bad param');
		  }
	  }
	} catch (\Exception $e) {
	  $answer['error'] = $e->getMessage();
	  $answer['line'] = 'line ' . $e->getLine();
	  $answer['status'] = $e->getCode();
	}
	echo json_encode($answer);

	wp_die();
  }

}
