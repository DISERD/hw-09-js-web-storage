import storage from './storage.js';

const STORAGE_KEY = 'contacts_data';

const form = document.querySelector('#contact-form');
const idInput = document.querySelector('#contact-id');
const firstNameInput = document.querySelector('#first-name');
const lastNameInput = document.querySelector('#last-name');
const phoneInput = document.querySelector('#phone');
const emailInput = document.querySelector('#email');
const submitBtn = document.querySelector('#submit-btn');
const cancelBtn = document.querySelector('#cancel-btn');
const contactsList = document.querySelector('#contacts-list');

let contacts = storage.load(STORAGE_KEY) || [];

const updateState = () => {
  storage.save(STORAGE_KEY, contacts);
  renderContacts();
};

const renderContacts = () => {
  contactsList.innerHTML = '';

  contacts.length === 0 && (contactsList.innerHTML = '<p style="text-align: center; color: #888;">Список контактів порожній)</p>');
  
  contacts.forEach(contact => {
    const card = document.createElement('div');
    card.classList.add('contact-card');
    card.dataset.id = contact.id;

    card.innerHTML = `
      <div class="contact-info">
        <p class="contact-name">${contact.firstName} ${contact.lastName}</p>
        <p><strong>Тел:</strong> ${contact.phone}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
      </div>
      <div class="contact-actions">
        <button class="btn btn-edit" data-action="edit">Редагувати</button>
        <button class="btn btn-delete" data-action="delete">Видалити</button>
      </div>
    `;

    contactsList.appendChild(card);
  });
};

const resetForm = () => {
  form.reset();
  idInput.value = '';
  submitBtn.textContent = 'Додати контакт';
  cancelBtn.classList.add('hidden');
};

const handleFormSubmit = event => {
  event.preventDefault();

  const id = idInput.value;
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();

  contacts = id 
    ? contacts.map(c => c.id === id ? { id, firstName, lastName, phone, email } : c)
    : [...contacts, { id: Date.now().toString(), firstName, lastName, phone, email }];

  updateState();
  resetForm();
};

const actions = {
  delete: contactId => {
    contacts = contacts.filter(c => c.id !== contactId);
    updateState();
    resetForm();
  },
  edit: contactId => {
    const item = contacts.find(c => c.id === contactId);
    
    idInput.value = item.id;
    firstNameInput.value = item.firstName;
    lastNameInput.value = item.lastName;
    phoneInput.value = item.phone;
    emailInput.value = item.email;

    submitBtn.textContent = 'Зберегти зміни';
    cancelBtn.classList.remove('hidden');
  }
};

const handleListClick = event => {
  const action = event.target.dataset.action;
  const card = event.target.closest('.contact-card');
  
  action && actions[action](card.dataset.id);
};

form.addEventListener('submit', handleFormSubmit);
contactsList.addEventListener('click', handleListClick);
cancelBtn.addEventListener('click', resetForm);

renderContacts();