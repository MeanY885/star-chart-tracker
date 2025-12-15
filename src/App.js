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
  Card,
  CardContent
} from '@mui/material';
import { 
  Star, 
  StarBorder,
  AddCircle, 
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
  Celebration,
  MusicNote,
  AcUnit,
  Forest
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [stickerType, setStickerType] = useState({});
  const [rewardPreview, setRewardPreview] = useState({
    stars: 15,
    reward: "Special Day Out! 🎉",
    description: "Choose any fun activity for a special family day!"
  });
  const [animationKey, setAnimationKey] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showElf, setShowElf] = useState(false);
  const addStarTimeoutRef = useRef(null);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'default' ? 'christmas' : 'default';
    setCurrentTheme(newTheme);
    saveData(points, starComments, stickerType, rewardPreview, newTheme);
  };

  const triggerElf = () => {
    playSound('elf');
    setShowElf(true);
    setTimeout(() => setShowElf(false), 4000);
  };

  const themes = {
    default: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      headerGradient: 'linear-gradient(45deg, #FFD700, #FFA500)',
      cardBg: 'rgba(255,255,255,0.95)',
      buttonAdd: ['#4CAF50', '#81C784'],
      buttonAmazing: ['#FF69B4', '#FFB74D'],
      buttonReset: ['#FF7043', '#FF8A65'],
      font: '"Fredoka One", "Comic Sans MS", cursive'
    },
    christmas: {
      background: 'linear-gradient(135deg, #1a472a 0%, #d42426 100%)',
      headerGradient: 'linear-gradient(45deg, #ffffff, #d42426, #1a472a)',
      cardBg: 'rgba(255,255,255,0.92)',
      buttonAdd: ['#2e8b57', '#3cb371'],
      buttonAmazing: ['#d42426', '#ff4d4d'],
      buttonReset: ['#8b0000', '#b22222'],
      buttonElf: ['#4CAF50', '#8BC34A'],
      font: '"Mountains of Christmas", "Fredoka One", cursive'
    }
  };

  const activeTheme = themes[currentTheme];

  const particlesInit = useCallback(async engine => {
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
      } else if (type === 'elf') {
        // Mischievous elf sound (high pitched, fast)
        const melody = [880, 0, 880, 0, 698.46, 783.99, 880];
        melody.forEach((freq, index) => {
          if (freq === 0) return;
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          
          oscillator.start(audioContext.currentTime + index * 0.1);
          oscillator.stop(audioContext.currentTime + 0.1 + index * 0.1);
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
        setStarComments(data.starComments || {});
        setStickerType(data.stickerTypes || {});
        if (data.currentTheme) {
          setCurrentTheme(data.currentTheme);
        }
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
    
    // Only sync when the page becomes visible (user switches back to tab)
    // Remove automatic 10-second sync to prevent unwanted resets
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData]);

  // Save data to server with better error handling and immediate sync
  const saveData = useCallback(async (newPoints, newComments, newStickerTypes = null, newRewardPreview = null, theme = null) => {
    try {
      const payload = {
        points: newPoints,
        starComments: newComments,
        stickerTypes: newStickerTypes || stickerType,
        currentTheme: theme || currentTheme
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
        await response.json();
        // Trigger immediate sync on other devices
        setTimeout(() => loadData(false), 500);
      } else {
        console.error('Failed to save data, status:', response.status);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [stickerType, currentTheme, loadData]);

  // Debounced save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLoading) {
        saveData(points, starComments, stickerType, null, currentTheme);
      }
    }, 500);

    if (points >= 15) {
      setShowCelebration(true);
    }

    return () => clearTimeout(timeoutId);
  }, [points, starComments, stickerType, currentTheme, saveData, isLoading]);

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
    { icon: Pets, label: 'Pets', color: '#607D8B' },
    { icon: currentTheme === 'christmas' ? Forest : EmojiEvents, label: 'Elf', color: '#2e8b57' }
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
    particles: currentTheme === 'christmas' ? {
      number: { value: 100 },
      color: { value: "#ffffff" },
      shape: { type: "circle" }, // Snowflakes are basically white dots or specialized shapes
      size: { value: { min: 2, max: 5 } },
      move: {
        enable: true,
        speed: { min: 1, max: 3 },
        direction: "bottom", // Snow falls down
        random: true,
        straight: false,
        outModes: "out"
      },
      opacity: {
        value: { min: 0.4, max: 0.8 },
      }
    } : {
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
          background: activeTheme.background
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {currentTheme === 'christmas' ? (
             <AcUnit sx={{ fontSize: 80, color: '#fff' }} />
          ) : (
             <Star sx={{ fontSize: 80, color: '#FFD700' }} />
          )}
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
        background: activeTheme.background,
        fontFamily: activeTheme.font,
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.5s ease-in-out'
      }}
    >
      {/* Particles Background - Always show for Christmas, otherwise conditional */}
      {(currentTheme === 'christmas' || lastAction === 'add' || isAmazingAnimation) && (
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

      {/* Naughty Elf Animation */}
      <AnimatePresence>
        {showElf && (
          <motion.div
            initial={{ x: '100vw', y: '50vh', rotate: 0 }}
            animate={{ 
              x: ['100vw', '50vw', '0vw', '-50vw'],
              y: ['50vh', '40vh', '60vh', '50vh'],
              rotate: [0, -10, 10, 0]
            }}
            transition={{ duration: 4, ease: "linear" }}
            style={{ 
              position: 'fixed', 
              zIndex: 2000,
              fontSize: '150px'
            }}
          >
            🧝
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - iPad Optimized Layout */}
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
          '@media (max-width: 1024px) and (orientation: portrait)': {
            flexDirection: 'column'
          }
        }}
      >
        {/* Left Side - Header and Controls */}
        <Box
          sx={{
            width: { xs: '100%', lg: '30%' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 2, md: 3 },
            '@media (max-width: 1024px) and (orientation: portrait)': {
              width: '100%',
              height: 'auto',
              py: 1
            }
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem', lg: '3.2rem' },
                fontWeight: 900,
                background: activeTheme.headerGradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: { xs: 0.5, md: 1 },
                textAlign: { xs: 'center', lg: 'left' }
              }}
            >
              {currentTheme === 'christmas' ? "🎄 Millie's Christmas Chart 🎅" : "⭐ Millie's Star Chart ⭐"}
            </Typography>
          </motion.div>

          {/* Progress Card */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Card
              sx={{
                background: activeTheme.cardBg,
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                mb: { xs: 2, md: 3 },
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  {currentTheme === 'christmas' ? (
                     <Forest sx={{ fontSize: { xs: 32, md: 40 }, color: '#2e8b57', mr: 1 }} />
                  ) : (
                     <EmojiEvents sx={{ fontSize: { xs: 32, md: 40 }, color: '#FFD700', mr: 1 }} />
                  )}
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 900,
                      color: '#333',
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    {points} / 15
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#666', fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                  {15 - points === 0 ? "Ready for your reward! 🎁" : 
                   15 - points === 1 ? "Just 1 more star to go!" :
                   `${15 - points} more stars to go!`}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'row', lg: 'column' },
            gap: { xs: 1, md: 2 }, 
            flexWrap: 'wrap', 
            justifyContent: 'center'
          }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                onClick={handleAddPoint}
                disabled={points >= 15}
                sx={{
                  background: `linear-gradient(45deg, ${activeTheme.buttonAdd[0]}, ${activeTheme.buttonAdd[1]})`,
                  color: 'white',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  fontWeight: 700,
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 2, md: 3 },
                  borderRadius: 3,
                  textTransform: 'none',
                  minWidth: { xs: 'auto', lg: '100%' },
                  '&:hover': {
                    filter: 'brightness(1.1)'
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.2)'
                  }
                }}
                startIcon={currentTheme === 'christmas' ? <AcUnit /> : <AddCircle />}
              >
                Add Star
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                onClick={handleAmazingAchievement}
                disabled={points >= 15}
                sx={{
                  background: `linear-gradient(45deg, ${activeTheme.buttonAmazing[0]}, ${activeTheme.buttonAmazing[1]})`,
                  color: 'white',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  fontWeight: 700,
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 2, md: 3 },
                  borderRadius: 3,
                  textTransform: 'none',
                  minWidth: { xs: 'auto', lg: '100%' },
                  '&:hover': {
                    filter: 'brightness(1.1)'
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

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                onClick={handleReset}
                sx={{
                  background: `linear-gradient(45deg, ${activeTheme.buttonReset[0]}, ${activeTheme.buttonReset[1]})`,
                  color: 'white',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  fontWeight: 700,
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 2, md: 3 },
                  borderRadius: 3,
                  textTransform: 'none',
                  minWidth: { xs: 'auto', lg: '100%' },
                  '&:hover': {
                     filter: 'brightness(1.1)'
                  }
                }}
                startIcon={<Refresh />}
              >
                Reset
              </Button>
            </motion.div>

            {/* Naughty Elf Button - Only visible in Christmas theme */}
            {currentTheme === 'christmas' && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="contained"
                  onClick={triggerElf}
                  sx={{
                    background: `linear-gradient(45deg, ${activeTheme.buttonElf[0]}, ${activeTheme.buttonElf[1]})`,
                    color: 'white',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 700,
                    py: { xs: 1, md: 1.5 },
                    px: { xs: 2, md: 3 },
                    borderRadius: 3,
                    textTransform: 'none',
                    minWidth: { xs: 'auto', lg: '100%' },
                    '&:hover': {
                       filter: 'brightness(1.1)'
                    }
                  }}
                  startIcon={<span style={{ fontSize: '1.5em' }}>🧝</span>}
                >
                  Elf Watch!
                </Button>
              </motion.div>
            )}
          </Box>

          {/* Sound and Theme Toggles */}
          <Box sx={{ 
            display: 'flex',
            justifyContent: { xs: 'center', lg: 'flex-start' },
            mt: { xs: 1, md: 2 },
            gap: 2
          }}>
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

            <IconButton
              onClick={toggleTheme}
              sx={{
                color: currentTheme === 'christmas' ? '#d42426' : '#FFD700',
                backgroundColor: currentTheme === 'christmas' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: currentTheme === 'christmas' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {currentTheme === 'christmas' ? <Forest /> : <AcUnit />}
            </IconButton>
          </Box>
        </Box>

        {/* Right Side - Stars Grid */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 1, md: 2 },
            '@media (max-width: 1024px) and (orientation: portrait)': {
              flex: 1,
              height: 'auto'
            }
          }}
        >
          <Card
            sx={{
              background: activeTheme.cardBg,
              borderRadius: 3,
              p: { xs: 1.5, md: 2 },
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              width: '100%',
              height: 'fit-content',
              maxWidth: '600px'
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: { xs: 1, sm: 1.5, md: 2 },
                justifyItems: 'center',
                alignItems: 'center'
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
                    delay: index * 0.05,
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
                      p: 0.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      minHeight: { xs: 60, sm: 80, md: 100 },
                      minWidth: { xs: 60, sm: 80, md: 100 },
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
                            fontSize: { xs: 40, sm: 56, md: 72 },
                            color: stickerOptions[stickerType[index] || 0].color,
                            filter: `drop-shadow(0 0 8px ${stickerOptions[stickerType[index] || 0].color}80)`,
                            transition: 'all 0.3s ease'
                          }
                        }
                      )
                    ) : (
                      currentTheme === 'christmas' ? (
                        <AcUnit 
                          sx={{ 
                            fontSize: { xs: 40, sm: 56, md: 72 },
                            color: index === points ? '#d42426' : 'rgba(255,255,255,0.3)',
                            transition: 'all 0.3s ease',
                            opacity: index === points ? 1 : 0.5
                          }} 
                        />
                      ) : (
                        <StarBorder 
                          sx={{ 
                            fontSize: { xs: 40, sm: 56, md: 72 },
                            color: index === points ? '#FFD700' : 'rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                          }} 
                        />
                      )
                    )}
                    
                    {index < points && (
                      <TextField
                        size="small"
                        value={starComments[index] || ''}
                        onChange={(e) => {
                          setStarComments(prev => ({
                            ...prev,
                            [index]: e.target.value
                          }));
                        }}
                        placeholder=""
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          mt: 0.5,
                          width: '100%',
                          maxWidth: { xs: 50, sm: 70, md: 90 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' },
                            '& input': {
                              padding: { xs: '4px 6px', md: '6px 8px' },
                              textAlign: 'center'
                            }
                          }
                        }}
                      />
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
            background: currentTheme === 'christmas' 
              ? 'linear-gradient(135deg, #e6ffe6 0%, #ffe6e6 100%)'
              : 'linear-gradient(135deg, #FFE5F1 0%, #FFF6E6 100%)',
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
                background: currentTheme === 'christmas'
                  ? 'linear-gradient(45deg, #d42426, #2e8b57)'
                  : 'linear-gradient(45deg, #FF69B4, #FFD700)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {currentTheme === 'christmas' ? "🎅 MERRY CHRISTMAS MILLIE! 🎄" : "🎉 AMAZING MILLIE! 🎉"}
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
            {currentTheme === 'christmas' ? "You've collected all 15 Christmas stars!" : "You've collected all 15 stars!"}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              mb: 3
            }}
          >
            {currentTheme === 'christmas' ? "Santa has a special reward for you! 🎁" : "Time for your special reward! 🎁"}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2
            }}
          >
            {currentTheme === 'christmas' ? (
               <Forest sx={{ fontSize: 80, color: '#2e8b57' }} />
            ) : (
               <Celebration sx={{ fontSize: 80, color: '#FFD700' }} />
            )}
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
                background: currentTheme === 'christmas'
                  ? 'linear-gradient(45deg, #d42426, #2e8b57)'
                  : 'linear-gradient(45deg, #FF69B4, #FFD700)',
                color: 'white',
                px: 4,
                py: 2,
                fontSize: '1.3rem',
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  filter: 'brightness(1.1)'
                }
              }}
            >
              {currentTheme === 'christmas' ? "Claim Your Christmas Present! 🎁" : "Claim Your Prize! 🎁"}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;