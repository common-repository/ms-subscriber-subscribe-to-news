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

  A.confirmation = function () {
    var interval = setInterval(function () {
      if (A.inited && window.swal) {
        swal(A.text.congratulate, '', 'success');
        clearInterval(interval);
      }
    }, 500);
  };

  $(document).ready(function () {
    A.confirmation();
  });
})(jQuery);
