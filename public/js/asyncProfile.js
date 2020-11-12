document.querySelector('#profileForm').addEventListener('submit', function (e) {
    e.preventDefault();
    asyncSubmitMulti(this, 'PATCH').then(res => {
        hide(contentModal);
        displaySuccess(res.data);
        setTimeout(() => {
            window.location.reload();
        }, 800);
    }).catch(async(err) => {
        hide(contentModal);
        showLoader(true);
        await loadContentAndScript('profile', err);
        showLoader(false);
    });
});
document.querySelector('#deleteAcct').addEventListener('submit', function (e) {
    e.preventDefault();
    displayConfirm('Are you sure you want to delete your account ?\n\n This action is irreversible.')
        .then(value => {
            if (value) {
                asyncSubmit(this, 'DELETE')
                    .then(res => {
                        hide(contentModal);
                        displaySuccess(res.data);
                        setTimeout(() => {
                            window.location = '/';
                        }, 1000);
                    }).catch(err => {
                        hide(contentModal);
                        displayError(err.message);
                    });
            }
        })

});
document.querySelector('#deleteAvForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const avatars = document.querySelectorAll('.avatarImg');
    asyncSubmitMulti(this, 'DELETE').then(res => {          // no idea why I have to make this multipart
        hide(contentModal);
        displaySuccess(res.data);
        setTimeout(async () => {
            showLoader(true);
            await loadContentAndScript('profile');
            showLoader(false);
            avatars.forEach(avatar => avatar.src = 'https://i.imgur.com/F9cRyax.png');
        }, 800);
    }).catch(err => {
        hide(contentModal);
        displayError(err.message);
    });
});
