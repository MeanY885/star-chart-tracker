import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  IconButton, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Star, AddCircle, RemoveCircle, Edit, EmojiEvents, Refresh, AutoAwesome, Favorite, Cake, School, SportsScore, CleaningServices, LocalLibrary, Mood, FamilyRestroom, Pets, Check } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const rainbowKeyframes = `
@keyframes rainbow {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}

@keyframes glisten {
  0%, 100% { opacity: 1 }
  50% { opacity: 0.8 }
}
`;

function App() {
  const [points, setPoints] = useState(0);
  const [starComments, setStarComments] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [showNewStar, setShowNewStar] = useState(false);
  const [newStarPosition, setNewStarPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [currentStarIndex, setCurrentStarIndex] = useState(null);
  const [removingStar, setRemovingStar] = useState(false);
  const [removeStarPosition, setRemoveStarPosition] = useState({ x: 0, y: 0 });
  const [isAmazingAnimation, setIsAmazingAnimation] = useState(false);
  const [recentAnimations, setRecentAnimations] = useState([]);
  const [rewardPreview, setRewardPreview] = useState({
    stars: 15,
    reward: "Special Day Out! 🎉",
    description: "Choose any fun activity for a special family day!"
  });
  const [stickerType, setStickerType] = useState({});
  const [isEditingReward, setIsEditingReward] = useState(false);

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  // Sound effects using Web Audio API
  const playSound = useCallback((type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (type === 'add') {
        // Play a cheerful ascending tone for adding stars
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - happy chord
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime + index * 0.1);
          oscillator.stop(audioContext.currentTime + 0.5 + index * 0.1);
        });
      } else if (type === 'remove') {
        // Play a descending tone for removing stars
        const frequencies = [783.99, 659.25, 523.25]; // G5, E5, C5 - descending
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          
          oscillator.start(audioContext.currentTime + index * 0.08);
          oscillator.stop(audioContext.currentTime + 0.4 + index * 0.08);
        });
      }
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }, []);

  // Load data from server
  useEffect(() => {
    fetch('/data/star-chart-data.json')
      .then(response => response.json())
      .catch(() => ({ points: 0, starComments: {}, stickerTypes: {}, rewardPreview: null }))
      .then(data => {
        setPoints(data.points || 0);
        setStarComments(data.starComments?.comments || {});
        setStickerType(data.starComments?.stickerTypes || {});
        if (data.rewardPreview) {
          setRewardPreview(data.rewardPreview);
        }
        if (data.points >= 15) {
          setShowCelebration(true);
        }
      });
  }, []);

  // Save data to server
  const saveData = async (newPoints, newComments, newStickerTypes = null, newRewardPreview = null) => {
    try {
      const payload = {
        points: newPoints,
        starComments: newComments,
        stickerTypes: newStickerTypes || stickerType
      };
      
      if (newRewardPreview) {
        payload.rewardPreview = newRewardPreview;
      }

      const response = await fetch('/data/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        console.error('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    saveData(points, starComments, stickerType);
    if (points >= 15) {
      setShowCelebration(true);
    }
  }, [points, starComments, stickerType]);

  const handleStarClick = (index) => {
    if (index < points) {
      // Removing a star
      playSound('remove');
      
      const starElement = document.querySelector(`[data-star-index="${index}"]`);
      if (starElement) {
        const rect = starElement.getBoundingClientRect();
        setRemoveStarPosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
        setRemovingStar(true);
        setTimeout(() => {
          setPoints(prev => prev - 1);
          const newComments = { ...starComments };
          delete newComments[index];
          // Shift all comments down by one
          for (let i = index + 1; i < points; i++) {
            if (newComments[i]) {
              newComments[i - 1] = newComments[i];
              delete newComments[i];
            }
          }
          setStarComments(newComments);
          setRemovingStar(false);
        }, 2000);
      }
    } else if (index === points) {
      // Adding a star
      handleAddPoint();
    }
  };

  const handleAddPoint = () => {
    setLastAction('add');
    const newPoints = Math.min(points + 1, 15);
    
    if (newPoints > points) {
      // Play sound effect
      playSound('add');
      
      const edges = [
        { x: Math.random() * window.innerWidth, y: -100 },
        { x: window.innerWidth + 100, y: Math.random() * window.innerHeight },
        { x: Math.random() * window.innerWidth, y: window.innerHeight + 100 },
        { x: -100, y: Math.random() * window.innerHeight }
      ];
      const startPos = edges[Math.floor(Math.random() * edges.length)];
      setNewStarPosition(startPos);

      const targetIndex = points;
      const starElement = document.querySelector(`[data-star-index="${targetIndex}"]`);
      if (starElement) {
        const rect = starElement.getBoundingClientRect();
        setTargetPosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
      }

      setShowNewStar(true);
    }
  };

  const handleRemovePoint = () => {
    setLastAction('remove');
    setPoints(prev => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setPoints(0);
    setStarComments({});
    setStickerType({});
    saveData(0, {}, {});
  };

  const handleClaimPrize = () => {
    setShowCelebration(false);
    handleReset();
  };

  const handleAmazingAchievement = () => {
    const newPoints = Math.min(points + 5, 15);
    if (newPoints > points) {
      setIsAmazingAnimation(true);
      setLastAction('amazing');
      
      // Play a special sound for amazing achievement
      playSound('add');
      
      // Create multiple star animations
      const starsToAdd = newPoints - points;
      for (let i = 0; i < starsToAdd; i++) {
        setTimeout(() => {
          // Play add sound for each star
          if (i > 0) playSound('add');
          
          const targetIndex = points + i;
          const starElement = document.querySelector(`[data-star-index="${targetIndex}"]`);
          if (starElement) {
            const rect = starElement.getBoundingClientRect();
            setTargetPosition({ 
              x: rect.left + rect.width / 2, 
              y: rect.top + rect.height / 2 
            });
          }
          setNewStarPosition({
            x: Math.random() * window.innerWidth,
            y: -100 - (i * 50) // Start each star higher than the last
          });
          setShowNewStar(true);
        }, i * 1000); // Stagger the start of each star animation
      }

      // Update points after all animations
      setTimeout(() => {
        setPoints(newPoints);
        setIsAmazingAnimation(false);
      }, starsToAdd * 1000 + 5000);
    }
  };

  const particlesOptions = {
    particles: {
      number: { value: 50 },
      color: { value: "#FFD700" },
      shape: { type: "star" },
      size: { value: 3, random: true },
      move: {
        enable: true,
        speed: 3,
        direction: "none",
        random: true,
        straight: false,
        outModes: "out"
      },
      opacity: { value: 0.8 },
      life: { duration: { value: 2 } }
    }
  };

  // Update particlesOptions for amazing achievement
  const amazingParticlesOptions = {
    particles: {
      number: { value: 100 },
      color: { 
        value: ["#FFD700", "#FFA500", "#FF69B4", "#4CAF50", "#00BCD4"] 
      },
      shape: { 
        type: ["star", "circle"],
        options: {
          star: {
            sides: 5
          }
        }
      },
      size: { value: { min: 3, max: 8 } },
      move: {
        enable: true,
        speed: 6,
        direction: "top-to-bottom",
        random: true,
        straight: false,
        outModes: "out"
      },
      opacity: { 
        value: 0.8,
        animation: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.1,
          sync: false
        }
      },
      rotate: {
        value: 360,
        direction: "random",
        animation: {
          enable: true,
          speed: 10
        }
      },
      tilt: {
        enable: true,
        value: 360,
        animation: {
          enable: true,
          speed: 60
        }
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const titleVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const pointsDisplayVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.1,
      rotate: 5,
      transition: { type: "spring", stiffness: 400 }
    },
    tap: { 
      scale: 0.9,
      rotate: -5
    }
  };

  const starVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: (index) => ({
      scale: index < points ? 1 : 0.5,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: index * 0.1
      }
    }),
    exit: { 
      scale: 0,
      rotate: 180,
      transition: { duration: 0.3 }
    },
    pulse: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  };

  const newStarVariants = {
    initial: { 
      position: 'fixed',
      scale: 5,
      x: newStarPosition.x,
      y: newStarPosition.y,
      rotate: 0,
      zIndex: 1000
    },
    animate: () => {
      const animation = generateRandomAnimation();
      const pathPoints = animation.path;
      
      console.log(`Using animation path with ${pathPoints.length} points`);
      
      return {
        x: [newStarPosition.x, ...pathPoints.map(p => p.x), targetPosition.x],
        y: [newStarPosition.y, ...pathPoints.map(p => p.y), targetPosition.y],
        rotate: animation.rotate,
        scale: animation.scale,
        transition: {
          duration: animation.duration,
          ease: "linear",
          times: [0, ...pathPoints.map((_, i) => (i + 1) / (pathPoints.length + 1)), 1],
          x: {
            type: "tween",
            ease: "linear"
          },
          y: {
            type: "tween",
            ease: "linear"
          },
          scale: {
            duration: animation.duration,
            times: [0, 0.2, 0.5, 0.8, 1]
          }
        }
      };
    }
  };

  const removeStarVariants = {
    initial: { 
      position: 'fixed',
      scale: 1,
      x: removeStarPosition.x,
      y: removeStarPosition.y,
      rotate: 0,
      opacity: 1,
      zIndex: 1000
    },
    animate: {
      scale: [1, 1.5, 0.5, 0],
      rotate: [0, 180, 360, 720],
      opacity: [1, 0.8, 0.5, 0],
      transition: {
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  const generateRandomAnimation = () => {
    const animations = [
      // 1. Spiral Animation
      {
        path: Array.from({ length: 20 }, (_, i) => {
          const angle = (i / 20) * Math.PI * 4;
          const radius = (1 - i / 20) * Math.min(window.innerWidth, window.innerHeight) / 2;
          return {
            x: window.innerWidth / 2 + radius * Math.cos(angle),
            y: window.innerHeight / 2 + radius * Math.sin(angle)
          };
        }),
        rotate: 1440,
        scale: [5, 3, 4, 2, 1],
        duration: 5
      },
      // 2. Heart Pattern
      {
        path: Array.from({ length: 20 }, (_, i) => {
          const t = (i / 20) * 2 * Math.PI;
          const x = 16 * Math.pow(Math.sin(t), 3);
          const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
          return {
            x: window.innerWidth/2 + x * 20,
            y: window.innerHeight/2 - y * 20
          };
        }),
        rotate: [0, 360, 720, 1080],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 3. Infinity Loop
      {
        path: Array.from({ length: 24 }, (_, i) => {
          const t = (i / 24) * 2 * Math.PI;
          return {
            x: window.innerWidth/2 + 200 * Math.sin(t) / (1 + Math.pow(Math.cos(t), 2)),
            y: window.innerHeight/2 + 200 * Math.sin(t) * Math.cos(t) / (1 + Math.pow(Math.cos(t), 2))
          };
        }),
        rotate: [0, 720],
        scale: [3, 4, 2, 1],
        duration: 5
      },
      // 4. Pinball
      {
        path: Array.from({ length: 10 }, () => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight
        })),
        rotate: [-360, 720, -180, 360],
        scale: [5, 2, 4, 3, 1],
        duration: 5
      },
      // 5. Rainbow Arc
      {
        path: Array.from({ length: 15 }, (_, i) => {
          const progress = i / 14;
          return {
            x: window.innerWidth * progress,
            y: window.innerHeight/2 - Math.sin(progress * Math.PI) * 300
          };
        }),
        rotate: [0, 180, 360],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 6. Starburst
      {
        path: Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * 2 * Math.PI;
          return {
            x: window.innerWidth/2 + Math.cos(angle) * 400,
            y: window.innerHeight/2 + Math.sin(angle) * 400
          };
        }),
        rotate: [0, 1080],
        scale: [5, 3, 4, 1],
        duration: 5
      },
      // 7. Snake
      {
        path: Array.from({ length: 20 }, (_, i) => ({
          x: (window.innerWidth/20) * i,
          y: window.innerHeight/2 + Math.sin(i/2) * 200
        })),
        rotate: [0, 360, 720],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 8. Ferris Wheel
      {
        path: Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * 2 * Math.PI;
          return {
            x: window.innerWidth/2 + Math.cos(angle) * 300,
            y: window.innerHeight/2 + Math.sin(angle) * 300
          };
        }),
        rotate: [0, 360],
        scale: [3, 4, 2, 1],
        duration: 5
      },
      // 9. Pendulum
      {
        path: Array.from({ length: 12 }, (_, i) => {
          const t = (i / 11) * Math.PI;
          return {
            x: window.innerWidth/2 + Math.sin(t) * 400,
            y: window.innerHeight/2 + Math.cos(t) * 200
          };
        }),
        rotate: [-45, 45, -45],
        scale: [4, 3, 2, 1],
        duration: 5
      },
      // 10. Firework Burst
      {
        path: [
          { x: window.innerWidth/2, y: window.innerHeight },
          { x: window.innerWidth/2, y: window.innerHeight/2 },
          ...Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * 2 * Math.PI;
            return {
              x: window.innerWidth/2 + Math.cos(angle) * 300,
              y: window.innerHeight/2 + Math.sin(angle) * 300
            };
          })
        ],
        rotate: [0, 720],
        scale: [3, 5, 2, 1],
        duration: 5
      },
      // 11. Diamond Pattern
      {
        path: [
          { x: window.innerWidth/2, y: 0 },
          { x: window.innerWidth, y: window.innerHeight/2 },
          { x: window.innerWidth/2, y: window.innerHeight },
          { x: 0, y: window.innerHeight/2 },
          { x: window.innerWidth/2, y: 0 }
        ],
        rotate: [0, 360, 720],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 12. Tornado Spiral
      {
        path: Array.from({ length: 20 }, (_, i) => {
          const angle = (i / 20) * Math.PI * 6;
          const radius = (1 - i/20) * 300;
          return {
            x: window.innerWidth/2 + Math.cos(angle) * radius,
            y: (window.innerHeight/20) * i
          };
        }),
        rotate: [0, 1440],
        scale: [5, 3, 4, 2, 1],
        duration: 5
      },
      // 13. Bouncing Ball
      {
        path: Array.from({ length: 10 }, (_, i) => ({
          x: (window.innerWidth/10) * i,
          y: window.innerHeight - Math.abs(Math.sin(i/2 * Math.PI)) * window.innerHeight * 0.8
        })),
        rotate: [0, 360],
        scale: [3, 2, 4, 1],
        duration: 5
      },
      // 14. Figure Eight
      {
        path: Array.from({ length: 24 }, (_, i) => {
          const t = (i / 24) * 2 * Math.PI;
          return {
            x: window.innerWidth/2 + Math.sin(t) * 300,
            y: window.innerHeight/2 + Math.sin(t * 2) * 150
          };
        }),
        rotate: [0, 720],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 15. Zigzag Bounce
      {
        path: Array.from({ length: 12 }, (_, i) => ({
          x: (window.innerWidth/12) * i,
          y: window.innerHeight/2 + (i % 2 === 0 ? -200 : 200)
        })),
        rotate: [-360, 0, 360],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 16. Orbital Path
      {
        path: Array.from({ length: 30 }, (_, i) => {
          const t = (i / 30) * 2 * Math.PI;
          return {
            x: window.innerWidth/2 + Math.cos(t) * 200 + Math.cos(t * 3) * 100,
            y: window.innerHeight/2 + Math.sin(t) * 200 + Math.sin(t * 3) * 100
          };
        }),
        rotate: [0, 1080],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 17. Wave Pattern
      {
        path: Array.from({ length: 20 }, (_, i) => ({
          x: (window.innerWidth/20) * i,
          y: window.innerHeight/2 + Math.sin(i/3) * 100 + Math.cos(i/2) * 100
        })),
        rotate: [0, 360, 720],
        scale: [3, 4, 2, 1],
        duration: 5
      },
      // 18. Confetti Explosion
      {
        path: Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * 2 * Math.PI;
          const radius = Math.random() * 300 + 100;
          return {
            x: window.innerWidth/2 + Math.cos(angle) * radius,
            y: window.innerHeight/2 + Math.sin(angle) * radius
          };
        }),
        rotate: [-720, 720],
        scale: [5, 2, 4, 1],
        duration: 5
      },
      // 19. Elastic Bounce
      {
        path: Array.from({ length: 8 }, (_, i) => ({
          x: window.innerWidth/2 + (i % 2 === 0 ? -200 : 200),
          y: (window.innerHeight/8) * i
        })),
        rotate: [0, 360],
        scale: [4, 1.5, 3, 1],
        duration: 5
      },
      // 20. Spiral Galaxy
      {
        path: Array.from({ length: 24 }, (_, i) => {
          const angle = (i / 24) * Math.PI * 8;
          const radius = (i / 24) * 300;
          return {
            x: window.innerWidth/2 + Math.cos(angle) * radius,
            y: window.innerHeight/2 + Math.sin(angle) * radius
          };
        }),
        rotate: [0, 1440],
        scale: [5, 3, 4, 2, 1],
        duration: 5
      },
      // 21. Butterfly Pattern
      {
        path: Array.from({ length: 30 }, (_, i) => {
          const t = (i / 30) * 2 * Math.PI;
          return {
            x: window.innerWidth/2 + Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4*t)) * 50,
            y: window.innerHeight/2 + Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4*t)) * 50
          };
        }),
        rotate: [0, 720],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 22. Rubber Band
      {
        path: Array.from({ length: 15 }, (_, i) => {
          const progress = i / 14;
          const wobble = Math.sin(progress * Math.PI * 4) * 100;
          return {
            x: window.innerWidth * progress,
            y: window.innerHeight/2 + wobble
          };
        }),
        rotate: [-360, 0, 360],
        scale: [3, 4, 2, 1],
        duration: 5
      },
      // 23. Meteor Shower
      {
        path: Array.from({ length: 10 }, (_, i) => ({
          x: window.innerWidth - (window.innerWidth/10) * i,
          y: (window.innerHeight/10) * i
        })),
        rotate: [0, 900],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 24. DNA Helix
      {
        path: Array.from({ length: 20 }, (_, i) => {
          const t = (i / 20) * Math.PI * 4;
          return {
            x: window.innerWidth/2 + Math.cos(t) * 200,
            y: (window.innerHeight/20) * i + Math.sin(t) * 100
          };
        }),
        rotate: [0, 1080],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 25. Quantum Jump
      {
        path: Array.from({ length: 6 }, (_, i) => {
          const randomDistance = Math.random() * 400 - 200;
          return {
            x: window.innerWidth/2 + randomDistance,
            y: window.innerHeight/2 + randomDistance
          };
        }),
        rotate: [-720, 720],
        scale: [5, 1, 4, 2, 1],
        duration: 5
      },
      // 26. Roller Coaster
      {
        path: Array.from({ length: 24 }, (_, i) => {
          const t = (i / 24) * Math.PI * 4;
          return {
            x: (window.innerWidth/24) * i,
            y: window.innerHeight/2 + Math.sin(t) * 150 + Math.cos(t * 2) * 100
          };
        }),
        rotate: [0, 1440],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 27. Shooting Star
      {
        path: [
          { x: 0, y: 0 },
          { x: window.innerWidth * 0.3, y: window.innerHeight * 0.3 },
          { x: window.innerWidth * 0.7, y: window.innerHeight * 0.7 },
          { x: window.innerWidth, y: window.innerHeight }
        ],
        rotate: [0, 360],
        scale: [5, 3, 4, 1],
        duration: 5
      },
      // 28. Vortex
      {
        path: Array.from({ length: 20 }, (_, i) => {
          const angle = (i / 20) * Math.PI * 6;
          const radius = Math.pow(i / 20, 2) * 400;
          return {
            x: window.innerWidth/2 + Math.cos(angle) * radius,
            y: window.innerHeight/2 + Math.sin(angle) * radius
          };
        }),
        rotate: [0, 1800],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 29. Spring Motion
      {
        path: Array.from({ length: 16 }, (_, i) => ({
          x: (window.innerWidth/16) * i,
          y: window.innerHeight/2 + Math.sin(i * 1.5) * (200 - i * 10)
        })),
        rotate: [0, 720],
        scale: [4, 2, 3, 1],
        duration: 5
      },
      // 30. Kaleidoscope
      {
        path: Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 200 + Math.sin(i * Math.PI/6) * 100;
          return {
            x: window.innerWidth/2 + Math.cos(angle) * radius,
            y: window.innerHeight/2 + Math.sin(angle) * radius
          };
        }),
        rotate: [-540, 0, 540],
        scale: [5, 2, 4, 1],
        duration: 5
      }
    ];

    // Keep track of the last 10 animations to avoid repetition
    const maxHistoryLength = 10;
    
    // Filter out recently used animations
    const availableAnimations = animations.filter((_, index) => !recentAnimations.includes(index));
    
    // If we've somehow used all animations, reset the history
    if (availableAnimations.length === 0) {
      setRecentAnimations([]);
      return animations[Math.floor(Math.random() * animations.length)];
    }
    
    // Select a random animation from the available ones
    const availableIndices = animations.map((_, index) => index)
      .filter(index => !recentAnimations.includes(index));
    const selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    
    // Update the history
    setRecentAnimations(prev => {
      const newHistory = [selectedIndex, ...prev];
      if (newHistory.length > maxHistoryLength) {
        return newHistory.slice(0, maxHistoryLength);
      }
      return newHistory;
    });
    
    // Return the selected animation
    return {
      ...animations[selectedIndex],
      // Add some random variation to make each instance unique
      path: animations[selectedIndex].path.map(point => ({
        x: point.x + (Math.random() - 0.5) * 50, // Add slight position variation
        y: point.y + (Math.random() - 0.5) * 50
      })),
      rotate: Array.isArray(animations[selectedIndex].rotate) 
        ? animations[selectedIndex].rotate.map(r => r + (Math.random() - 0.5) * 45) // Add rotation variation
        : animations[selectedIndex].rotate + (Math.random() - 0.5) * 45,
      scale: Array.isArray(animations[selectedIndex].scale)
        ? animations[selectedIndex].scale.map(s => s * (0.8 + Math.random() * 0.4)) // Add scale variation
        : animations[selectedIndex].scale * (0.8 + Math.random() * 0.4)
    };
  };

  // Add sticker options
  const stickerOptions = [
    { icon: Star, label: 'Star', color: '#FFD700' },
    { icon: Favorite, label: 'Love', color: '#FF69B4' },
    { icon: Cake, label: 'Treat', color: '#FF8C00' },
    { icon: School, label: 'Learning', color: '#4CAF50' },
    { icon: SportsScore, label: 'Sports', color: '#2196F3' },
    { icon: CleaningServices, label: 'Helping', color: '#9C27B0' },
    { icon: LocalLibrary, label: 'Reading', color: '#795548' },
    { icon: Mood, label: 'Good Mood', color: '#FFC107' },
    { icon: FamilyRestroom, label: 'Family', color: '#E91E63' },
    { icon: Pets, label: 'Pets', color: '#607D8B' }
  ];

  // Modify the RewardPreview component to include editing
  const RewardPreview = ({ points, reward, onEdit }) => {
    const starsToGo = reward.stars - points;
    const [editedReward, setEditedReward] = useState(reward);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
      onEdit(editedReward);
      setIsEditing(false);
      // Save reward settings to database
      saveData(points, starComments, stickerType, editedReward);
    };

    return (
      <Box
        sx={{
          position: 'fixed',
          left: { xs: 10, sm: 20 },
          top: { xs: 10, sm: 20 },
          width: { xs: 260, sm: 300, md: 320 },
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 4,
          p: { xs: 2, sm: 3 },
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: '2px solid #FFD700',
          zIndex: 100,
          '@media (orientation: landscape) and (max-height: 768px)': {
            width: 250,
            p: 2,
            fontSize: '0.875rem'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#FF69B4',
              fontFamily: 'inherit',
              textAlign: 'center'
            }}
          >
            Next Reward 🎁
          </Typography>
          <IconButton 
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            sx={{ 
              color: isEditing ? '#4CAF50' : '#FF69B4',
              '&:hover': {
                backgroundColor: isEditing ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 105, 180, 0.1)'
              }
            }}
          >
            {isEditing ? <Check /> : <Edit />}
          </IconButton>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          {isEditing ? (
            <TextField
              fullWidth
              value={editedReward.reward}
              onChange={(e) => setEditedReward(prev => ({ ...prev, reward: e.target.value }))}
              placeholder="Enter reward title"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  fontFamily: 'inherit',
                  backgroundColor: 'rgba(255,255,255,0.8)'
                }
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <EmojiEvents sx={{ color: '#FFD700', fontSize: 40 }} />
              <Typography
                variant="h5"
                sx={{
                  color: '#666',
                  fontFamily: 'inherit'
                }}
              >
                {reward.reward}
              </Typography>
            </Box>
          )}
        </Box>

        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={2}
            value={editedReward.description}
            onChange={(e) => setEditedReward(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter reward description"
            size="small"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontFamily: 'inherit',
                backgroundColor: 'rgba(255,255,255,0.8)'
              }
            }}
          />
        ) : (
          <Typography
            sx={{
              color: '#666',
              fontFamily: 'inherit',
              textAlign: 'center',
              mb: 2
            }}
          >
            {reward.description}
          </Typography>
        )}

        <Typography
          variant="h6"
          sx={{
            color: starsToGo > 0 ? '#FF69B4' : '#4CAF50',
            fontFamily: 'inherit',
            textAlign: 'center',
            animation: starsToGo === 0 ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' }
            }
          }}
        >
          {starsToGo > 0 
            ? `Only ${starsToGo} more ${starsToGo === 1 ? 'star' : 'stars'} to go!`
            : "You've earned your reward! 🎉"}
        </Typography>
      </Box>
    );
  };

  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{
        height: '100vh',
        width: '100vw',
        padding: 0,
        margin: 0,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #FFE5F1 0%, #FFF6E6 50%, #E6F8FF 100%)',
        fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
        '@media (orientation: landscape) and (max-height: 1024px)': {
          height: '100vh'
        }
      }}
    >
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.8); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .prize-counter {
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 15px 30px;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            animation: float 3s ease-in-out infinite;
          }
          .star-icon {
            animation: twinkle 1.5s ease-in-out infinite;
          }
          .add-button {
            animation: bounce 2s ease-in-out infinite;
          }
          .comments-section {
            position: fixed;
            right: 20px;
            top: 20px;
            width: 300px;
            max-height: 80vh;
            overflow-y: auto;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            z-index: 100;
            backdrop-filter: blur(10px);
          }
          .comment-item {
            background: white;
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            border-left: 4px solid #FF69B4;
          }
        `}
      </style>

      <RewardPreview 
        points={points} 
        reward={rewardPreview} 
        onEdit={(newReward) => setRewardPreview(newReward)}
      />

      {showNewStar && (
        <motion.div
          initial="initial"
          animate="animate"
          variants={newStarVariants}
          custom={Math.random()}
          style={{ 
            position: 'fixed', 
            zIndex: 1000,
            filter: 'url(#glow)',
            willChange: 'transform'
          }}
          onAnimationComplete={() => {
            setShowNewStar(false);
            setPoints(prev => Math.min(prev + 1, 15));
            setCurrentStarIndex(points);
          }}
        >
          <svg width="0" height="0">
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </svg>
          <Star 
            sx={{ 
              fontSize: { xs: 100, sm: 120, md: 140 },
              color: '#ffd700',
              filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.8))'
            }} 
          />
        </motion.div>
      )}

      {(lastAction === 'add' || isAmazingAnimation) && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={isAmazingAnimation ? amazingParticlesOptions : particlesOptions}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Box
          sx={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            padding: { xs: 1, sm: 2, md: 4 },
            position: 'relative',
            '@media (orientation: landscape) and (max-height: 768px)': {
              justifyContent: 'space-around',
              padding: 1
            }
          }}
        >
          {/* Decorative background elements */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, Math.random() * -30],
                  scale: [1, Math.random() * 0.3 + 0.7],
                  opacity: [0.3, 0.7]
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{
                  position: 'absolute',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: Math.random() * 20 + 10,
                  color: ['#FFD700', '#FFA500', '#FF69B4'][Math.floor(Math.random() * 3)]
                }}
              >
                ★
              </motion.div>
            ))}
          </Box>

          <motion.div 
            variants={titleVariants}
            style={{ textAlign: 'center' }}
          >
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                color: '#FF69B4',
                textShadow: '3px 3px 0px #FFA500, 6px 6px 0px rgba(0,0,0,0.1)',
                mb: { xs: 1, sm: 2 },
                fontFamily: 'inherit',
                '@media (orientation: landscape) and (max-height: 768px)': {
                  fontSize: '2rem',
                  mb: 0.5
                }
              }}
            >
              Millie's Star Chart
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: '#666',
                fontFamily: 'inherit',
                fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem', lg: '1.8rem' },
                fontWeight: 'normal',
                '@media (orientation: landscape) and (max-height: 768px)': {
                  fontSize: '1rem'
                }
              }}
            >
              Collect stars and earn amazing prizes! 🎁
            </Typography>
          </motion.div>

          <Box sx={{ textAlign: 'center', position: 'relative' }}>
            <motion.div
              key={points}
              initial="initial"
              animate="animate"
              variants={pointsDisplayVariants}
              className="prize-counter"
            >
              <EmojiEvents sx={{ fontSize: '2em', color: '#FFF' }} />
              <Typography 
                variant="h2" 
                component="div" 
                sx={{ 
                  fontFamily: 'inherit',
                  color: '#FFF',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                  '@media (orientation: landscape) and (max-height: 768px)': {
                    fontSize: '1.5rem'
                  }
                }}
              >
                {points} / 15 Stars
              </Typography>
            </motion.div>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 2, sm: 3, md: 4 }, 
              justifyContent: 'center', 
              mt: { xs: 2, sm: 3, md: 4 },
              '@media (orientation: landscape) and (max-height: 768px)': {
                gap: 2,
                mt: 1
              }
            }}>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="add-button"
              >
                <IconButton 
                  onClick={handleAddPoint}
                  sx={{ 
                    p: { xs: 1.5, sm: 2, md: 3 },
                    background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    minWidth: { xs: 56, sm: 64 },
                    minHeight: { xs: 56, sm: 64 },
                    '&:hover': {
                      background: 'linear-gradient(45deg, #8BC34A, #4CAF50)'
                    },
                    '@media (orientation: landscape) and (max-height: 768px)': {
                      p: 1,
                      minWidth: 48,
                      minHeight: 48
                    }
                  }}
                >
                  <AddCircle sx={{ 
                    fontSize: { xs: 32, sm: 40, md: 50, lg: 60 }, 
                    color: '#FFF',
                    '@media (orientation: landscape) and (max-height: 768px)': {
                      fontSize: 32
                    }
                  }} />
                </IconButton>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IconButton 
                  onClick={handleAmazingAchievement}
                  sx={{ 
                    p: { xs: 1.5, sm: 2, md: 3 },
                    background: 'linear-gradient(45deg, #FF69B4, #FFD700)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    minWidth: { xs: 56, sm: 64 },
                    minHeight: { xs: 56, sm: 64 },
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FFD700, #FF69B4)'
                    },
                    '@media (orientation: landscape) and (max-height: 768px)': {
                      p: 1,
                      minWidth: 48,
                      minHeight: 48
                    }
                  }}
                >
                  <AutoAwesome sx={{ 
                    fontSize: { xs: 32, sm: 40, md: 50, lg: 60 }, 
                    color: '#FFF',
                    '@media (orientation: landscape) and (max-height: 768px)': {
                      fontSize: 32
                    }
                  }} />
                </IconButton>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IconButton 
                  onClick={handleReset}
                  sx={{ 
                    p: { xs: 1.5, sm: 2, md: 3 },
                    background: 'linear-gradient(45deg, #FF9800, #FF5722)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    minWidth: { xs: 56, sm: 64 },
                    minHeight: { xs: 56, sm: 64 },
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF5722, #FF9800)'
                    },
                    '@media (orientation: landscape) and (max-height: 768px)': {
                      p: 1,
                      minWidth: 48,
                      minHeight: 48
                    }
                  }}
                >
                  <Refresh sx={{ 
                    fontSize: { xs: 32, sm: 40, md: 50, lg: 60 }, 
                    color: '#FFF',
                    '@media (orientation: landscape) and (max-height: 768px)': {
                      fontSize: 32
                    }
                  }} />
                </IconButton>
              </motion.div>
            </Box>
          </Box>

          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: { xs: 2, sm: 3, md: 4, lg: 5 },
              width: '100%',
              maxWidth: { xs: '95vw', sm: '90vw', md: '80vw', lg: '70vw' },
              margin: '0 auto',
              position: 'relative',
              padding: { xs: 2, sm: 2.5, md: 3 },
              background: 'rgba(255,255,255,0.5)',
              borderRadius: { xs: '20px', sm: '25px', md: '30px' },
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              '@media (orientation: landscape) and (max-height: 768px)': {
                gap: 1.5,
                padding: 1.5,
                maxWidth: '95vw'
              }
            }}
          >
            <AnimatePresence>
              {[...Array(15)].map((_, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    position: 'relative',
                    cursor: index <= points ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box onClick={() => handleStarClick(index)}>
                    <motion.div
                      custom={index}
                      variants={starVariants}
                      initial="hidden"
                      animate={index === points - 1 && lastAction === 'add' ? "pulse" : "visible"}
                      exit="exit"
                      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      data-star-index={index}
                      className="star-icon"
                    >
                      {index < points && (
                        <Box sx={{ position: 'relative' }}>
                          {React.createElement(
                            stickerOptions[stickerType[index] || 0].icon,
                            { 
                              sx: { 
                                fontSize: { xs: 60, sm: 80, md: 100, lg: 120 },
                                color: stickerOptions[stickerType[index] || 0].color,
                                filter: `drop-shadow(0 0 10px ${stickerOptions[stickerType[index] || 0].color}80)`,
                                transition: 'all 0.3s ease',
                                '@media (min-width: 768px) and (max-width: 1024px)': {
                                  fontSize: 100
                                },
                                '@media (orientation: landscape) and (max-height: 768px)': {
                                  fontSize: 60
                                }
                              }
                            }
                          )}
                        </Box>
                      )}
                      {index >= points && (
                        <Star 
                          sx={{ 
                            fontSize: { xs: 60, sm: 80, md: 100, lg: 120 },
                            color: 'rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '@media (min-width: 768px) and (max-width: 1024px)': {
                              fontSize: 100
                            },
                            '@media (orientation: landscape) and (max-height: 768px)': {
                              fontSize: 60
                            }
                          }} 
                        />
                      )}
                    </motion.div>
                  </Box>
                  {index < points && (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControl size="small" sx={{ width: '100%' }}>
                        <Select
                          value={stickerType[index] || 0}
                          onChange={(e) => {
                            setStickerType(prev => ({
                              ...prev,
                              [index]: e.target.value
                            }));
                          }}
                          sx={{
                            borderRadius: '10px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.9)'
                            }
                          }}
                        >
                          {stickerOptions.map((option, i) => (
                            <MenuItem key={i} value={i}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {React.createElement(option.icon, { sx: { color: option.color } })}
                                <Typography sx={{ fontFamily: 'inherit' }}>{option.label}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        value={starComments[index] || ''}
                        onChange={(e) => {
                          setStarComments(prev => ({
                            ...prev,
                            [index]: e.target.value
                          }));
                        }}
                        placeholder="Add comment..."
                        multiline
                        maxRows={2}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.9)'
                            }
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: '8px',
                            fontSize: '0.875rem',
                            fontFamily: 'inherit'
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </AnimatePresence>
          </Box>

          <Dialog 
            open={showCelebration} 
            onClose={() => setShowCelebration(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #FFE5F1 0%, #FFF6E6 100%)',
                padding: 2
              }
            }}
          >
            <DialogTitle>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                  transition: { 
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 1
                  }
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    textAlign: 'center', 
                    color: '#FF69B4',
                    fontFamily: 'inherit',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  🎉 Woohoo! Amazing Job Millie! 🎉
                </Typography>
              </motion.div>
            </DialogTitle>
            <DialogContent>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.3 }
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    textAlign: 'center', 
                    mt: 2,
                    fontFamily: 'inherit',
                    color: '#666'
                  }}
                >
                  You've collected all 15 stars!
                  Time for an awesome prize! 🎁
                </Typography>
              </motion.div>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 400 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleClaimPrize}
                  variant="contained"
                  size="large"
                  sx={{ 
                    background: 'linear-gradient(45deg, #FF69B4, #FFA500)',
                    color: 'white',
                    px: 4,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: '25px',
                    fontFamily: 'inherit',
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FFA500, #FF69B4)'
                    }
                  }}
                >
                  Claim Your Prize! 🎁
                </Button>
              </motion.div>
            </DialogActions>
          </Dialog>

          {removingStar && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={removeStarVariants}
              style={{ 
                position: 'fixed', 
                zIndex: 1000,
                filter: 'url(#glow)',
                willChange: 'transform'
              }}
            >
              <Star 
                sx={{ 
                  fontSize: { xs: 100, sm: 120, md: 140 },
                  color: '#ffd700',
                  filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.8))'
                }} 
              />
            </motion.div>
          )}
        </Box>
      </motion.div>
    </Container>
  );
}

export default App; 