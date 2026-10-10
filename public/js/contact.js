/* ========================================================
   PAVI'S CLUB - CONTACT FORM HANDLER
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactInquiryForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending Message... ⏳';
    submitBtn.disabled = true;

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone ? form.phone.value.trim() : '',
      subject: form.subject ? form.subject.value.trim() : 'General Inquiry',
      message: form.message.value.trim()
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        showToast('Thank you! Your message was received by our concierge.', 'success');
        form.reset();

        const successBanner = document.getElementById('contactSuccessBanner');
        if (successBanner) {
          successBanner.style.display = 'block';
          setTimeout(() => {
            successBanner.style.display = 'none';
          }, 6000);
        }
      } else {
        showToast(data.error || 'Failed to send message', 'error');
      }
    } catch (err) {
      console.error('Contact error:', err);
      showToast('Could not send message. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
});
