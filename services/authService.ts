
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  phoneNumber: string;
}

const USERS_KEY = 'smartsos_users';
const SESSION_KEY = 'smartsos_session';

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  /**
   * Initialize default demo user if not exists
   */
  init() {
    const usersStr = localStorage.getItem(USERS_KEY);
    if (!usersStr) {
      const demoUser = {
        id: 'user_demo_1',
        email: 'margaret@example.com',
        password: 'password', // Storing plain text for MVP demo only
        name: 'Margaret Thompson',
        age: 72,
        phoneNumber: '+15550109988'
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([demoUser]));
    }
  },

  async login(email: string, password: string): Promise<User> {
    await delay(800); // Simulate API call
    this.init(); // Ensure DB is seeded

    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const sessionUser = { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      age: user.age,
      phoneNumber: user.phoneNumber 
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async register(email: string, password: string, name: string, age: number, phoneNumber: string): Promise<User> {
    await delay(800);
    this.init();

    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];

    if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      age,
      phoneNumber
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    const sessionUser = { 
      id: newUser.id, 
      email: newUser.email, 
      name: newUser.name, 
      age: newUser.age,
      phoneNumber: newUser.phoneNumber 
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async logout() {
    await delay(300);
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): User | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};