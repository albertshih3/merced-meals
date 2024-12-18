import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { jwtDecode } from "jwt-decode";

const NewPostForm = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setCaption("");
      setSelectedFile(null);
      setIsLoading(false);
      setError(null);
    }
  }, [open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.sub;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    const userId = getUserIdFromToken();
  
    if (!userId) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }
  
    try {
      // First, create the post
      const postResponse = await fetch("http://127.0.0.1:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          content: caption,
          user_id: userId,
        }),
      });
  
      if (!postResponse.ok) {
        throw new Error("Failed to create post");
      }
  
      const postData = await postResponse.json();
      const postId = postData.id;
  
      // If there's a selected file, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append("photo", selectedFile);
        formData.append("post_id", postId);
        formData.append("user_id", userId);
  
        const photoResponse = await fetch("http://127.0.0.1:5000/api/photos", {
          method: "POST",
          body: formData,
        });
  
        if (!photoResponse.ok) {
          throw new Error("Failed to upload photo");
        }
      }
  
      // Reset form and close dialog
      setTitle("");
      setCaption("");
      setSelectedFile(null);
      setOpen(false);
  
      // Optionally trigger a refresh of the posts list
      window.location.reload();
  
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ position: "fixed", bottom: 24, right: 24 }}
      >
        New Post
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />
            <Box textAlign="center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AddPhotoAlternateIcon />}
                >
                  Upload Photo
                </Button>
              </label>
              {selectedFile && (
                <Typography mt={1}>{selectedFile.name}</Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpen(false)} 
            color="secondary"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={isLoading || !title || !caption}
          >
            {isLoading ? <CircularProgress size={24} /> : "Create Post"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NewPostForm;