import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress, Box, Alert } from '@mui/material';
import { api } from '../services/api';

function HotTopics() {
  const [hotPosts, setHotPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadHotPosts = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log('Fetching all posts...');
      const allPosts = await api.getAllPosts();

      if (allPosts.length === 0) {
        setLoadError('No posts found');
        return;
      }

      console.log('Fetching comments for all posts...');
      const postsWithComments = await Promise.all(
        allPosts.map(async (post) => {
          const comments = await api.getPostComments(post.id);
          return {
            ...post,
            commentCount: comments?.length || 0,
          };
        })
      );

      const maxComments = Math.max(...postsWithComments.map((post) => post.commentCount));
      console.log('Maximum comments:', maxComments);

      const trending = postsWithComments
        .filter((post) => post.commentCount === maxComments)
        .sort((a, b) => b.id - a.id);

      console.log('Hot topics:', trending);
      setHotPosts(trending);
    } catch (error) {
      console.error('Error loading hot topics:', error);
      setLoadError(error.message || 'Failed to fetch hot topics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHotPosts();
    const interval = setInterval(loadHotPosts, 60000);
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

  if (hotPosts.length === 0) {
    return (
      <Box m={2}>
        <Alert severity="info">No hot topics available at the moment.</Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {hotPosts.map((post) => (
        <Grid item xs={12} sm={6} md={4} key={post.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User ID: {post.userid}
              </Typography>
              <Typography variant="body1" paragraph>
                {post.content}
              </Typography>
              <Typography variant="body2" color="primary">
                Comments: {post.commentCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Post ID: {post.id}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default HotTopics;
