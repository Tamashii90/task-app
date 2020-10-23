document.querySelector('#profileForm').addEventListener('submit', function (e) {
    e.preventDefault();
    asyncSubmit(this, 'PATCH').then(res => {
        closeModal(contentModal);
        openModal(containerModal);
        displayConfirm(res.data);
        setTimeout(() => {          // so the new task shows up after the displayConfirm fades out
            loadContentAndScript('profile');
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