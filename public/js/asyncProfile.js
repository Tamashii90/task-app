document.querySelector('#profileForm').addEventListener('submit', function (e) {
    e.preventDefault();
    asyncSubmitMulti(this, 'PATCH').then(res => {
        closeModal(contentModal);
        openModal(containerModal);
        displayConfirm(res.data);
        setTimeout(() => {
            window.location.reload();
        }, 800);
    }).catch(err => {
        closeModal(contentModal);
        if (err.response) return alert(err.response.data);
        alert(err);
    });
});
document.querySelector('#deleteAcct').addEventListener('submit', function (e) {
    e.preventDefault();
    if (confirm('You sure you wanna do this ?')) {
        asyncSubmit(this, 'DELETE').then(res => {
            closeModal(contentModal);
            openModal(containerModal);
            displayConfirm(res.data);
            setTimeout(() => {
                window.location = '/';
            }, 800);
        }).catch(err => {
            closeModal(contentModal);
            alert(err.message);
        });
    }
});
document.querySelector('#deleteAvForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const avatars = document.querySelectorAll('.avatarImg');
    asyncSubmitMulti(this, 'DELETE').then(res => {          // no idea why I have to make this multipart
        closeModal(contentModal);
        openModal(containerModal);
        displayConfirm(res.data);
        setTimeout(() => {
            loadContentAndScript('profile');
            avatars.forEach(avatar => avatar.src = 'https://i.imgur.com/F9cRyax.png');
        }, 800);
    }).catch(err => {
        closeModal(contentModal);
        alert(err.message);
    });
});
