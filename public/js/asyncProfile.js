document.querySelector('#profileForm').addEventListener('submit', function (e) {
    e.preventDefault();
    asyncSubmit(this, 'PATCH').then(res => {
        hide(contentModal);
        displaySuccess(res.data);
        setTimeout(() => {
            window.location.reload();
        }, 800);
    }).catch(async (err) => {
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
// For the avatar upload 
document.querySelector('.edit-avatar').addEventListener('mouseover', () => {
    unhide(document.querySelector('.img-cover'));
    document.querySelector('.edit-avatar img').classList.add('blur');

});
document.querySelector('.edit-avatar').addEventListener('mouseout', () => {
    hide(document.querySelector('.img-cover'));
    document.querySelector('.edit-avatar img').classList.remove('blur');
});
document.querySelector('#avatarFile').addEventListener('change', function () {
    const formData = new FormData();
    formData.append("avatar", this.files[0]);
    showLoader(true);
    axios.put('/users/me/avatar', formData)
        .then(res => {
            document.querySelectorAll('.avatarImg').forEach(img => {
                img.src = '/users/me/avatar';
            });
            showLoader(false);
            displaySuccess(res.data);
        })
        .catch(err => {
            if (err.response) {
                displayError(err.response.data.error);    // because of how axios handles error
            } else {
                displayError(err.message);
            }
            showLoader(false);
        });
});
// End of avatar upload
document.querySelector('#deleteAvBtn').addEventListener('click', function () {
    const avatars = document.querySelectorAll('.avatarImg');
    showLoader(true);
    axios.delete('/users/me/avatar')
        .then(res => {
            // hide(contentModal);
            showLoader(false);
            displaySuccess(res.data);
            avatars.forEach(avatar => avatar.src = 'https://i.imgur.com/F9cRyax.png');
        })
        .catch(err => {
            // hide(contentModal);
            displayError(err.message);
        });
});
