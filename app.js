let pets = [];

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
    list.innerHTML = '';

    petsArr.forEach((pet) => {
        const card = document.createElement('div');
        card.className = 'pet-card';

        const header = document.createElement('h2');
        header.textContent = `${pet.name} (${pet.breed})`;

        const birth = document.createElement('p');
        birth.textContent = `Birthdate: ${pet.birthdate}`;

        const formDiv = document.createElement('div');
        formDiv.className = 'add-reminder-form';

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'reminder-date';
        dateInput.required = true;

        const typeSelect = document.createElement('select');
        typeSelect.className = 'reminder-type';
        const optDefault = document.createElement('option');
        optDefault.value = '';
        optDefault.textContent = 'Select type…';
        const optVac = document.createElement('option');
        optVac.value = 'Vaccine';
        optVac.textContent = 'Vaccine';
        const optMeds = document.createElement('option');
        optMeds.value = 'Meds';
        optMeds.textContent = 'Meds';
        const optGroom = document.createElement('option');
        optGroom.value = 'Grooming';
        optGroom.textContent = 'Grooming';
        typeSelect.appendChild(optDefault);
        typeSelect.appendChild(optVac);
        typeSelect.appendChild(optMeds);
        typeSelect.appendChild(optGroom);

        const addBtn = document.createElement('button');
        addBtn.className = 'add-reminder-button';
        addBtn.textContent = 'Add';
        // JS listens for clicks on each .add-reminder-button

        formDiv.appendChild(dateInput);
        formDiv.appendChild(typeSelect);
        formDiv.appendChild(addBtn);

        const ul = document.createElement('ul');
        ul.className = 'reminder-list';
        (pet.reminders || []).forEach((rem) => {
            const li = document.createElement('li');
            li.textContent = `${rem.type} on ${rem.date}`;
            const done = document.createElement('input');
            done.type = 'checkbox';
            li.appendChild(document.createTextNode(' '));
            li.appendChild(done); // optional "Done" checkbox
            ul.appendChild(li);
        });

        addBtn.addEventListener('click', () => {
            const date = dateInput.value;
            const type = typeSelect.value;
            if (!date || !type) return;
            pet.reminders.push({ date, type });
            localStorage.setItem('pets', JSON.stringify(pets));
            renderPets(pets);
            renderUpcoming(pets);
            scheduleNotification(date, `Reminder for ${pet.name}: ${type} on ${date}`);
        });

        card.appendChild(header);
        card.appendChild(birth);
        card.appendChild(formDiv);
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
    all.sort((a, b) => new Date(a.date) - new Date(b.date));
    all.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.petName}: ${item.type} on ${item.date}`;
        upcoming.appendChild(li);
    });
}

// DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window && Notification.permission === 'default') {
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
    // handle add pet form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('petName').value.trim();
        const breed = document.getElementById('petBreed').value.trim();
        const birthdate = document.getElementById('petBirthdate').value;
        if (!name) return;
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
