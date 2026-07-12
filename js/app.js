document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-item-form');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch('/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      window.location.reload();
    }
  });

  document.querySelectorAll('.toggle-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const response = await fetch(`/items/${id}/toggle`, { method: 'PATCH' });
      if (response.ok) {
        window.location.reload();
      }
    });
  });

  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const response = await fetch(`/items/${id}`, { method: 'DELETE' });
      if (response.ok) {
        window.location.reload();
      }
    });
  });
});
