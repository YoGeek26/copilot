// Simulated database using localStorage for Bolt.diy
import { User, Post, Review, ReviewResponse, Client, Stats, Subscription } from '../types';

class LocalStorage {
  private getItem<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setItem<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Users
  getUsers(): User[] {
    return this.getItem<User>('users');
  }

  createUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.setItem('users', users);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  updateUser(userId: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.setItem('users', users);
    }
  }

  // Posts
  getPosts(userId?: string): Post[] {
    const posts = this.getItem<Post>('posts');
    return userId ? posts.filter(p => p.userId === userId) : posts;
  }

  createPost(post: Post): void {
    const posts = this.getPosts();
    posts.push(post);
    this.setItem('posts', posts);
  }

  updatePost(postId: string, updates: Partial<Post>): void {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      this.setItem('posts', posts);
    }
  }

  // Reviews
  getReviews(userId?: string): Review[] {
    const reviews = this.getItem<Review>('reviews');
    return userId ? reviews.filter(r => r.userId === userId) : reviews;
  }

  createReview(review: Review): void {
    const reviews = this.getReviews();
    reviews.push(review);
    this.setItem('reviews', reviews);
  }

  // Review Responses
  getReviewResponses(): ReviewResponse[] {
    return this.getItem<ReviewResponse>('reviewResponses');
  }

  createReviewResponse(response: ReviewResponse): void {
    const responses = this.getReviewResponses();
    responses.push(response);
    this.setItem('reviewResponses', responses);
  }

  updateReviewResponse(responseId: string, updates: Partial<ReviewResponse>): void {
    const responses = this.getReviewResponses();
    const index = responses.findIndex(r => r.id === responseId);
    if (index !== -1) {
      responses[index] = { ...responses[index], ...updates };
      this.setItem('reviewResponses', responses);
    }
  }

  // Clients
  getClients(userId: string): Client[] {
    const clients = this.getItem<Client>('clients');
    return clients.filter(c => c.userId === userId);
  }

  createClient(client: Client): void {
    const clients = this.getItem<Client>('clients');
    clients.push(client);
    this.setItem('clients', clients);
  }

  // Stats
  getStats(userId: string): Stats[] {
    const stats = this.getItem<Stats>('stats');
    return stats.filter(s => s.userId === userId);
  }

  createStats(stats: Stats): void {
    const allStats = this.getItem<Stats>('stats');
    allStats.push(stats);
    this.setItem('stats', allStats);
  }

  // Subscriptions
  getSubscription(userId: string): Subscription | undefined {
    const subscriptions = this.getItem<Subscription>('subscriptions');
    return subscriptions.find(s => s.userId === userId);
  }

  setSubscription(subscription: Subscription): void {
    const subscriptions = this.getItem<Subscription>('subscriptions');
    const index = subscriptions.findIndex(s => s.userId === subscription.userId);
    if (index !== -1) {
      subscriptions[index] = subscription;
    } else {
      subscriptions.push(subscription);
    }
    this.setItem('subscriptions', subscriptions);
  }

  // Session
  setCurrentUser(userId: string): void {
    localStorage.setItem('currentUserId', userId);
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('currentUserId');
  }

  clearSession(): void {
    localStorage.removeItem('currentUserId');
  }
}

export const storage = new LocalStorage();
