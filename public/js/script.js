
const fetchTasksBtn = document.querySelector('#fetchTasksBtn');
const newTaskBtn = document.querySelector('#newTaskBtn');
const getInfoBtn = document.querySelector('#getInfo');
const containerModal = document.querySelector(".my-modal");
const contentModal = document.querySelector('.modal-content');
const msgModal = document.querySelector('.modal-confirmation');
const resDiv = document.querySelector('#results');
const tasksDiv = document.querySelector('#tasks');
const accountDiv = document.querySelector('#accountInfo');
const taskForm = document.querySelector('#taskForm');
const editOverlay = document.querySelector('#overlay');

getInfoBtn.addEventListener('click', function () {
    fetchTasksBtn.parentElement.classList.remove('is-active');
    getInfoBtn.parentElement.classList.add('is-active');
    hide(tasksDiv);
    unhide(accountDiv);
    unhide(resDiv);
});
fetchTasksBtn.addEventListener('click', function () {
    getInfoBtn.parentElement.classList.remove('is-active');
    fetchTasksBtn.parentElement.classList.add('is-active');
    hide(accountDiv);
    unhide(tasksDiv);
    unhide(resDiv);
});
newTaskBtn.addEventListener('click', () => {
    taskForm.reset();       // clear out any values from old submissions
    unhide(contentModal);
    unhide(containerModal);
});
taskForm.addEventListener('submit', e => {
    e.preventDefault();
    asyncSubmit(taskForm, 'POST')        // submit the form asynchronously using axios
        .then(res => {
            hide(contentModal);
            displayConfirm(res.data);
            setTimeout(() => {          // so the new task shows up after the displayConfirm fades out
                filterTsksAndRldScrpt();
            }, 800);
        }).catch(err => {
            hide(contentModal);
            alert(err);
        });
});
document.querySelector('#sortBy').addEventListener('change', function () {
    filterTsksAndRldScrpt();
});
window.addEventListener('click', e => {
    if (e.target === containerModal) {
        hide(e.target);
    }
    if (e.target === overlay) {
        hide(e.target);
        loadContentAndScript('tasks');     // to drop the changes
    }
});



//---------------- Functions ----------------//

function unhide(modal) {
    if (modal === containerModal || modal === editOverlay) {
        document.querySelector('html').classList.add('frozen');
    }
    modal.classList.remove('hidden');
}

function hide(modal) {
    if (modal === containerModal || modal === overlay) {
        document.querySelector('html').classList.remove('frozen');
    }
    modal.classList.add('hidden');
}

async function asyncSubmit(form, method) {         // submit form asynchronously using axios
    const formData = [...new FormData(form).entries()];
    const newForm = Object.fromEntries(formData);
    return axios({
        url: form.action,
        method,
        data: newForm
    });
}

async function asyncSubmitMulti(form, method) {
    const formData = new FormData(form);
    return axios({
        url: form.action,
        method,
        data: formData
    });
}

function displayConfirm(data) {
    unhide(msgModal);
    msgModal.innerHTML = data;
    setTimeout(() => {
        msgModal.classList.add('fade');
    }, 200)
    setTimeout(() => {
        hide(msgModal);
        hide(containerModal);
        msgModal.classList.remove('fade');
    }, 1000);
}

function loadContentAndScript(route, error) {
    // everytime the content gets updated I have to reload the delete/edit script
    // for the newly rendered delete/edit 
    const script = document.createElement('script');
    let btn;
    let desiredDiv;
    if (route === 'profile') {
        route = '/users/me/info';
        script.src = '/js/asyncProfile.js';
        btn = getInfoBtn;
        desiredDiv = accountDiv;
    }
    else {
        route = '/tasks/';
        script.src = '/js/asyncTasks.js';
        btn = fetchTasksBtn;
        desiredDiv = tasksDiv.querySelector('.column:last-child');
        // desiredDiv = tasksDiv.querySelector('tbody');
    }

    axios.get(route)
        .then(res => {
            // If this is confusing, check from where it's being called.
            // The way axios works, if there's an error, the response payload will be inside
            // error.response.data. I pass this error because I want hbs to render it.
            error ? desiredDiv.innerHTML = error.response.data : desiredDiv.innerHTML = res.data;
            desiredDiv.append(script);
        }).catch(err => {
            alert(err);
        });
}

function filterTsksAndRldScrpt() {
    const sortField = document.querySelector('#sortBy').value;
    const sortOrder = 'asc';
    const skip = document.querySelector('.pagination-link.is-current').dataset.skip;
    axios.get(`/tasks/?sortBy=${sortField}:${sortOrder}&skip=${skip}`)
        .then(res => {
            const desiredDiv = tasksDiv.querySelector('.column:last-child');
            // const desiredDiv = tasksDiv.querySelector('tbody');
            desiredDiv.innerHTML = res.data;
            const script = document.createElement('script');
            script.src = "/js/asyncTasks.js";
            desiredDiv.append(script);
        })
        .catch(err => alert(err.message));

}