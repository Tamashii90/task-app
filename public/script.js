
const fetchTasksBtn = document.querySelector('#fetchTasksBtn');
const newTaskBtn = document.querySelector('#newTaskBtn');
const containerModal = document.querySelector(".modal");
const contentModal = document.querySelector('.modal-content');
const msgModal = document.querySelector('.modal-confirmation');
const resDiv = document.querySelector('#results');
const taskForm = document.querySelector('#taskForm');


fetchTasksBtn.addEventListener('click', () => {
    axios.get('/tasks/').then(res => {
        resDiv.innerHTML = res.data;
    });
});
newTaskBtn.addEventListener('click', () => {
    window.addEventListener('click', clickHandler);
    openModal(containerModal);
    openModal(contentModal);
});

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitTaskForm();
});



function clickHandler(e) {
    if (e.target === containerModal) {
        closeModal(containerModal);
        // Remove after modal is closed to prevent unnecessary click events
        window.removeEventListener('click', clickHandler);
    }
}

function openModal(modal) {
    if (modal === containerModal) {
        document.querySelector('html').classList.add('frozen');
    }
    modal.classList.remove('hidden');
}

function closeModal(modal) {
    if (modal === containerModal) {
        document.querySelector('html').classList.remove('frozen');
    }
    modal.classList.add('hidden');
}

function submitTaskForm() {
    const descriptionField = document.querySelector('#descriptionField');
    const radioButtons = document.querySelectorAll('#taskForm input[type=radio]');
    let completed;
    for (let btn of radioButtons) {
        if (btn.checked) completed = btn.value;
    }
    axios.post('/tasks/', {
        data: {
            description: descriptionField.value,
            completed
        }
    }).then(res => {
        closeModal(contentModal);
        displayConfirm(res.data);
    }).catch(err => {
        closeModal(contentModal);
        displayConfirm(err);
    });
}

function displayConfirm(data) {
    openModal(msgModal);
    msgModal.innerHTML = data;
    setTimeout(() => {
        msgModal.classList.add('fade');
    }, 200)
    setTimeout(() => {
        closeModal(msgModal);
        closeModal(containerModal);
        msgModal.classList.remove('fade');
    }, 1000);
}