import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Chip,
  Card,
  CardContent,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import { 
  Star, 
  StarBorder,
  AddCircle, 
  Edit, 
  EmojiEvents, 
  Refresh, 
  AutoAwesome, 
  Favorite, 
  Cake, 
  School, 
  SportsScore, 
  CleaningServices, 
  LocalLibrary, 
  Mood, 
  FamilyRestroom, 
  Pets, 
  Check,
  Celebration,
  MusicNote
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback as useParticles } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

function App() {
  const [points, setPoints] = useState(0);
  const [starComments, setStarComments] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [showNewStar, setShowNewStar] = useState(false);
  const [newStarPosition, setNewStarPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [removingStar, setRemovingStar] = useState(false);
  const [removeStarPosition, setRemoveStarPosition] = useState({ x: 0, y: 0 });
  const [isAmazingAnimation, setIsAmazingAnimation] = useState(false);
  const [recentAnimations, setRecentAnimations] = useState([]);
  const [stickerType, setStickerType] = useState({});
  const [isEditingReward, setIsEditingReward] = useState(false);
  const [rewardPreview, setRewardPreview] = useState({
    stars: 15,
    reward: "Special Day Out! 🎉",
    description: "Choose any fun activity for a special family day!"
  });
  const [animationKey, setAnimationKey] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStarIndex, setSelectedStarIndex] = useState(null);
  const addStarTimeoutRef = useRef(null);

  const particlesInit = useParticles(async engine => {
    await loadSlim(engine);
  }, []);

  // Enhanced sound effects with more variety
  const playSound = useCallback((type, variation = 0) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (type === 'add') {
        // Multiple cheerful variations for adding stars
        const variations = [
          [523.25, 659.25, 783.99], // C5, E5, G5
          [587.33, 698.46, 830.61], // D5, F5, G#5
          [659.25, 783.99, 987.77], // E5, G5, B5
          [698.46, 830.61, 1046.50] // F5, G#5, C6
        ];
        const frequencies = variations[variation % variations.length];
        
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
          
          oscillator.start(audioContext.currentTime + index * 0.1);
          oscillator.stop(audioContext.currentTime + 0.6 + index * 0.1);
        });
      } else if (type === 'remove') {
        // Gentle descending tone for removing stars
        const frequencies = [698.46, 587.33, 523.25]; // F5, D5, C5
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime + index * 0.1);
          oscillator.stop(audioContext.currentTime + 0.5 + index * 0.1);
        });
      } else if (type === 'celebration') {
        // Special fanfare for celebrations
        const melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
        melody.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime + index * 0.15);
          oscillator.stop(audioContext.currentTime + 0.3 + index * 0.15);
        });
      }
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }, [soundEnabled]);

  // Load data from server with better error handling and auto-sync
  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      // Add cache-busting timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/data/sync?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPoints(data.points || 0);
        setStarComments(data.starComments?.comments || {});
        setStickerType(data.starComments?.stickerTypes || {});
        if (data.rewardPreview) {
          setRewardPreview(data.rewardPreview);
        }
        if (data.points >= 15) {
          setShowCelebration(true);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Set up periodic sync every 10 seconds for cross-device updates
    const syncInterval = setInterval(() => {
      loadData(false); // Don't show loading spinner for background sync
    }, 10000);
    
    // Also sync when the page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData]);

  // Save data to server with better error handling and immediate sync
  const saveData = useCallback(async (newPoints, newComments, newStickerTypes = null, newRewardPreview = null) => {
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
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Data saved successfully at:', result.timestamp);
        
        // Trigger immediate sync on other devices by refreshing data
        setTimeout(() => loadData(false), 500);
      } else {
        console.error('Failed to save data, status:', response.status);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [stickerType, loadData]);

  // Debounced save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLoading) {
        saveData(points, starComments, stickerType);
      }
    }, 500);

    if (points >= 15) {
      setShowCelebration(true);
    }

    return () => clearTimeout(timeoutId);
  }, [points, starComments, stickerType, saveData, isLoading]);

  // Enhanced animation system with truly random selection
  const generateRandomAnimation = useCallback(() => {
    const animations = [
      // Spiral
      {
        path: Array.from({ length: 20 }, (_, i) => {
          const angle = (i / 20) * Math.PI * 4;
          const radius = (1 - i / 20) * Math.min(window.innerWidth, window.innerHeight) / 3;
          return {
            x: window.innerWidth / 2 + radius * Math.cos(angle),
            y: window.innerHeight / 2 + radius * Math.sin(angle)
          };
        }),
        rotate: [0, 1440],
        scale: [3, 2, 1.5, 1],
        duration: 3
      },
      // Heart
      {
        path: Array.from({ length: 16 }, (_, i) => {
          const t = (i / 16) * 2 * Math.PI;
          const x = 16 * Math.pow(Math.sin(t), 3);
          const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
          return {
            x: window.innerWidth/2 + x * 15,
            y: window.innerHeight/2 - y * 15
          };
        }),
        rotate: [0, 360],
        scale: [3, 2, 1],
        duration: 3
      },
      // Bounce
      {
        path: Array.from({ length: 8 }, (_, i) => ({
          x: (window.innerWidth/8) * i,
          y: window.innerHeight - Math.abs(Math.sin(i/2 * Math.PI)) * window.innerHeight * 0.6
        })),
        rotate: [0, 720],
        scale: [3, 1.5, 2, 1],
        duration: 3
      },
      // Figure 8
      {
        path: Array.from({ length: 20 }, (_, i) => {
          const t = (i / 20) * 2 * Math.PI;
          return {
            x: window.innerWidth/2 + Math.sin(t) * 250,
            y: window.innerHeight/2 + Math.sin(t * 2) * 125
          };
        }),
        rotate: [0, 540],
        scale: [3, 1.5, 1],
        duration: 3
      },
      // Rainbow Arc
      {
        path: Array.from({ length: 12 }, (_, i) => {
          const progress = i / 11;
          return {
            x: window.innerWidth * progress,
            y: window.innerHeight/2 - Math.sin(progress * Math.PI) * 250
          };
        }),
        rotate: [0, 360],
        scale: [3, 2, 1],
        duration: 3
      }
    ];

    // Simple random selection with variation
    const randomIndex = Math.floor(Math.random() * animations.length);
    const animation = animations[randomIndex];
    
    // Add random variation to each instance
    return {
      ...animation,
      path: animation.path.map(point => ({
        x: point.x + (Math.random() - 0.5) * 100,
        y: point.y + (Math.random() - 0.5) * 100
      })),
      rotate: animation.rotate.map(r => r + (Math.random() - 0.5) * 180),
      scale: animation.scale.map(s => s * (0.8 + Math.random() * 0.4))
    };
  }, []);

  // Fixed add point function to prevent multiple additions
  const handleAddPoint = useCallback(() => {
    // Clear any existing timeout
    if (addStarTimeoutRef.current) {
      clearTimeout(addStarTimeoutRef.current);
    }

    // Prevent multiple rapid additions
    addStarTimeoutRef.current = setTimeout(() => {
      setLastAction('add');
      const newPoints = Math.min(points + 1, 15);
      
      if (newPoints > points) {
        // Play sound with variation
        playSound('add', Math.floor(Math.random() * 4));
        
        // Generate random start position
        const edges = [
          { x: Math.random() * window.innerWidth, y: -50 },
          { x: window.innerWidth + 50, y: Math.random() * window.innerHeight },
          { x: Math.random() * window.innerWidth, y: window.innerHeight + 50 },
          { x: -50, y: Math.random() * window.innerHeight }
        ];
        const startPos = edges[Math.floor(Math.random() * edges.length)];
        setNewStarPosition(startPos);

        // Find target position
        const targetIndex = points;
        const starElement = document.querySelector(`[data-star-index="${targetIndex}"]`);
        if (starElement) {
          const rect = starElement.getBoundingClientRect();
          setTargetPosition({ 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2 
          });
        }

        setAnimationKey(prev => prev + 1);
        setShowNewStar(true);
        
        // Update points after animation completes
        setTimeout(() => {
          setPoints(newPoints);
          setShowNewStar(false);
        }, 3000);
      }
    }, 100); // Small delay to prevent rapid clicking
  }, [points, playSound]);

  const handleRemovePoint = useCallback((index) => {
    if (index >= points) return;
    
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
        setPoints(prev => Math.max(prev - 1, 0));
        const newComments = { ...starComments };
        const newStickerTypes = { ...stickerType };
        
        // Remove comment and sticker for this index
        delete newComments[index];
        delete newStickerTypes[index];
        
        // Shift all comments and stickers down by one
        for (let i = index + 1; i < points; i++) {
          if (newComments[i] !== undefined) {
            newComments[i - 1] = newComments[i];
            delete newComments[i];
          }
          if (newStickerTypes[i] !== undefined) {
            newStickerTypes[i - 1] = newStickerTypes[i];
            delete newStickerTypes[i];
          }
        }
        
        setStarComments(newComments);
        setStickerType(newStickerTypes);
        setRemovingStar(false);
      }, 1500);
    }
  }, [points, starComments, stickerType, playSound]);

  const handleReset = useCallback(() => {
    setPoints(0);
    setStarComments({});
    setStickerType({});
    saveData(0, {}, {});
  }, [saveData]);

  const handleClaimPrize = useCallback(() => {
    playSound('celebration');
    setShowCelebration(false);
    handleReset();
  }, [playSound, handleReset]);

  const handleAmazingAchievement = useCallback(() => {
    const newPoints = Math.min(points + 5, 15);
    if (newPoints > points) {
      setIsAmazingAnimation(true);
      setLastAction('amazing');
      playSound('celebration');
      
      const starsToAdd = newPoints - points;
      for (let i = 0; i < starsToAdd; i++) {
        setTimeout(() => {
          if (i > 0) playSound('add', i);
          setAnimationKey(prev => prev + i + 1);
          setShowNewStar(true);
        }, i * 800);
      }

      setTimeout(() => {
        setPoints(newPoints);
        setIsAmazingAnimation(false);
        setShowNewStar(false);
      }, starsToAdd * 800 + 3000);
    }
  }, [points, playSound]);

  // Sticker options with better variety
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

  // Animation variants for the new star
  const newStarVariants = {
    initial: { 
      position: 'fixed',
      scale: 4,
      x: newStarPosition.x,
      y: newStarPosition.y,
      rotate: 0,
      zIndex: 1000,
      opacity: 1
    },
    animate: () => {
      const animation = generateRandomAnimation();
      return {
        x: [...animation.path.map(p => p.x), targetPosition.x],
        y: [...animation.path.map(p => p.y), targetPosition.y],
        rotate: animation.rotate,
        scale: [...animation.scale, 1],
        transition: {
          duration: animation.duration,
          ease: "easeInOut"
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
      scale: [1, 1.5, 0],
      rotate: [0, 360, 720],
      opacity: [1, 0.5, 0],
      y: removeStarPosition.y - 100,
      transition: {
        duration: 1.5,
        ease: "easeOut"
      }
    }
  };

  // Particles configuration
  const particlesOptions = {
    particles: {
      number: { value: lastAction === 'amazing' ? 100 : 30 },
      color: { value: ["#FFD700", "#FF69B4", "#4CAF50", "#2196F3", "#FF8C00"] },
      shape: { type: "star" },
      size: { value: { min: 2, max: 6 } },
      move: {
        enable: true,
        speed: { min: 1, max: 4 },
        direction: "none",
        random: true,
        outModes: "out"
      },
      opacity: { 
        value: { min: 0.3, max: 0.8 },
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.1
        }
      },
      life: { duration: { value: 3 } }
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Star sx={{ fontSize: 80, color: '#FFD700' }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '"Fredoka One", "Comic Sans MS", cursive',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Particles Background */}
      {(lastAction === 'add' || isAmazingAnimation) && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesOptions}
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

      {/* Flying Star Animation */}
      <AnimatePresence>
        {showNewStar && (
          <motion.div
            key={animationKey}
            initial="initial"
            animate="animate"
            variants={newStarVariants}
            style={{ 
              position: 'fixed', 
              zIndex: 1000,
              filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.8))'
            }}
          >
            <Star 
              sx={{ 
                fontSize: 80,
                color: '#FFD700'
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove Star Animation */}
      <AnimatePresence>
        {removingStar && (
          <motion.div
            initial="initial"
            animate="animate"
            variants={removeStarVariants}
            style={{ 
              position: 'fixed', 
              zIndex: 1000
            }}
          >
            <Star 
              sx={{ 
                fontSize: 80,
                color: '#FFD700'
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Header */}
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 2, md: 4 },
            position: 'relative'
          }}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                fontWeight: 900,
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}
            >
              ⭐ Millie's Star Chart ⭐
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.3rem' }
              }}
            >
              Collect stars and earn amazing rewards! 🎁
            </Typography>
          </motion.div>

          {/* Sound Toggle */}
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <IconButton
              onClick={() => setSoundEnabled(!soundEnabled)}
              sx={{
                color: soundEnabled ? '#FFD700' : 'rgba(255,255,255,0.5)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <MusicNote />
            </IconButton>
          </Box>
        </Box>

        {/* Progress and Controls */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            mb: 4
          }}
        >
          {/* Progress Card */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Card
              sx={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 4,
                p: 3,
                mb: 3,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <EmojiEvents sx={{ fontSize: 40, color: '#FFD700', mr: 2 }} />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 900,
                      color: '#333',
                      fontSize: { xs: '2rem', md: '3rem' }
                    }}
                  >
                    {points} / 15
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#666', fontWeight: 600 }}>
                  {15 - points === 0 ? "Ready for your reward! 🎉" : 
                   15 - points === 1 ? "Just 1 more star to go!" :
                   `${15 - points} more stars to go!`}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleAddPoint}
                disabled={points >= 15}
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50, #81C784)',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  py: 1.5,
                  px: 3,
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #66BB6A, #4CAF50)'
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.2)'
                  }
                }}
                startIcon={<AddCircle />}
              >
                Add Star
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleAmazingAchievement}
                disabled={points >= 15}
                sx={{
                  background: 'linear-gradient(45deg, #FF69B4, #FFB74D)',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  py: 1.5,
                  px: 3,
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FFB74D, #FF69B4)'
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.2)'
                  }
                }}
                startIcon={<AutoAwesome />}
              >
                Amazing! +5
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleReset}
                sx={{
                  background: 'linear-gradient(45deg, #FF7043, #FF8A65)',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  py: 1.5,
                  px: 3,
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF8A65, #FF7043)'
                  }
                }}
                startIcon={<Refresh />}
              >
                Reset
              </Button>
            </motion.div>
          </Box>
        </Box>

        {/* Stars Grid */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 2, md: 4 },
            pb: 4
          }}
        >
          <Card
            sx={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 4,
              p: { xs: 2, md: 4 },
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              maxWidth: '1000px',
              width: '100%'
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: { xs: 2, md: 3 },
                justifyItems: 'center'
              }}
            >
              {[...Array(15)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0 
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Box
                    data-star-index={index}
                    onClick={() => {
                      if (index < points) {
                        handleRemovePoint(index);
                      } else if (index === points) {
                        handleAddPoint();
                      }
                    }}
                    sx={{
                      cursor: index <= points ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: index <= points ? 'rgba(255,215,0,0.1)' : 'transparent'
                      }
                    }}
                  >
                    {index < points ? (
                      React.createElement(
                        stickerOptions[stickerType[index] || 0].icon,
                        { 
                          sx: { 
                            fontSize: { xs: 48, sm: 64, md: 80 },
                            color: stickerOptions[stickerType[index] || 0].color,
                            filter: `drop-shadow(0 0 8px ${stickerOptions[stickerType[index] || 0].color}80)`,
                            transition: 'all 0.3s ease'
                          }
                        }
                      )
                    ) : (
                      <StarBorder 
                        sx={{ 
                          fontSize: { xs: 48, sm: 64, md: 80 },
                          color: index === points ? '#FFD700' : 'rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease'
                        }} 
                      />
                    )}
                    
                    {index < points && (
                      <Box sx={{ mt: 1, width: '100%', maxWidth: 120 }}>
                        <TextField
                          size="small"
                          value={starComments[index] || ''}
                          onChange={(e) => {
                            setStarComments(prev => ({
                              ...prev,
                              [index]: e.target.value
                            }));
                          }}
                          placeholder="Comment..."
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.8)',
                              fontSize: '0.75rem'
                            }
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Celebration Dialog */}
      <Dialog 
        open={showCelebration} 
        onClose={() => setShowCelebration(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #FFE5F1 0%, #FFF6E6 100%)',
            p: 2,
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 900,
                background: 'linear-gradient(45deg, #FF69B4, #FFD700)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              🎉 AMAZING MILLIE! 🎉
            </Typography>
          </motion.div>
        </DialogTitle>
        
        <DialogContent>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#333',
              fontWeight: 600,
              mb: 2
            }}
          >
            You've collected all 15 stars!
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              mb: 3
            }}
          >
            Time for your special reward! 🎁
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <Celebration sx={{ fontSize: 80, color: '#FFD700' }} />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleClaimPrize}
              variant="contained"
              size="large"
              sx={{ 
                background: 'linear-gradient(45deg, #FF69B4, #FFD700)',
                color: 'white',
                px: 4,
                py: 2,
                fontSize: '1.3rem',
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FFD700, #FF69B4)'
                }
              }}
            >
              Claim Your Prize! 🎁
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;