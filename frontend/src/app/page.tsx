/* eslint-disable @next/next/no-img-element */
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  Button,
  Divider
} from "@mui/material";
import { styled } from "@mui/system";
import { useEffectOnce } from "react-use";
import NewPostForm from "./components/newpostform";
import { KeyboardReturnRounded } from "@mui/icons-material";

interface UserProfile {
  name: string;
  email: string;
}

const ScrollableBox = styled(Box)({
  overflowY: "auto",
  maxHeight: "100%",
  paddingRight: "8px",
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
  interface Post {
    user: { name: string; email: string };
    image_url: string;
    content: string;
    upvotes: ReactNode;
    downvotes: ReactNode;
    comments_count: ReactNode;
    title: string;
    id: string;
    // Add other properties of Post if needed
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<{ name: string }[]>([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [resetForm, setResetForm] = useState(false);

  const [interactionState, setInteractionState] = useState<{ [key: number]: "upvote" | "downvote" | null }>({});

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    router.push("/login"); // Redirect user to login
  };

  const handleUpvote = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if(post.id === postId){
          if(interactionState[postId] === "upvote" ) {

            setInteractionState((prev) => ({ ...prev, [postId]: null}));
            return { ...post, upvotes: post.upvotes - 1 };
          } else {
            setInteractionState((prev) => ({ ...prev, [postId]: "upvote"}));
            return { ...post, upvotes: post.upvotes + 1, downvotes: interactionState[postId] === "downvote" ? post.downvotes - 1 : post.downvotes };
          }
        }
       return post; 
      })
    );
  };

  const handleDownvote = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if(post.id === postId){
          if(interactionState[postId] === "downvote" ) {

            setInteractionState((prev) => ({ ...prev, [postId]: null}));
            return { ...post, downvotes: post.downvotes - 1 };
          } else {
            setInteractionState((prev) => ({ ...prev, [postId]: "downvote"}));
            return { ...post, downvotes: post.downvotes + 1, upvotes: interactionState[postId] === "upvote" ? post.upvotes - 1 : post.upvotes };
          }
        }
       return post; 
      })
    );
  };

  const handleResetForm = () => {
    setResetForm(true);
    setTimeout(() => setResetForm(false), 0);
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.sub;
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
    return null;
  };

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("No valid token found. Redirecting...");
      router.push("/login");
    } else {
      setIsAuthChecked(true);
      fetch(`http://127.0.0.1:5000/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => setUserProfile(data))
        .catch((err) => console.error("Error fetching profile:", err));
    }
  }, [router]);

  useEffectOnce(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  });

  useEffect(() => {
    if (isAuthChecked) {
      fetch("http://127.0.0.1:5000/api/posts")
        .then((res) => res.json())
        .then(setPosts)
        .catch((err) => console.error("Error fetching posts:", err));
    }
  }, [isAuthChecked]);

  useEffect(() => {
    if (isAuthChecked) {
      fetch("http://127.0.0.1:5000/api/tags")
        .then((res) => res.json())
        .then((data) => setTags(data.tags || []))
        .catch((err) => console.error("Error fetching tags:", err));
    }
  }, [isAuthChecked]);

  if (!isAuthChecked) {
    return <Typography align="center">Checking Authentication...</Typography>;
  }

  return (
    <Box display="flex" height="100vh" bgcolor="#EAF2F8" overflow="hidden">
      <Box width="20%" padding={2} bgcolor="#FDFEFE">
        <RoundedCard>
          <CardContent>
            <Typography variant="h5" align="center">
              Profile
            </Typography>
            <Typography variant="h6" align="center">
              {userProfile?.name}
            </Typography>
            <Typography align="center" color="textSecondary">
              {userProfile?.email}
            </Typography>
            {/* Logout Button */}
            <Box mt={2} display="flex" justifyContent="center">
              <Button
                onClick={handleLogout}
                variant="contained"
                color="primary"
                startIcon={<KeyboardReturnRounded />}
              >
                Logout
              </Button>
            </Box>
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
                    <Button onClick={() => handleUpvote(post.id)} color={interactionState[post.id] === "upvote" ? "primary" : "default"} >👍 {post.upvotes}</Button>
                    <Button onClick={() => handleDownvote(post.id)} color={interactionState[post.id] === "downvote" ? "secondary" : "default"}>👎 {post.downvotes}</Button>
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
      <NewPostForm />
      </Box>
    </Box>
  );
};

export default Home;
