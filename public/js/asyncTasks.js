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
            if (!editOverlay.classList.contains('hidden')) {
                closeModal(editOverlay);
            }
            openModal(containerModal);
            displayConfirm(res.data);
            setTimeout(() => {          // so it matches the fade time of the confirmation msg
                loadContentAndScript();
            }, 800);
        });
    });
});
document.querySelectorAll('.editForm').forEach(editForm => {
    editForm.addEventListener('submit', e => {
        e.preventDefault();
        asyncSubmit(editForm, 'PATCH')
            .then(res => {
                closeModal(editOverlay);
                closeModal(contentModal);
                openModal(containerModal);
                displayConfirm(res.data);
                setTimeout(() => {          // so the new task shows up after the displayConfirm fades out
                    loadContentAndScript();
                }, 800);
            }).catch(err => {
                closeModal(editOverlay);
                closeModal(contentModal);
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

        //--------- Edit Mode On ---------// 
        for (let element of [completedField, submitBtn, editOverlay]) {
            openModal(element);
        }
        for (let element of [btn, completedState]) {
            closeModal(element);
        }
        parentRow.style.zIndex = 20;
        descriptionField.removeAttribute('readonly');
        descriptionField.style.background = 'white';
    });
});
document.querySelector('#newTaskBtn').addEventListener('click', () => {
    taskForm.reset();       // clear out any values from old submissions
    openModal(contentModal);
    openModal(containerModal);
});