/* eslint-disable @next/next/no-img-element */
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
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  interface Post {
    title: string;
    content: string;
    id: number;
    user: { name: string };
    user_id: number;
    timestamp: string;
    image_url: string;
    caption: string;
    upvotes: number;
    downvotes: number;
    comments_count: number;
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<{ name: string }[]>([]);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.sub;
    }
    return null;
  };

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("No valid token found. Redirecting to login...");
      router.push("/login"); // Redirect after a small delay
      return;
    }
    setIsAuthChecked(true); // Allow component rendering after auth is checked
    fetch(`http://127.0.0.1:5000/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUserProfile(data))
      .catch((err) => console.error("Error fetching profile:", err));
  }, [router]);

  if (!isAuthChecked) {
    return <p>Loading...</p>; // Render a fallback while checking auth
  }

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
      .then(async (data) => {
        // Fetch user details for each post
        const postsWithUser = await Promise.all(
          data.map(async (post: Post) => {
            try {
              const userRes = await fetch(`http://127.0.0.1:5000/api/users/${post.user_id}`);
              const userData = await userRes.json();
              return { ...post, user: userData };
            } catch (err) {
              console.error(`Error fetching user for post ${post.id}:`, err);
              return { ...post, user: { name: "Unknown User" } };
            }
          })
        );
        setPosts(postsWithUser);
      })
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
                  {/* User Info */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar src="https://via.placeholder.com/50" />
                    <Box ml={2}>
                      <Typography variant="subtitle1">{post.user?.name || "Unknown User"}</Typography>
                    </Box>
                  </Box>

                  {/* Post Image */}
                  <img
                    src={post.image_url || "https://via.placeholder.com/600x400"}
                    alt="Post"
                    style={{ width: "100%", borderRadius: "12px", marginBottom: 16 }}
                  />

                  {/* Title and Content */}
                  <Typography variant="h6" gutterBottom>
                    {post.title || "Untitled Post"}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {post.content || ""}
                  </Typography>

                  {/* Divider and Action Buttons */}
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
