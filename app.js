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

        const ul = document.createElement('ul');
        ul.className = 'reminder-list';
        pet.reminders.forEach(rem => {
            const li = document.createElement('li');
            li.textContent = `${rem.type} on ${rem.date}`;
            ul.appendChild(li);
        });

        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add Reminder';
        addBtn.addEventListener('click', () => {
            const date = prompt('Reminder date (YYYY-MM-DD)');
            if (!date) return;
            const type = prompt('Reminder type (e.g., Vaccine, Meds)');
            if (!type) return;
            pet.reminders.push({ date, type });
            localStorage.setItem('pets', JSON.stringify(pets));
            renderPets(pets);
            scheduleNotification(date, `${pet.name} - ${type}`);
        });

        card.appendChild(header);
        card.appendChild(birth);
        card.appendChild(ul);
        card.appendChild(addBtn);
        list.appendChild(card);
    });
}

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

    const form = document.getElementById('addPetForm');
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
        form.reset();
    });
});
