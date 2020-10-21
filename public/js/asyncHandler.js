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
        submitTaskForm(editForm, 'PATCH')
        .then(res => {
            closeModal(contentModal);
            openModal(containerModal);
            displayConfirm(res.data);
            setTimeout(() => {          // so the new task shows up after the displayConfirm fades out
                loadContentAndScript();
            }, 800);
        }).catch(err => {
            closeModal(contentModal);
            alert(err);
        });
    });
});
document.querySelectorAll('.preEditBtn').forEach(btn => {    
    btn.addEventListener('click', function() {
        const parentForm = document.querySelector(`#edit-${btn.dataset.form}`);
        const descriptionField = parentForm[0];
        const completedField = parentForm[1];
        const submitBtn = parentForm[2];
        const completedState = document.querySelector(`#state-${btn.dataset.form}`);
        descriptionField.removeAttribute('readonly');
        descriptionField.classList.remove('unchanging');
        completedField.classList.remove('hidden');
        submitBtn.classList.remove('hidden');
        btn.classList.add('hidden');
        completedState.classList.add('hidden');
        document.querySelectorAll('tbody button').forEach(el => {     // disable other buttons while editing
            el.setAttribute('disabled', 'disabled');
        });
    });
});
