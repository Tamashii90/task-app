module.exports = {
    setMyCookies(user, token) {
        this.cookie('current_user', user.name, { sameSite: 'lax' });
        this.cookie('auth_token', token, { sameSite: 'lax' });
        this.cookie('hasAvatar', '', { sameSite: 'lax' });
        if (user.avatar) this.cookie('hasAvatar', true);
    },
    clearMyCookies() {
        this.clearCookie('auth_token');
        this.clearCookie('current_user');
        this.clearCookie('hasAvatar');
    }
}
