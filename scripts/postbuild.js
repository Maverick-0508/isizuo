const fs = require('fs');
const path = require('path');

const projectRef = 'akstpgmvkzxxqjfqwiyh';
const storageKey = 'sb-' + projectRef + '-auth-token';

const callbackHtml = `<!DOCTYPE html>
<html>
<head><title>Signing in...</title>
<meta charset="utf-8">
</head>
<body>
<script>
;(function() {
  var hash = window.location.hash;
  if (hash && hash.indexOf('access_token') !== -1) {
    var params = {};
    hash.replace('#', '').split('&').forEach(function(pair) {
      var kv = pair.split('=');
      params[kv[0]] = decodeURIComponent(kv[1] || '');
    });
    var session = {
      access_token: params.access_token,
      refresh_token: params.refresh_token,
      expires_in: parseInt(params.expires_in) || 3600,
      expires_at: Math.floor(Date.now() / 1000) + (parseInt(params.expires_in) || 3600),
      token_type: params.token_type || 'bearer',
      provider_token: params.provider_token || ''
    };
    localStorage.setItem('` + storageKey + `', JSON.stringify(session));
    window.location.href = '/';
  } else {
    window.location.href = '/';
  }
})();
</script>
</body>
</html>`;

const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'auth-callback.html'), callbackHtml);
  console.log('Created dist/auth-callback.html');
}
