function displayConfirm(data) {
    closeModal(contentModal);
    openModal(msgModal);
    msgModal.innerHTML = data;
    setTimeout(() => {
        msgModal.classList.add('fade');
    }, 200)
    setTimeout(() => {
        closeModal(containerModal);
        msgModal.classList.remove('fade');
        openModal(contentModal);
    }, 1000);
}

function openModal(modal) {
    if (modal === containerModal) {
        document.querySelector('html').classList.add('frozen');
    }
    modal.classList.remove('hidden');
}

function closeModal(modal) {
    if (modal === containerModal) {
        document.querySelector('html').classList.remove('frozen');
    }
    modal.classList.add('hidden');
}


/////////////////////////////////////////////////////////

function openModal() {
    msgModal.classList.add('hidden');
    containerModal.classList.remove('hidden');
    document.querySelector('html').classList.add('frozen');
}

function closeModal() {
    containerModal.classList.add('hidden');
    document.querySelector('html').classList.remove('frozen');
}