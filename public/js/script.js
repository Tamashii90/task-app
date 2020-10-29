
const fetchTasksBtn = document.querySelector('#fetchTasksBtn');
const newTaskBtn = document.querySelector('#newTaskBtn');
const getInfoBtn = document.querySelector('#getInfo');
const containerModal = document.querySelector(".modal");
const contentModal = document.querySelector('.modal-content');
const msgModal = document.querySelector('.modal-confirmation');
const resDiv = document.querySelector('#results');
const taskForm = document.querySelector('#taskForm');
const editOverlay = document.querySelector('#overlay');
let deleteBtns;      // this isn't rendered until fetch tasks is called, so leave it undefined here


getInfoBtn.addEventListener('click', function () {
    this.classList.add('is-loading');
    loadContentAndScript('profile');
    openModal(resDiv);
});
fetchTasksBtn.addEventListener('click', function () {
    this.classList.add('is-loading');
    loadContentAndScript('tasks');
    openModal(resDiv);
});
taskForm.addEventListener('submit', e => {
    e.preventDefault();
    asyncSubmit(taskForm, 'POST')        // submit the form asynchronously using axios
        .then(res => {
            closeModal(contentModal);
            displayConfirm(res.data);
            setTimeout(() => {          // so the new task shows up after the displayConfirm fades out
                loadContentAndScript('tasks');
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
        loadContentAndScript('tasks');     // to drop the changes
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

function loadContentAndScript(route, error) {
    // everytime the content gets updated I have to reload the delete/edit script
    // for the newly rendered delete/edit 
    const script = document.createElement('script');
    let btn;
    if (route === 'profile') {
        route = '/users/me/info';
        script.src = '/js/asyncProfile.js';
        btn = getInfoBtn;
    }
    else {
        route = '/tasks/';
        script.src = '/js/asyncTasks.js';
        btn = fetchTasksBtn;
    }
    axios.get(route)
        .then(res => {
            // If this is confusing, check from where it's being called.
            // The way axios works, if there's an error, the response payload will be inside
            // error.response.data. I pass this error because I want hbs to render it.
            error ? resDiv.innerHTML = error.response.data : resDiv.innerHTML = res.data;
            resDiv.append(script);
            btn.classList.remove('is-loading');
        }).catch(err => {
            alert(err);
            btn.classList.remove('is-loading');
        });
}
