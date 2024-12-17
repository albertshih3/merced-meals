"use client";

import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import NewPostForm from "./components/newpostform";
import { styled } from "@mui/system";
import { useEffectOnce } from "react-use";

interface UserProfile {
  name: string;
  email: string;
}

const ScrollableBox = styled(Box)({
  overflowY: "auto",
  maxHeight: "100%",
  paddingRight: "8px",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#bbb",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#888",
  },
});

const CursiveHeader = styled(Typography)({
  fontFamily: "'Dancing Script', cursive",
  color: "#2C3E50",
  fontSize: "3rem",
  textAlign: "center",
  marginBottom: "1rem",
});

const RoundedCard = styled(Card)({
  borderRadius: "16px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
});

const Home = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [tags, setTags] = useState<{ name: string }[]>([]);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.sub;
    }
    return null;
  };

  useEffectOnce(() => {
    document.body.style.overflow = "hidden"; // Prevent body scrolling
    return () => {
      document.body.style.overflow = "auto"; // Re-enable body scrolling when component unmounts
    };
  });

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("No valid token found");
      return;
    }

    fetch(`http://127.0.0.1:5000/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUserProfile(data))
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tags")
      .then((res) => res.json())
      .then((data) => setTags(data.tags || []))
      .catch((err) => console.error("Error fetching tags:", err));
  }, []);

  return (
    <Box
      display="flex"
      height="100vh"
      bgcolor="#EAF2F8"
      overflow="hidden" // Prevent outer container scrolling
    >
      {/* Left Column */}
      <Box width="20%" padding={2} bgcolor="#FDFEFE">
        <RoundedCard>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Profile
            </Typography>
            {userProfile ? (
              <>
                <Avatar
                  src="https://via.placeholder.com/150"
                  sx={{ width: 100, height: 100, margin: "0 auto" }}
                />
                <Typography variant="h6" align="center">
                  {userProfile.name}
                </Typography>
                <Typography color="textSecondary" align="center">
                  {userProfile.email}
                </Typography>
              </>
            ) : (
              <Typography align="center">Loading...</Typography>
            )}
          </CardContent>
        </RoundedCard>
      </Box>

      {/* Center Column */}
      <Box flexGrow={1} padding={2} display="flex" flexDirection="column" maxHeight="100vh">
        <CursiveHeader>Merced Meals</CursiveHeader>
        <ScrollableBox flexGrow={1}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <RoundedCard key={post.id} sx={{ marginBottom: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar src="https://via.placeholder.com/50" />
                    <Box ml={2}>
                      <Typography variant="subtitle1">{post.user?.name || "Unknown User"}</Typography>
                      <Typography color="textSecondary" variant="caption">
                        {new Date(post.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <img
                    src={post.image_url || "https://via.placeholder.com/600x400"}
                    alt="Post"
                    style={{ width: "100%", borderRadius: "12px", marginBottom: 16 }}
                  />
                  <Typography>{post.caption}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Button>👍 {post.upvotes}</Button>
                    <Button>👎 {post.downvotes}</Button>
                    <Button>💬 {post.comments_count} Comments</Button>
                  </Box>
                </CardContent>
              </RoundedCard>
            ))
          ) : (
            <Typography align="center" color="textSecondary">
              No posts available.
            </Typography>
          )}
        </ScrollableBox>
      </Box>

      {/* Right Column */}
      <Box width="20%" padding={2} bgcolor="#FDFEFE">
        <RoundedCard>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Tags
            </Typography>
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={`#${tag.name}`}
                  variant="outlined"
                  color="primary"
                  sx={{ margin: 0.5, borderRadius: "16px", backgroundColor: "#D6EAF8" }}
                />
              ))
            ) : (
              <Typography align="center" color="textSecondary">
                No tags available.
              </Typography>
            )}
          </CardContent>
        </RoundedCard>
      </Box>

      <NewPostForm />
    </Box>
  );
};

export default Home;
