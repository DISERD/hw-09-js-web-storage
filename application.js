import storage from './storage.js';

const STORAGE_KEY = 'contacts_data';
const FORM_DRAFT_KEY = 'contact_form_draft';

const form = document.querySelector('#contact-form');
const submitBtn = document.querySelector('#submit-btn');
const cancelBtn = document.querySelector('#cancel-btn');
const contactsList = document.querySelector('#contacts-list');

let contacts = storage.load(STORAGE_KEY) || [];

const throttle = (fn, delay = 500) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

const restoreFormDraft = () => {
  const draft = storage.load(FORM_DRAFT_KEY);
  if (!draft) return;

  Object.entries(draft).forEach(([name, value]) => {
    if (form.elements[name]) form.elements[name].value = value;
  });
};

const handleInput = throttle(() => {
  const formData = new FormData(form);
  const draft = Object.fromEntries(formData.entries());
  storage.save(FORM_DRAFT_KEY, draft);
}, 500);

const updateState = () => {
  storage.save(STORAGE_KEY, contacts);
  renderContacts();
};

const renderContacts = () => {
  if (!contacts.length) {
    contactsList.innerHTML = '<p style="text-align: center; color: #888;">Список контактів порожній</p>';
    return;
  }

  contactsList.innerHTML = contacts.map(({ id, firstName, lastName, phone, email }) => `
    <div class="contact-card" data-id="${id}">
      <div class="contact-info">
        <p class="contact-name">${firstName} ${lastName}</p>
        <p><strong>Тел:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
      <div class="contact-actions">
        <button class="btn btn-edit" data-action="edit">Редагувати</button>
        <button class="btn btn-delete" data-action="delete">Видалити</button>
      </div>
    </div>
  `).join('');
};

const resetForm = () => {
  form.reset();
  form.elements['contact-id'].value = '';
  submitBtn.textContent = 'Додати контакт';
  cancelBtn.classList.add('hidden');
  storage.remove(FORM_DRAFT_KEY);
};

form.addEventListener('submit', event => {
  event.preventDefault();
  
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  Object.keys(data).forEach(key => data[key] = data[key].trim());

  const id = form.elements['contact-id'].value;

  if (id) {
    contacts = contacts.map(c => c.id === id ? { ...data, id } : c);
  } else {
    contacts.push({ ...data, id: Date.now().toString() });
  }

  updateState();
  resetForm();
});

form.addEventListener('input', handleInput);

const actions = {
  delete: id => {
    contacts = contacts.filter(c => c.id !== id);
    updateState();
    resetForm();
  },
  edit: id => {
    const item = contacts.find(c => c.id === id);
    if (!item) return;

    Object.entries(item).forEach(([key, val]) => {
      if (form.elements[key]) form.elements[key].value = val;
    });

    submitBtn.textContent = 'Зберегти зміни';
    cancelBtn.classList.remove('hidden');
  }
};

contactsList.addEventListener('click', e => {
  const action = e.target.dataset.action;
  const id = e.target.closest('.contact-card')?.dataset.id;
  if (action && id) actions[action](id);
});

cancelBtn.addEventListener('click', resetForm);

restoreFormDraft();
renderContacts();