import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extended Session interface to include custom user properties
   */
  interface Session {
    user: {
      id: string;
      email: string;
      displayName?: string;
      avatarUrl?: string;
      defaultBudget?: number;
      defaultCity?: string;
    } & DefaultSession['user'];
  }

  /**
   * Extended User interface
   */
  interface User {
    id: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    defaultBudget?: number;
    defaultCity?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface
   */
  interface JWT {
    id: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
  }
}
