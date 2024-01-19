import config from '../utils/config';
const loginUrl = config.get('providers:iifl:loginUrl');
const userKey = config.get('providers:iifl:userKey');
const appUrl = config.get('server:url');

export const IIFL_LOGIN_HTML = `<html>
    <head>
        <script
  src="https://code.jquery.com/jquery-3.6.0.slim.min.js"
  integrity="sha256-u7e5khyithlIdTpu22PHhENmPcRdFiHRjhAuHcs05RI="
  crossorigin="anonymous"></script>
    </head>
<button type="button" id="btnAuthorize" style="display:none">Click Me!</button>
<script type="text/javascript">
$(document).ready(function () {
var f = document.createElement('form');
f.action = '${loginUrl}';
f.method = 'POST';
var i = document.createElement('input');
i.type = 'hidden';
i.name = 'VP'
i.value = '${appUrl}/api/providers/iifl/auth/callback'
f.appendChild(i);
var i = document.createElement('input');
i.type = 'hidden';
i.name = 'UserKey'
i.value = '${userKey}'
f.appendChild(i);
document.body.appendChild(f);
f.submit()
})
</script>
</html>`