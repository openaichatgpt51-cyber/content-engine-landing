// Where demo requests go (an n8n webhook). Change here if the address changes.
var LEAD_ENDPOINT = 'https://openaichatgpt20.app.n8n.cloud/webhook/demo-request';

(function () {
  var loadedAt = Date.now();
  var form = document.getElementById('lead-form');
  var msg = document.getElementById('form-msg');

  function show(kind, text) { msg.className = 'msg ' + kind; msg.textContent = text; }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var name = f.name.value.trim(), email = f.email.value.trim(), company = f.company.value.trim();
      if (!name || !company) return show('err', 'Please add your name and company.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return show('err', 'Please enter a valid email address.');

      // Bots fill the hidden field or submit instantly; pretend success and send nothing.
      if (f.website.value || Date.now() - loadedAt < 3000) return show('ok', 'Thanks. We will be in touch shortly.');

      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; show('', ''); msg.className = 'msg';
      fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name, email: email, company: company,
          brands: f.brands.value, message: f.message.value.trim(),
          source: 'contentengine.social', page: location.href
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        form.reset();
        show('ok', 'Thanks. We will be in touch shortly.');
      }).catch(function () {
        show('err', 'Something went wrong. Please try again, or email hello@contentengine.social.');
      }).then(function () { btn.disabled = false; });
    });
  }

  // The walkthrough video section only appears once demo.mp4 has been added to the site.
  var section = document.getElementById('video');
  var video = document.getElementById('demo-video');
  if (section && video && window.fetch) {
    fetch('demo.mp4', { method: 'HEAD' }).then(function (r) {
      if (r.ok) { video.src = 'demo.mp4'; section.hidden = false; }
    }).catch(function () {});
  }
})();
