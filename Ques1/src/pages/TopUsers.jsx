import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress, Box, Alert } from '@mui/material';
import { api } from '../services/api';

function UserEngagementHighlights() {
  const [engagedUsers, setEngagedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadUserStats = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log('Fetching users...');
      const users = await api.getUsers();
      console.log('Fetched users:', users);

      if (!users || Object.keys(users).length === 0) {
        setLoadError('No users found');
        return;
      }

      const userStats = await Promise.all(
        Object.entries(users).map(async ([userId, userName]) => {
          console.log(`Fetching posts for user ${userId}`);
          const posts = await api.getUserPosts(userId);
          let totalComments = 0;

          await Promise.all(
            posts.map(async (post) => {
              const comments = await api.getPostComments(post.id);
              totalComments += comments?.length || 0;
            })
          );

          return {
            userId,
            userName,
            totalComments,
            postsCount: posts.length,
          };
        })
      );

      const sortedUsers = userStats
        .sort((a, b) => b.totalComments - a.totalComments)
        .slice(0, 5);

      console.log('Top engaged users:', sortedUsers);
      setEngagedUsers(sortedUsers);
    } catch (error) {
      console.error('Error loading user stats:', error);
      setLoadError(error.message || 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserStats();
    const interval = setInterval(loadUserStats, 60000); // Refresh every 1 minute
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box m={2}>
        <Alert severity="error">{loadError}</Alert>
      </Box>
    );
  }

  if (engagedUsers.length === 0) {
    return (
      <Box m={2}>
        <Alert severity="info">No user data available at the moment.</Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {engagedUsers.map((user) => (
        <Grid item xs={12} sm={6} md={4} key={user.userId}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {user.userName}
              </Typography>
              <Typography variant="body1">
                Total Comments: {user.totalComments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Posts: {user.postsCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default UserEngagementHighlights;
