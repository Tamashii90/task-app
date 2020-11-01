
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

// Make everything small for mobile screens
if (window.innerWidth < 768) {
    document.querySelector('.tabs').classList.add('is-small');
    // rest of the elements are minimzed in their respective script (asyncProfile/asyncTasks)
}
window.addEventListener('resize', function () {
    if (window.innerWidth < 768) {
        document.querySelectorAll('.button, input, .file, .textarea, .select, .tabs').forEach(btn => {
            btn.classList.add('is-small');
        });
    }
    if (window.innerWidth > 768) {
        document.querySelectorAll('.button, input, .file, .textarea, .select, .tabs').forEach(btn => {
            btn.classList.remove('is-small');
        });
    }
});


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
taskForm.addEventListener('submit', e => {
    e.preventDefault();
    asyncSubmit(taskForm, 'POST')        // submit the form asynchronously using axios
        .then(res => {
            hide(contentModal);
            displayConfirm(res.data);
            setTimeout(() => {          // so the new task shows up after the displayConfirm fades out
                loadContentAndScript('tasks');
            }, 800);
        }).catch(err => {
            hide(contentModal);
            alert(err);
        });
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
        desiredDiv = tasksDiv;
    }
    axios.get(route)
        .then(res => {
            // If this is confusing, check from where it's being called.
            // The way axios works, if there's an error, the response payload will be inside
            // error.response.data. I pass this error because I want hbs to render it.
            error ? desiredDiv.innerHTML = error.response.data : desiredDiv.innerHTML = res.data;
            desiredDiv.removeChild(desiredDiv.querySelector('script')); // remove the previous script first 
            desiredDiv.append(script);
        }).catch(err => {
            alert(err);
        });
}
