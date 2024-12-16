export interface Task {
    _id: string;
    title: string;
    description?: string;
    createdAt: Date;
    userId: string;
  }
  
  export interface User {
    _id: string;
    email: string;
    name: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }