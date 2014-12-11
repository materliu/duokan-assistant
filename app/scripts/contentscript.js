'use strict';

;(function () {

  // 多看的页面本身使用了jquery， 所以可以jQuery

  var cookie = {
    set: function (key, value, options) {

      options = options || {};

      if (value === null) {
        options.expires = -1;
      }

      var days = options.expires;
      if (typeof options.expires === 'number') {
        var t = options.expires = new Date();
        t.setDate(t.getDate() + days);
      } else if (typeof options.expires === 'string') {
        options.expires = new Date(days);
      }

      value = String(value);

      return document.cookie = [
        encodeURIComponent(key), '=', encodeURIComponent(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path ? '; path=' + options.path : '',
        options.domain ? '; domain=' + options.domain : '',
        options.secure ? '; secure' : ''
      ].join('')
    },
    get: function (n) {
      var m = document.cookie.match(new RegExp("(^| )" + n + "=([^;]*)(;|$)"));
      return !m ? "" : decodeURIComponent(m[2]);
    }
  };

  function init() {

    // 拿到请求书籍情况的必须参数
    var device_id = cookie.get('device_id'),
        app_id = cookie.get('app_id'),
        token = cookie.get('token'),
        user_id = cookie.get('user_id');

    // 遍历搜索结果中的所有书籍
    var $bookList = $('.u-list.j-list').find('li');

    // 利用闭包对请求和请求返回进行映射， 这里我们使用book_uuid来唯一标识
    function success(book_uuid_param) {
      var book_uuid = book_uuid_param;

      return function (data, textStatus, jqXHR) {

        var $singleBookL = $bookList.filter('[data-id="' + book_uuid + '"]'),
            $priceSec = $singleBookL.find('.u-price');
        if (data.result === 10002) {
          // 订单不存在
          $priceSec.append('<b class="bookshelf-has-flag bookshelf-has-not" title="此书尚未收纳进你的书架">未收</b>');
        } else if (data.result === 0) {
          // 此书已经加入书架了
          $priceSec.append('<b class="bookshelf-has-flag bookshelf-has" title="此书已经收纳进你的书架">已收</b>');
        }
      }
    }

    // 当前页搜索结果中的每一本书
    $.each($bookList, function (index, value) {
      var $this = $(this),
          book_uuid = $this.data('id');

      $.ajax({
        url: 'http://www.duokan.com/store/v0/order/check_book',
        method: 'POST',
        data: {
          book_uuid: book_uuid,
          device_id: device_id,
          app_id : app_id,
          token: token,
          user_id: user_id
        },
        dataType: 'JSON',
        success: success(book_uuid),
        error: function (jqXHR, textStatus, errorThrown) {
          // do nothing
        }
      });
    });
  }

  init();

})();
