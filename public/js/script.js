
const fetchTasksBtn = document.querySelector('#fetchTasksBtn');
const newTaskBtn = document.querySelector('#newTaskBtn');
const getInfoBtn = document.querySelector('#getInfo');
const containerModal = document.querySelector(".my-modal");
const contentModal = document.querySelector('.my-modal-content');
const resDiv = document.querySelector('#results');
const tasksDiv = document.querySelector('#tasks');
const accountDiv = document.querySelector('#accountInfo');
const taskForm = document.querySelector('#taskForm');
const overlay = document.querySelector('#overlay');
const preLoader = document.querySelector('svg');

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
            hide(containerModal);
            displaySuccess(res.data);
            setTimeout(() => {          // so the new task shows up after the displaySuccess fades out
                filterTsksAndRldScrpt('first'); // so it goes to the first page
            }, 800);
        }).catch(err => {
            hide(containerModal);
            hide(contentModal);
            displayError(err);
        });
});
document.querySelector('#sortBy').addEventListener('change', function () {
    filterTsksAndRldScrpt();
});
document.querySelector('.switch input[type=checkbox]').addEventListener('change', function () {
    filterTsksAndRldScrpt('first');
});
document.querySelector('#sortOrder').addEventListener('click', function () {
    const up = this.querySelector('.fa-sort-amount-up');
    const down = this.querySelector('.fa-sort-amount-down');
    up.classList.toggle('hidden');
    down.classList.toggle('hidden');
    filterTsksAndRldScrpt();

});
window.addEventListener('click', e => {
    if (e.target === containerModal) {
        hide(e.target);
    }
    if (e.target === overlay) {
        hide(e.target);
        filterTsksAndRldScrpt();     // to drop the changes
    }
});



//---------------- Functions ----------------//

function unhide(modal) {
    if (modal === containerModal || modal === overlay) {
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

function displaySuccess(data) {
    // unhide(msgModal);
    // msgModal.innerHTML = data;
    // setTimeout(() => {
    //     msgModal.classList.add('fade');
    // }, 200)
    // setTimeout(() => {
    //     hide(msgModal);
    //     hide(containerModal);
    //     msgModal.classList.remove('fade');
    // }, 1000);
    swal({
        text: data,
        buttons: false,
        timer: 1000,
        icon: 'success'
    })
}

function displayError(err) {
    swal({
        text: err,
        button: 'OK',
        icon: 'error'
    })
}

async function displayConfirm(data) {
    return swal({
        title: 'Are You Sure ?',
        text: data,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    });
}

function showLoader(show) {
    if (show) {
        unhide(overlay);
        return unhide(preLoader);
    }
    hide(overlay);
    return hide(preLoader);
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
        desiredDiv = tasksDiv.children[tasksDiv.children.length - 1];
        // desiredDiv = tasksDiv.querySelector('.column:last-child');
        // desiredDiv = tasksDiv.querySelector('tbody');
    }
    showLoader(true);
    axios.get(route)
        .then(res => {
            // If this is confusing, check from where it's being called.
            // The way axios works, if there's an error, the response payload will be inside
            // error.response.data. I pass this error because I want hbs to render it.
            showLoader(false);
            error ? desiredDiv.innerHTML = error.response.data : desiredDiv.innerHTML = res.data;
            desiredDiv.append(script);
        }).catch(err => {
            showLoader(false);
            displayError(err);
        });
}

function filterTsksAndRldScrpt(skipToFirstOrLast) {
    // skipToFirstOrLast MUST have either 'last','first', or just undefined
    const sortField = document.querySelector('#sortBy').value;
    const sortOrder = document.querySelector('#sortOrder i.fas:not(.hidden)').dataset.order;
    const skip = skipToFirstOrLast || document.querySelector('.pagination-link.is-current').dataset.skip;
    const isCompleted = document.querySelector('.switch input[type=checkbox]').checked;
    showLoader(true);
    axios.get('/tasks/', {
        params: {
            sortBy: `${sortField}:${sortOrder}`,
            skip,
            completed: isCompleted ? Boolean(isCompleted.value) : undefined // undefined means ignore it
        }
    }).then(res => {
        const desiredDiv = tasksDiv.children[tasksDiv.children.length - 1];
        // const desiredDiv = tasksDiv.querySelector('.column:last-child');
        // const desiredDiv = tasksDiv.querySelector('tbody');
        showLoader(false);
        desiredDiv.innerHTML = res.data;
        const script = document.createElement('script');
        script.src = "/js/asyncTasks.js";
        desiredDiv.append(script);
    })
        .catch(err => {
            showLoader(false);
            displayError(err.message);
        });

}