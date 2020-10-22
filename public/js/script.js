
const fetchTasksBtn = document.querySelector('#fetchTasksBtn');
const newTaskBtn = document.querySelector('#newTaskBtn');
const containerModal = document.querySelector(".modal");
const contentModal = document.querySelector('.modal-content');
const msgModal = document.querySelector('.modal-confirmation');
const resDiv = document.querySelector('#results');
const taskForm = document.querySelector('#taskForm');
const editOverlay = document.querySelector('#overlay');
let deleteBtns;      // this isn't rendered until fetch tasks is called, so leave it undefined here


fetchTasksBtn.addEventListener('click', () => {
    resDiv.classList.remove('hidden');
    loadContentAndScript();
});
newTaskBtn.addEventListener('click', () => {
    taskForm.reset();       // clear out any values from old submissions
    openModal(contentModal);
    openModal(containerModal);
});
taskForm.addEventListener('submit', e => {
    e.preventDefault();
    submitTaskForm(taskForm,'POST')        // submit the form asynchronously using axios
        .then(res => {
            closeModal(contentModal);
            displayConfirm(res.data);
            setTimeout(() => {          // so the new task shows up after the displayConfirm fades out
                loadContentAndScript();
            }, 800);
        }).catch(err => {
            closeModal(contentModal);
            alert(err);
        });
});
window.addEventListener('click', e => {
    if (e.target === containerModal) {
        closeModal(e.target);
    }
    if (e.target === overlay) {
        closeModal(e.target);
        loadContentAndScript();     // to drop the changes
    }
});



//---------------- Functions ----------------//

function openModal(modal) {
    if (modal === containerModal || modal === editOverlay) {
        document.querySelector('html').classList.add('frozen');
    }
    modal.classList.remove('hidden');
}

function closeModal(modal) {
    if (modal === containerModal || modal === overlay) {
        document.querySelector('html').classList.remove('frozen');
    }
    modal.classList.add('hidden');
}

async function submitTaskForm(form, method) {         // submit form asynchronously using axios
    const formData = [...new FormData(form).entries()];
    const newForm = Object.fromEntries(formData);
    return axios({
        url: form.action,
        method,
        data: newForm
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

function loadContentAndScript() {
    // everytime the content gets updated I have to reload the delete/edit script
    // for the newly rendered delete/edit buttons
    axios.get('/tasks/').then(res => {
        resDiv.innerHTML = res.data;
        const script = document.createElement('script');
        script.src = '/js/asyncHandler.js';
        resDiv.append(script);
    });
}