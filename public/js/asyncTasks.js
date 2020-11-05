/* This Script Handles The Elements That Get Rendered Later */

/*
// Can't declare variables because this script gets loaded many times
// so you will get a redeclaration error
let editForms = ...editForms...;
let deleteButtons = document.querySelectorAll('#editForm');
*/

document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', function () {
        axios.delete(`/tasks/${this.dataset.id}`).then(res => {
            hide(editOverlay);
            unhide(containerModal);
            displayConfirm(res.data);
            setTimeout(() => {          // so it matches the fade time of the confirmation msg
                loadContentAndScript('tasks');
            }, 800);
        });
    });
});
document.querySelectorAll('.editForm').forEach(editForm => {
    editForm.addEventListener('submit', e => {
        e.preventDefault();
        asyncSubmit(editForm, 'PATCH')
            .then(res => {
                hide(editOverlay);
                hide(contentModal);
                unhide(containerModal);
                displayConfirm(res.data);
                setTimeout(() => {          // so the new task shows up after the displayConfirm fades out
                    filterTsksAndRldScrpt();
                }, 800);
            }).catch(err => {
                hide(editOverlay);
                hide(contentModal);
                alert(err);
            });
    });
});
document.querySelectorAll('.preEditBtn').forEach(btn => {
    btn.addEventListener('click', function () {
        const parentForm = document.querySelector(`#edit-${btn.dataset.form}`);
        const descriptionField = parentForm[0];
        const completedField = parentForm[1].parentElement;     // get the wrapping div.select
        const submitBtn = parentForm[2];
        const parentRow = btn.parentElement.parentElement;
        const completedState = document.querySelector(`#state-${btn.dataset.form}`);
        const initialSpan = descriptionField.previousElementSibling;

        //--------- Edit Mode On ---------// 
        for (let element of [descriptionField, completedField, submitBtn, editOverlay]) {
            unhide(element);
        }
        for (let element of [btn, completedState, initialSpan]) {
            hide(element);
        }
        parentRow.style.zIndex = 20;
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
