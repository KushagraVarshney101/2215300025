import axios from 'axios';

const BASE_URL = 'http://20.244.56.144/evaluation-service';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ0OTU3MTk1LCJpYXQiOjE3NDQ5NTY4OTUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImI4MjdhY2Y1LTI3YjYtNGU1MC04NzE3LWEzMmJkMTExNGQ5ZiIsInN1YiI6Imt1c2hhZ3JhLnZhcnNobmV5X2NzLmNzZjIyQGdsYS5hYy5pbiJ9LCJlbWFpbCI6Imt1c2hhZ3JhLnZhcnNobmV5X2NzLmNzZjIyQGdsYS5hYy5pbiIsIm5hbWUiOiJrdXNoYWdyYSB2YXJzaG5leSIsInJvbGxObyI6IjIyMTUzMDAwMjUiLCJhY2Nlc3NDb2RlIjoiQ05uZUdUIiwiY2xpZW50SUQiOiJiODI3YWNmNS0yN2I2LTRlNTAtODcxNy1hMzJiZDExMTRkOWYiLCJjbGllbnRTZWNyZXQiOiJ5VnVDVFJSU0dLVmRTWVNCIn0.57l8msGlhjSay3Ox7cSsRNfnvf7KodmdnnSBOzN7I1o';
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: AUTH_TOKEN
  }
});

axiosInstance.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

axiosInstance.interceptors.response.use(
  response => {
    console.log('Response:', response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.message, error.response?.data);
    return Promise.reject(error);
  }
);

export const api = {
  async getUsers() {
    try {
      const { data } = await axiosInstance.get('/users');
      console.log('Users data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getUserPosts(userId) {
    try {
      const { data } = await axiosInstance.get(`/users/${userId}/posts`);
      console.log(`Posts for user ${userId}:`, data);
      return data.posts || [];
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error);
      return [];
    }
  },

  async getPostComments(postId) {
    try {
      const { data } = await axiosInstance.get(`/posts/${postId}/comments`);
      console.log(`Comments for post ${postId}:`, data);
      return data.comments || [];
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return [];
    }
  },

  async getAllPosts() {
    try {
      const usersResponse = await this.getUsers();
      const users = usersResponse.users;

      if (!users || Object.keys(users).length === 0) {
        console.error('No users found');
        return [];
      }

      const postsArrays = await Promise.all(
        Object.keys(users).map(userId => this.getUserPosts(userId))
      );

      const allPosts = postsArrays.flat();

      const postsWithUserNames = allPosts.map(post => ({
        ...post,
        user: users[post.userId] // Attach actual user info
      }));

      console.log('All posts with user names:', postsWithUserNames);
      return postsWithUserNames;
    } catch (error) {
      console.error('Error in getAllPosts:', error);
      return [];
    }
  }
};
