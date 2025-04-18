import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress, Box, Alert } from '@mui/material';
import { api } from '../services/api';
import axios from 'axios';

function LivePostStream() {
  const [postList, setPostList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log('Fetching posts...');
      const allPosts = await api.getAllPosts();
      console.log('Fetched posts:', allPosts);

      if (allPosts.length === 0) {
        setLoadError('No posts found');
        return;
      }

      const sortedPosts = allPosts.sort((a, b) => b.id - a.id);
      setPostList(sortedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setLoadError(err.message || 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    const interval = setInterval(loadPosts, 30000); // refresh every 30 seconds
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
        <Alert severity="error">
          {loadError}
        </Alert>
      </Box>
    );
  }

  if (postList.length === 0) {
    return (
      <Box m={2}>
        <Alert severity="info">
          No posts available at the moment.
        </Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {postList.map((post) => (
        <Grid item xs={12} sm={6} md={4} key={post.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User ID: {post.userid}
              </Typography>
              <Typography variant="body1">
                {post.content}
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

export default LivePostStream;
