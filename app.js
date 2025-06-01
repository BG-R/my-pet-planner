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
        card.appendChild(header);

        const birth = document.createElement('p');
        birth.textContent = `Birthdate: ${pet.birthdate}`;
        card.appendChild(birth);

        // --- Inline “Add Reminder” form ---
        const formDiv = document.createElement('div');
        formDiv.className = 'add-reminder-form';

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'reminder-date';
        dateInput.required = true;
        formDiv.appendChild(dateInput);

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
        formDiv.appendChild(typeSelect);

        const addBtn = document.createElement('button');
        addBtn.className = 'add-reminder-button';
        addBtn.textContent = 'Add';
        // JS will listen for clicks on each .add-reminder-button
        addBtn.addEventListener('click', () => {
            const date = dateInput.value;
            const type = typeSelect.value;
            if (!date || !type) return; // require both fields
            pet.reminders.push({ date, type });
            localStorage.setItem('pets', JSON.stringify(petsArr));
            renderPets(petsArr);
            renderUpcoming(petsArr);
            scheduleNotification(date, `Reminder for ${pet.name}: ${type} on ${date}`);
        });
        formDiv.appendChild(addBtn);

        card.appendChild(formDiv);
        // --- End inline form ---

        // Reminder list for this pet
        const ul = document.createElement('ul');
        ul.className = 'reminder-list';
        (pet.reminders || []).forEach((rem) => {
            const li = document.createElement('li');
            li.textContent = `${rem.type} on ${rem.date}`;
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

    // If no reminders at all, show placeholder
    if (all.length === 0) {
        const li = document.createElement('li');
        li.className = 'no-reminders';
        li.textContent = 'No upcoming reminders.';
        upcoming.appendChild(li);
    } else {
        // Sort by date and render each one once
        all.sort((a, b) => new Date(a.date) - new Date(b.date));
        all.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = `${item.petName}: ${item.type} on ${item.date}`;
            upcoming.appendChild(li);
        });
    }
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
