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
      const file = e.target.files[0];
      const fileName = file.name;
      
      // If a file is already selected, modify the filename
      if (selectedFile) {
        const nameParts = fileName.split('.');
        const extension = nameParts.pop();
        const baseFileName = nameParts.join('.');
        
        const newFileName = `${baseFileName}_${Date.now()}.${extension}`;
        
        // Create a new File object with a unique name
        const uniqueFile = new File([file], newFileName, {
          type: file.type,
          lastModified: file.lastModified
        });
        
        setSelectedFile(uniqueFile);
      } else {
        // First file selection remains unchanged
        setSelectedFile(file);
      }
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
      // Step 1: Create the post
      const postResponse = await fetch("http://127.0.0.1:5000/api/posts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: title,
          content: caption,
          user_id: userId,
        }),
      });
  
      const postData = await postResponse.json();
      const postId = postData.id || postData.post_id || (postData.data && postData.data.id);
  
      console.log("Post Creation Response:", postData);
      console.log("Extracted Post ID:", postId);
  
      // Step 2: Upload the photo if a file is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("photo", selectedFile);
        formData.append("post_id", postId.toString());
        formData.append("user_id", userId);
  
        console.log("FormData contents:");
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }
  
        const photoResponse = await fetch("http://127.0.0.1:5000/api/photos", {
          method: "POST",
          // DO NOT set Content-Type header for FormData
          body: formData,
        });
  
        console.log("Photo Upload Response Status:", photoResponse.status);
        const photoResponseText = await photoResponse.text();
        console.log("Photo Upload Response Text:", photoResponseText);
  
        if (!photoResponse.ok) {
          throw new Error(`Photo upload failed. Status: ${photoResponse.status}, Response: ${photoResponseText}`);
        }
  
        console.log("Photo uploaded successfully");
      }
  
      // Reset form and close dialog
      setTitle("");
      setCaption("");
      setSelectedFile(null);
      setOpen(false);
  
      window.location.reload();
    } catch (err) {
      console.error("Full error:", err);
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