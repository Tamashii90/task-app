document.querySelector('#profileForm').addEventListener('submit', function (e) {
    e.preventDefault();
    asyncSubmitMulti(this, 'PATCH').then(res => {
        closeModal(contentModal);
        openModal(containerModal);
        displayConfirm(res.data);
        setTimeout(() => {          
            // have to reload the whole page unfortunately because I need to update:
            // avatar, avatar in the header, and the name in the header
            window.location.reload();
        }, 800);
    }).catch(err => {
        closeModal(contentModal);
        alert(err.message);
    });
});
document.querySelector('#deleteAcct').addEventListener('submit', function (e) {
    e.preventDefault();
    if (confirm('You sure you wanna do this ?')) {
        asyncSubmit(this, 'DELETE').then(res => {
            closeModal(contentModal);
            openModal(containerModal);
            displayConfirm(res.data);
            setTimeout(() => {          // so the new task shows up after the displayConfirm fades out
                window.location = '/';
            }, 800);
        }).catch(err => {
            closeModal(contentModal);
            alert(err.message);
        });
    }
});