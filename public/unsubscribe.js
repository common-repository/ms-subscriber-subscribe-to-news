/*
 * Author Mixail Sayapin
 *  https://ms-web.ru
 */
(function ($) {
  if (!window.msweb)
    msweb = {plugins: {msSubscribe: {}}};
  else if (!msweb.plugins.msSubscribe)
    msweb.plugins.msSubscribe = {};

  var A = msweb.plugins.msSubscribe;

  A.onUnsubscribe = function () {
    var interval = setInterval(function () {
      if (A.inited && window.swal) {
        swal(A.text.unsubscribe, '', 'success');
        clearInterval(interval);
      }
    }, 500);
  };

  $(document).ready(function () {
    A.onUnsubscribe();
  });
})(jQuery);
