/* ========================================================
   PAVI'S CLUB - TABLE RESERVATION CONTROLLER
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('tableBookingForm');
  const dateInput = document.getElementById('resvDate');

  // Enforce today as minimum booking date
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    if (!dateInput.value) {
      dateInput.value = today;
    }
  }

  // Guest count selector buttons
  const guestBtns = document.querySelectorAll('.guest-counter-btn');
  const guestInput = document.getElementById('resvGuests');

  guestBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      guestBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (guestInput) {
        guestInput.value = btn.getAttribute('data-guests');
      }
    });
  });

  // Seating area choice
  const seatingCards = document.querySelectorAll('.seating-choice-card');
  const seatingInput = document.getElementById('resvSeatingArea');

  seatingCards.forEach(card => {
    card.addEventListener('click', () => {
      seatingCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      if (seatingInput) {
        seatingInput.value = card.getAttribute('data-area');
      }
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Submitting Reservation... ⏳';
      submitBtn.disabled = true;

      const payload = {
        customer_name: form.customer_name.value.trim(),
        customer_phone: form.customer_phone.value.trim(),
        customer_email: form.customer_email.value.trim(),
        reservation_date: form.reservation_date.value,
        reservation_time: form.reservation_time.value,
        guest_count: form.guest_count.value,
        special_requests: `Area: ${form.seating_area ? form.seating_area.value : 'Main Dining'}. Notes: ${form.special_requests ? form.special_requests.value.trim() : 'None'}`
      };

      try {
        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
          showToast('Reservation request submitted! 🥂', 'success');
          form.reset();

          const modal = document.getElementById('bookingConfirmModal');
          if (modal) {
            const body = document.getElementById('bookingConfirmBody');
            if (body) {
              body.innerHTML = `
                <div style="text-align:center;">
                  <div style="font-size:3.5rem; margin-bottom:1rem;">🥂</div>
                  <h3 style="font-size:1.8rem; color:var(--gold-light); margin-bottom:0.5rem;">Table Reserved!</h3>
                  <p style="color:var(--text-cream-dim); margin-bottom:1.5rem; font-size:0.9rem;">
                    Booking Reference: <strong style="color:var(--gold-primary);">#RESV-${data.reservationId}</strong>
                  </p>

                  <div style="background:var(--bg-secondary); border:1px solid var(--gold-border); border-radius:var(--radius-md); padding:1.25rem; text-align:left; margin-bottom:1.5rem; font-size:0.9rem;">
                    <div style="margin-bottom:0.4rem;"><strong>Name:</strong> ${payload.customer_name}</div>
                    <div style="margin-bottom:0.4rem;"><strong>Party Size:</strong> ${payload.guest_count} Guests</div>
                    <div style="margin-bottom:0.4rem;"><strong>Date & Time:</strong> ${payload.reservation_date} at ${payload.reservation_time}</div>
                    <div><strong>Contact:</strong> ${payload.customer_phone}</div>
                  </div>

                  <div style="background:rgba(212, 175, 55, 0.08); padding:0.85rem; border-radius:var(--radius-sm); font-size:0.82rem; color:var(--gold-light); margin-bottom:1.5rem;">
                    ℹ️ <strong>Backend Notice:</strong> Your reservation has been recorded in the database. Our reservations desk will hold your table for up to 15 minutes past the reserved hour.
                  </div>

                  <button class="btn btn-primary btn-sm" onclick="document.getElementById('bookingConfirmModal').classList.remove('open')">
                    Done
                  </button>
                </div>
              `;
            }
            modal.classList.add('open');
          }
        } else {
          showToast(data.error || 'Failed to submit reservation', 'error');
        }
      } catch (err) {
        console.error('Reservation error:', err);
        showToast('Connection failed. Please check your backend.', 'error');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});
