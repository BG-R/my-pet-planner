let pets = [];
const AFFILIATE_CODES = {
  "Vaccine": {
    text: "Shop Vaccines on Amazon →",
    url: "https://www.amazon.com/s?k=pet+vaccine&tag=Gothard0b-20"
  },
  "Meds": {
    text: "Buy Pet Medications on Amazon →",
    url: "https://www.amazon.com/s?k=pet+medications&tag=Gothard0b-20"
  },
  "Grooming": {
    text: "Shop Grooming Supplies on Amazon →",
    url: "https://www.amazon.com/s?k=pet+grooming&tag=Gothard0b-20"
  },
  "Flea/Tick": {
    text: "Get Flea & Tick Prevention on Amazon →",
    url: "https://www.amazon.com/s?k=flea+tick+pet&tag=Gothard0b-20"
  }
};

function scheduleNotification(reminderDate, message) {
    if (!('Notification' in window)) return;
    const target = new Date(reminderDate).getTime() - 7 * 24 * 60 * 60 * 1000;
    const delay = target - Date.now();
    if (delay > 0) {
        setTimeout(() => {
            if (Notification.permission === 'granted') {
                new Notification(message);
            }
        }, delay);
    }
}

function renderPets(petsArr) {
  const list = document.getElementById('petList');
  const noPets = document.getElementById('noPetsMessage');
  list.innerHTML = '';
  if (petsArr.length === 0) {
    if (noPets) noPets.style.display = 'block';
    return;
  }
  if (noPets) noPets.style.display = 'none';

  petsArr.forEach((pet) => {
    const card = document.createElement('div');
    card.className = 'pet-card';

    const header = document.createElement('h2');
    header.textContent = `${pet.name} (${pet.breed})`;
    card.appendChild(header);

    const birth = document.createElement('p');
    birth.textContent = `Birthdate: ${pet.birthdate}`;
    card.appendChild(birth);

    // Add Reminder form
    const formDiv = document.createElement('div');
    formDiv.className = 'add-reminder-form';

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'reminder-date';
    dateInput.required = true;
    formDiv.appendChild(dateInput);

    const typeSelect = document.createElement('select');
    typeSelect.className = 'reminder-type';
    typeSelect.innerHTML = `
      <option value="">Select type…</option>
      <option value="Vaccine">Vaccine</option>
      <option value="Meds">Meds</option>
      <option value="Grooming">Grooming</option>
      <option value="Flea/Tick">Flea/Tick</option>
    `;
    formDiv.appendChild(typeSelect);

    const addBtn = document.createElement('button');
    addBtn.className = 'add-reminder-button';
    addBtn.textContent = 'Add';
    addBtn.addEventListener('click', () => {
      const date = dateInput.value;
      const type = typeSelect.value;
      if (!date || !type) {
        if (!date) dateInput.style.borderColor = 'red'; else dateInput.style.borderColor = '#ccc';
        if (!type) typeSelect.style.borderColor = 'red'; else typeSelect.style.borderColor = '#ccc';
        return;
      }
      dateInput.style.borderColor = '#ccc';
      typeSelect.style.borderColor = '#ccc';
      pet.reminders.push({ date, type });
      localStorage.setItem('pets', JSON.stringify(petsArr));
      renderPets(petsArr);
      renderUpcoming(petsArr);
      scheduleNotification(date, `Reminder for ${pet.name}: ${type} on ${date}`);
    });
    formDiv.appendChild(addBtn);

    card.appendChild(formDiv);

    const ul = document.createElement('ul');
    ul.className = 'reminder-list';
    (pet.reminders || []).forEach((rem) => {
      const li = document.createElement('li');
      li.textContent = `${rem.type} on ${rem.date}`;
      if (AFFILIATE_CODES[rem.type]) {
        const a = document.createElement('a');
        a.href = AFFILIATE_CODES[rem.type].url;
        a.className = 'affiliate-link';
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = AFFILIATE_CODES[rem.type].text;
        li.appendChild(document.createElement('br'));
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
    card.appendChild(ul);

    list.appendChild(card);
  });
}

function renderUpcoming(petsArr) {
  const upcoming = document.getElementById('upcomingList');
  upcoming.innerHTML = '';
  const all = [];
  petsArr.forEach((pet) => {
    (pet.reminders || []).forEach((rem) => {
      all.push({ petName: pet.name, type: rem.type, date: rem.date });
    });
  });

  if (all.length === 0) {
    const li = document.createElement('li');
    li.className = 'no-reminders';
    li.textContent = 'No upcoming reminders.';
    upcoming.appendChild(li);
    return;
  }

  all.sort((a, b) => new Date(a.date) - new Date(b.date));
  all.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.petName}: ${item.type} on ${item.date}`;
    upcoming.appendChild(li);
  });
}

// DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  try {
    const stored = localStorage.getItem('pets');
    pets = stored ? JSON.parse(stored) : [];
  } catch {
    pets = [];
  }

  renderPets(pets);
  renderUpcoming(pets);

  const form = document.getElementById('addPetForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('petName');
    const birthInput = document.getElementById('petBirthdate');
    const breedInput = document.getElementById('petBreed');
    const name = nameInput.value.trim();
    const breed = breedInput.value.trim();
    const birthdate = birthInput.value;
    if (!name || !birthdate) {
      if (!name) nameInput.style.borderColor = 'red'; else nameInput.style.borderColor = '#ccc';
      if (!birthdate) birthInput.style.borderColor = 'red'; else birthInput.style.borderColor = '#ccc';
      return;
    }
    nameInput.style.borderColor = '#ccc';
    birthInput.style.borderColor = '#ccc';
    const newPet = {
      id: Date.now().toString(),
      name,
      breed,
      birthdate,
      reminders: []
    };
    pets.push(newPet);
    localStorage.setItem('pets', JSON.stringify(pets));
    renderPets(pets);
    renderUpcoming(pets);
    form.reset();
  });
});
