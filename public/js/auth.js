// CodeAlpha Store Authentication Manager
const Auth = {
  // Store authentication data
  saveSession(user, token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    // Trigger navbar and route updates
    window.dispatchEvent(new Event('auth-change'));
  },

  // Clear session
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    window.location.hash = '#/';
  },

  // Read functions
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  },

  // Log in user
  async login(email, password) {
    try {
      const result = await API.auth.login(email, password);
      if (result.success && result.data.token) {
        this.saveSession(
          {
            _id: result.data._id,
            name: result.data.name,
            email: result.data.email,
          },
          result.data.token
        );
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Register user
  async register(name, email, password) {
    try {
      const result = await API.auth.register(name, email, password);
      if (result.success && result.data.token) {
        this.saveSession(
          {
            _id: result.data._id,
            name: result.data.name,
            email: result.data.email,
          },
          result.data.token
        );
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};
