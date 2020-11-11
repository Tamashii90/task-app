/* This Script Handles The Elements That Get Rendered Later */

/*
// Can't declare variables because this script gets loaded many times
// so you will get a redeclaration error
let editForms = ...editForms...;
let deleteButtons = document.querySelectorAll('#editForm');
*/

document.querySelectorAll('.preEditBtn').forEach(btn => {
    btn.addEventListener('click', function () {
        const parentForm = document.querySelector(`#edit-${btn.dataset.form}`);
        const completedField = parentForm[0].parentElement;   // get the wrapping div.select
        const descriptionField = parentForm[1];
        const submitBtn = parentForm[2];
        const parentCard = btn.parentElement.parentElement;
        const completedState = document.querySelector(`#state-${btn.dataset.form}`);
        const initialDesc = descriptionField.previousElementSibling;

        //--------- Edit Mode On ---------// 
        for (let element of [descriptionField, completedField, submitBtn, overlay]) {
            unhide(element);
        }
        for (let element of [btn, completedState, initialDesc]) {
            hide(element);
            console.log('ich ni hide !');
        }
        parentCard.style.zIndex = 20;
    });
});
document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', function () {
        displayConfirm('Delete Task ?').then(value => {
            if (value)
                axios.delete(`/tasks/${this.dataset.id}`)
                    .then(res => {
                        hide(overlay);
                        displaySuccess(res.data);
                        setTimeout(() => {          // so it matches the fade time of the confirmation msg
                            loadContentAndScript('tasks');
                        }, 800);
                    }).catch(err => {
                        displayError(err);
                    });
        })
    });
});
document.querySelectorAll('.completeBtn').forEach(btn => {
    btn.addEventListener('click', function () {
        axios.patch(`/tasks/${this.dataset.id}`, { completed: true }).then(res => {
            hide(overlay);
            displaySuccess(res.data);
            setTimeout(() => {          // so it matches the fade time of the confirmation msg
                filterTsksAndRldScrpt();
            }, 800);
        }).catch(err => {
            displayError(err);
        });
    });
});
document.querySelectorAll('.editForm').forEach(editForm => {
    editForm.addEventListener('submit', e => {
        e.preventDefault();
        asyncSubmit(editForm, 'PATCH')
            .then(res => {
                hide(overlay);
                hide(contentModal);
                displaySuccess(res.data);
                setTimeout(() => {          // so the new task shows up after the displaySuccess fades out
                    filterTsksAndRldScrpt();
                }, 800);
            }).catch(err => {
                hide(overlay);
                hide(contentModal);
                displayError(err.message);
            });
    });
});
document.querySelectorAll('.pagination-link').forEach(link => {
    link.addEventListener('click', function () {
        document.querySelectorAll('.pagination-link').forEach(link => {     // remove any active links first
            link.classList.remove('is-current');
        });
        link.classList.add('is-current');
        filterTsksAndRldScrpt();
    });
});
