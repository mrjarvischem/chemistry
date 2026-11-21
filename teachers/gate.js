/* Password gate for the teachers section.
   To change the password: replace HASH with the SHA-256 (hex) of SALT + new password.
   Changing HASH signs everyone out, so they need the new password. */
(function () {
  var SALT = 'mrjarvischem-teachers:';
  var HASH = '6dc35a6bc4d41fba9fb4f3b0baf03e0149756aa234fec518929f276e8e97475d';
  var KEY = 'teachersGate';

  try { if (localStorage.getItem(KEY) === HASH && HASH.length === 64) return; } catch (e) {}

  // Hide the page until unlocked
  var hide = document.createElement('style');
  hide.textContent = 'html{visibility:hidden!important}#tg-wrap,#tg-wrap *{visibility:visible!important}';
  document.documentElement.appendChild(hide);

  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }

  function build() {
    var wrap = document.createElement('div');
    wrap.id = 'tg-wrap';
    wrap.setAttribute('style', 'position:fixed;inset:0;z-index:2147483647;background:#f4f6f8;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:20px;box-sizing:border-box');
    wrap.innerHTML =
      '<form id="tg-form" style="background:#fff;border:1px solid #d9dee4;border-radius:14px;padding:32px 28px;width:100%;max-width:360px;box-shadow:0 8px 30px rgba(20,30,50,.08);box-sizing:border-box">' +
      '<h1 style="margin:0 0 6px;font-size:22px;color:#17212f">Teacher resources</h1>' +
      '<p style="margin:0 0 20px;font-size:15px;color:#5a6676">Enter the password to continue.</p>' +
      '<label for="tg-pw" style="display:block;font-size:13px;font-weight:600;color:#17212f;margin-bottom:6px">Password</label>' +
      '<input id="tg-pw" type="password" autocomplete="current-password" style="width:100%;box-sizing:border-box;font-size:16px;padding:11px 12px;border:1px solid #b9c1cc;border-radius:8px;color:#17212f;background:#fff">' +
      '<p id="tg-msg" role="alert" style="min-height:20px;margin:8px 0 10px;font-size:14px;color:#b3261e"></p>' +
      '<button type="submit" style="width:100%;font-size:16px;font-weight:600;padding:11px;border:0;border-radius:8px;background:#1f5fbf;color:#fff;cursor:pointer">Unlock</button>' +
      '</form>';
    document.body.appendChild(wrap);

    var input = wrap.querySelector('#tg-pw');
    var msg = wrap.querySelector('#tg-msg');
    input.focus();

    wrap.querySelector('#tg-form').addEventListener('submit', function (e) {
      e.preventDefault();
      sha256(SALT + input.value).then(function (h) {
        if (h === HASH) {
          try { localStorage.setItem(KEY, HASH); } catch (err) {}
          location.reload();
        } else {
          msg.textContent = 'That password is not right.';
          input.value = '';
          input.focus();
        }
      });
    });
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
