
import { NutritionState } from '../types';

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  phoneNumber: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  nutrition?: NutritionState;
}

const USERS_KEY = 'smartsos_users';
const SESSION_KEY = 'smartsos_session';

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Default nutrition state for new users
const DEFAULT_NUTRITION: NutritionState = {
  isConfigured: false,
  weight: 0,
  height: 0,
  goal: 'maintain',
  activityLevel: 'light',
  dailyCalorieTarget: 2000,
  caloriesConsumed: 0,
  macros: { protein: 0, carbs: 0, fats: 0 },
  meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
  waterIntake: 0
};

export const authService = {
  /**
   * Initialize default demo user if not exists
   */
  init() {
    try {
      const usersStr = localStorage.getItem(USERS_KEY);
      if (!usersStr) {
        // Removed : User type annotation to allow password field in storage object
        const demoUser = {
          id: 'user_demo_1',
          email: 'margaret@example.com',
          password: 'password', // Storing plain text for MVP demo only
          name: 'Margaret Thompson',
          age: 72,
          phoneNumber: '+15550109988',
          nutrition: DEFAULT_NUTRITION
        };
        localStorage.setItem(USERS_KEY, JSON.stringify([demoUser]));
      }
    } catch (e) {
      console.error("Auth Init Error:", e);
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
    
    // Ensure nutrition object exists even for old users
    if (!user.nutrition) {
      user.nutrition = DEFAULT_NUTRITION;
    }
    
    const sessionUser: User = { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      age: user.age,
      phoneNumber: user.phoneNumber,
      telegramBotToken: user.telegramBotToken,
      telegramChatId: user.telegramChatId,
      nutrition: user.nutrition
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
      phoneNumber,
      nutrition: DEFAULT_NUTRITION
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    const sessionUser: User = { 
      id: newUser.id, 
      email: newUser.email, 
      name: newUser.name, 
      age: newUser.age,
      phoneNumber: newUser.phoneNumber,
      nutrition: newUser.nutrition
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async logout() {
    await delay(300);
    localStorage.removeItem(SESSION_KEY);
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    // Simulate API delay
    await delay(300);
    
    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];
    const index = users.findIndex((u: any) => u.id === userId);
    
    if (index === -1) throw new Error("User not found");
    
    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update session if it matches the current user
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.id === userId) {
            // Merge session data with updates (to keep session clean)
            const updatedSession = { ...session, ...updates };
            localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
        }
    }
    
    return updatedUser;
  },

  getCurrentUser(): User | null {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch (e) {
      console.error("Session Parse Error:", e);
      // Clear invalid session
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
};
