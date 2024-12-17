// app/page.tsx
"use client";
import React, {useState} from 'react';

const Home = () => {

  const [likes, setLikes] = useState(10);
  const [alreadyLiked, setAlreadyLiked] = useState(false);

  const [dislikes, setDislikes] = useState(2)
  const [alreadyDisliked, setAlreadyDisliked] = useState(false);


  const handleLike = () => { 
    if(!alreadyDisliked){
      if(alreadyLiked) {
        setLikes(likes-1);
        setAlreadyLiked(false);
      } else {
        setLikes(likes+1);
        setAlreadyLiked(true);
      }
    }
  };

  const handleDislike = () => { 
    if(!alreadyLiked){
      if(alreadyDisliked) {
        setDislikes(dislikes-1);
        setAlreadyDisliked(false);
      } else {
        setDislikes(dislikes+1);
        setAlreadyDisliked(true);
      }
      setDislikes(dislikes+1);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="flex-1 bg-gray-200 text-black flex items-center flex-col">
      <h2 className="text-3xl p-2 text-black font-bold text-center font-serif">Profile</h2>
        <img src="https://www.example.com/profile-photo.jpg" alt="Profile" className="w-24 h-24 rounded-full mb-4 m-5 border-x border-black" />
      </div>

      {/* Center Panel */}
      <div className="flex-grow bg-white p-8 border-x border-gray-300 text-black">
        <h2 className="text-5xl text-center font-bold font-serif text-500">Merced Meals</h2>

        {/* Feed - Post 1 */}
        <div className="bg-white shadow-md rounded-lg p-4 border">
          <div className="flex items-center mb-4">
            {/* Profile Picture */}
            <img
              src="https://www.example.com/profile-photo.jpg"
              alt="Profile"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h3 className="text-lg font-semibold">Erika</h3>
              <p className="text-gray-500 text-sm">2 hours ago</p>
            </div>
          </div>

          {/* Post Image */}
          <img
            src="https://via.placeholder.com/600x400"
            alt="Post"
            className="w-auto h-auto rounded-lg mb-4"
          />

          {/* Caption */}
          <p className="text-base mb-4">This is an amazing post caption!</p>
          <p className="text-blue-400">#food #delicious</p>

          {/* Interaction Buttons (Likes, Dislikes, Comments) */}
          <div className="flex justify-between text-gray-500">
            <div className="flex items-center space-x-2">
              <button onClick={handleLike} className="flex items-center">
                <span>👍</span> 
                <span>{likes}</span> 
              </button>
              <button onClick={handleDislike} className="flex items-center">
                <span>👎</span> 
                <span>{dislikes}</span>
              </button>
            </div>
            <button className="flex items-center">
              💬 12 Comments
            </button>
          </div>
        </div>

      </div>



      {/* Right Panel */}
      <div className="flex-1 bg-gray-100 text-black">
      <h2 className="text-3xl p-2 text-black font-bold text-center font-serif">Tags</h2>
      </div>
    </div>
  )
}

export default Home
