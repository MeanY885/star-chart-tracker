import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  LinearProgress,
  Snackbar,
  Alert
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [showNewStar, setShowNewStar] = useState(false);
  const [newStarPosition, setNewStarPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [isAmazingAnimation, setIsAmazingAnimation] = useState(false);
  const [stickerType, setStickerType] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showElf, setShowElf] = useState(false);
  const [showElfAlert, setShowElfAlert] = useState(false);
  const [elfCharacter, setElfCharacter] = useState('🧝‍♂️');
  const [stealingState, setStealingState] = useState('none'); // 'none', 'entering', 'grabbing', 'exiting'
  const [stolenStarIndex, setStolenStarIndex] = useState(null); // Which star is being targeted
  
  // State for "Edit Star" modal (better for touch screens than inline inputs)
  const [editingStar, setEditingStar] = useState(null);
  const [animationType, setAnimationType] = useState('curve');

  const addStarTimeoutRef = useRef(null);

  // Theme Definitions
  const themes = {
    default: {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Lighter, fresh look
      cardBg: 'rgba(255, 255, 255, 0.85)',
      primary: '#FFD700',
      secondary: '#FF69B4',
      text: '#2d3436',
      font: '"Fredoka One", "Comic Sans MS", cursive'
    },
    christmas: {
      background: 'linear-gradient(135deg, #2F80ED 0%, #56CCF2 100%)', // Frosty blue/white for contrast with red/green elements
      cardBg: 'rgba(255, 255, 255, 0.90)',
      primary: '#d42426', // Red
      secondary: '#2e8b57', // Green
      text: '#1a472a',
      font: '"Mountains of Christmas", "Fredoka One", cursive'
    }
  };

  const activeTheme = themes[currentTheme];

  // Initialize Particles
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  // Sound Effects
  const playSound = useCallback((type, variation = 0) => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const now = audioContext.currentTime;

      if (type === 'add') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25 + (variation * 100), now); // C5 base
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
      } else if (type === 'elf') {
        oscillator.type = 'sawtooth';
        // Quick giggle-like sequence
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.linearRampToValueAtTime(1200, now + 0.1);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      } else if (type === 'steal') {
        // Mischievous steal sound (descending slide)
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.linearRampToValueAtTime(300, now + 0.4);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
      } else if (type === 'celebration') {
         // Fanfare
         oscillator.type = 'square';
         oscillator.frequency.setValueAtTime(523.25, now);
         gainNode.gain.setValueAtTime(0.1, now);
         gainNode.gain.linearRampToValueAtTime(0, now + 1);
         oscillator.start(now);
         oscillator.stop(now + 1);
      }
    } catch (e) {
      console.warn("Audio error", e);
    }
  }, [soundEnabled]);

  // Data Loading & Saving
  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const timestamp = Date.now();
      const response = await fetch(`/data/sync?t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        setPoints(data.points || 0);
        setStickerType(data.stickerTypes || {});
        if (data.currentTheme) setCurrentTheme(data.currentTheme);
        if (data.points >= 15) setShowCelebration(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  const saveData = useCallback(async (newPoints, newStickerTypes = null, theme = null) => {
    try {
      const payload = {
        points: newPoints,
        stickerTypes: newStickerTypes || stickerType,
        currentTheme: theme || currentTheme
      };
      await fetch('/data/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Sync trigger
      setTimeout(() => loadData(false), 500);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [stickerType, currentTheme, loadData]);

  useEffect(() => {
    loadData();
    const handleVisibilityChange = () => !document.hidden && loadData(false);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadData]);

  // Actions
  const toggleTheme = () => {
    const newTheme = currentTheme === 'default' ? 'christmas' : 'default';
    setCurrentTheme(newTheme);
    saveData(points, stickerType, newTheme);
  };

  const handleStarTap = (index) => {
    if (index === points) {
      // Tap empty next slot -> Add Star
      handleAddPoint({ currentTarget: document.querySelector(`[data-star-index="${index}"]`) });
    } else if (index < points) {
      // Tap filled slot -> Edit Sticker
      setEditingStar(index);
    }
  };

  const handleAddPoint = useCallback((e) => {
    if (points >= 15) return;
    
    // Capture click position or fallback to center if no event provided
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight;
    
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      startX = rect.left + rect.width/2;
      startY = rect.top + rect.height/2;
    }
    
    setNewStarPosition({ x: startX, y: startY });

    // Find target
    const targetIndex = points;
    const starEl = document.querySelector(`[data-star-index="${targetIndex}"]`);
    if (starEl) {
      const targetRect = starEl.getBoundingClientRect();
      setTargetPosition({ x: targetRect.left + targetRect.width/2, y: targetRect.top + targetRect.height/2 });
    }

    // Select random animation
    const animations = ['curve', 'spiral', 'bounce', 'zoom', 'teleport'];
    setAnimationType(animations[Math.floor(Math.random() * animations.length)]);

    setShowNewStar(true);
    playSound('add');
    setLastAction('add');

    // Delay state update to match animation
    setTimeout(() => {
      const newPoints = points + 1;
      setPoints(newPoints);
      setShowNewStar(false);
      playSound('land'); // Play magical chime on landing
      saveData(newPoints, stickerType, currentTheme);
      if (newPoints === 15) setShowCelebration(true);
    }, 1200); // Match animation duration

  }, [points, stickerType, currentTheme, saveData, playSound]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to start a new chart?")) {
      setPoints(0);
      setStickerType({});
      saveData(0, {}, currentTheme);
    }
  };

  const handleElf = () => {
    // Pick a random festive character
    const characters = [
      { char: '🧝‍♂️', name: 'Naughty Elf', canSteal: true },
      { char: '🎅', name: 'Santa', canSteal: false },
      { char: '🦌🛷', name: 'Rudolph', canSteal: false },
      { char: '☃️', name: 'Snowman', canSteal: false },
      { char: '🐧', name: 'Polar Bear', canSteal: false }
    ];
    const visitor = characters[Math.floor(Math.random() * characters.length)];
    setElfCharacter(visitor.char);

    playSound('elf');
    
    // Heist Logic: If it's the elf and there are stars, try to steal one!
    if (visitor.canSteal && points > 0 && Math.random() < 0.4) { // Increased to 40%
      const targetIndex = points - 1; // Steal the last star
      setStolenStarIndex(targetIndex);
      setStealingState('entering');
      setShowElf(true);

      // Sequence:
      // 1. Run to center (1.5s)
      // 2. Pause & Grab (1s)
      // 3. Run away with loot (1.5s)
      
      setTimeout(() => {
        setStealingState('grabbing');
        playSound('steal');
      }, 1500);

      setTimeout(() => {
        setStealingState('exiting');
        // Actually remove the star data now
        const newPoints = points - 1;
        setPoints(newPoints);
        saveData(newPoints, stickerType, currentTheme);
        setShowElfAlert(true);
      }, 2500);

      setTimeout(() => {
        setShowElf(false);
        setStealingState('none');
        setStolenStarIndex(null);
      }, 4000);

    } else {
      // Just a friendly run-by
      setStealingState('runby');
      setShowElf(true);
      setTimeout(() => {
        setShowElf(false);
        setStealingState('none');
      }, 3000);
    }
  };

  const handleAmazing = () => {
    setIsAmazingAnimation(true);
    playSound('celebration');
    const pointsToAdd = Math.min(5, 15 - points);
    if (pointsToAdd > 0) {
      const newPoints = points + pointsToAdd;
      setPoints(newPoints);
      saveData(newPoints, stickerType, currentTheme);
      setTimeout(() => setIsAmazingAnimation(false), 3000);
    }
  };

  // Sticker Options
  const stickers = [
    { icon: Star, color: '#FFD700' },
    { icon: Favorite, color: '#FF69B4' },
    { icon: AutoAwesome, color: '#00BFFF' },
    { icon: EmojiEvents, color: '#FFA500' },
    { icon: Pets, color: '#8B4513' },
    ...(currentTheme === 'christmas' ? [{ icon: Forest, color: '#228B22' }] : [])
  ];

  const getAnimationVariants = () => {
    switch (animationType) {
      case 'spiral':
        return {
          initial: { x: newStarPosition.x, y: newStarPosition.y, scale: 0, opacity: 0, rotate: 0 },
          animate: {
            x: [newStarPosition.x, newStarPosition.x + 100, newStarPosition.x - 100, targetPosition.x],
            y: [newStarPosition.y, newStarPosition.y + 100, newStarPosition.y - 100, targetPosition.y],
            scale: [0.5, 1.5, 0.5, 1],
            rotate: [0, 180, 360, 720],
            opacity: 1
          },
          transition: { duration: 1.2, ease: "easeInOut" }
        };
      case 'bounce':
        return {
          initial: { x: newStarPosition.x, y: newStarPosition.y, scale: 0.5, opacity: 0 },
          animate: {
            x: targetPosition.x,
            y: [newStarPosition.y, newStarPosition.y - 150, targetPosition.y],
            scale: 1,
            opacity: 1,
            rotate: 180
          },
          transition: { duration: 1, ease: "circOut" }
        };
      case 'zoom':
        return {
          initial: { x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 5, opacity: 0 },
          animate: {
            x: targetPosition.x,
            y: targetPosition.y,
            scale: 1,
            opacity: 1,
            rotate: 360
          },
          transition: { duration: 0.8, ease: "backIn" }
        };
      case 'teleport':
        return {
           initial: { x: newStarPosition.x, y: newStarPosition.y, scale: 1, opacity: 1 },
           animate: {
             scale: [1, 0, 1.5, 1],
             opacity: [1, 0, 1, 1],
             x: [newStarPosition.x, newStarPosition.x, targetPosition.x, targetPosition.x],
             y: [newStarPosition.y, newStarPosition.y, targetPosition.y, targetPosition.y],
             rotate: [0, 180, 360, 0]
           },
           transition: { duration: 0.8, times: [0, 0.4, 0.6, 1] }
        };
      case 'curve':
      default:
        return {
          initial: { x: newStarPosition.x, y: newStarPosition.y, scale: 0.5, opacity: 0, rotate: -180 },
          animate: {
            x: [newStarPosition.x, newStarPosition.x - 50, targetPosition.x],
            y: [newStarPosition.y, newStarPosition.y - 100, targetPosition.y],
            scale: [0.5, 2, 1],
            opacity: 1,
            rotate: [0, 180, 360]
          },
          transition: { duration: 1.2, times: [0, 0.5, 1], ease: "backOut" }
        };
    }
  };

  if (isLoading) return null;

  return (
    <Box sx={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: activeTheme.background,
      fontFamily: activeTheme.font,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      
      {/* Background Particles */}
      {(currentTheme === 'christmas' || isAmazingAnimation) && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            particles: {
              number: { value: 50 },
              color: { value: "#ffffff" },
              move: { enable: true, speed: 2, direction: "bottom" },
              opacity: { value: { min: 0.1, max: 0.5 } },
              size: { value: { min: 1, max: 3 } }
            }
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />
      )}

      {/* Main Container - Optimized for Vertical Layout */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        gap: 2,
        zIndex: 1,
        maxWidth: '600px',
        width: '100%',
        mx: 'auto'
      }}>
        
        {/* Header Widget */}
        <Card sx={{
          background: activeTheme.cardBg,
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          p: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: activeTheme.text, opacity: 0.7 }}>
              {currentTheme === 'christmas' ? "Millie's Christmas" : "Millie's Stars"}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: activeTheme.text }}>
              {points} <Typography component="span" sx={{ fontSize: '0.5em', opacity: 0.5 }}>/ 15</Typography>
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <IconButton onClick={toggleTheme} sx={{ 
              background: 'rgba(0,0,0,0.05)', 
              mb: 1 
            }}>
              {currentTheme === 'christmas' ? <AcUnit /> : <EmojiEvents />}
            </IconButton>
            <Typography variant="caption" display="block" sx={{ fontWeight: 700, color: activeTheme.text }}>
              {15 - points === 0 ? "Goal Reached!" : `${15 - points} to go!`}
            </Typography>
          </Box>
        </Card>

        {/* Progress Bar */}
        <Box sx={{ width: '100%' }}>
          <LinearProgress 
            variant="determinate" 
            value={(points / 15) * 100} 
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: currentTheme === 'christmas' ? '#d42426' : '#FFD700',
                borderRadius: 6
              }
            }}
          />
        </Box>

        {/* Star Grid - The Main Event */}
        <Box sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(5, 1fr)',
          gap: 1.5,
          perspective: '1000px'
        }}>
          {Array.from({ length: 15 }).map((_, i) => {
            const isFilled = i < points;
            const Icon = isFilled 
              ? stickers[stickerType[i] || 0].icon
              : StarBorder;
            
            return (
              <motion.div
                key={i}
                initial={false}
                animate={{ 
                  scale: isFilled ? [1, 1.1, 1] : 1, 
                  opacity: isFilled ? 1 : 0.8,
                  rotate: isFilled ? 0 : 0
                }}
                whileTap={{ scale: 0.9 }}
                style={{ width: '100%', height: '100%' }}
              >
                <Box
                  data-star-index={i}
                  onClick={() => handleStarTap(i)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: isFilled 
                      ? (currentTheme === 'christmas' ? 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,200,200,0.8))' : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,200,0.8))')
                      : 'rgba(255,255,255,0.15)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isFilled ? 'none' : '2px dashed rgba(255,255,255,0.3)',
                    boxShadow: isFilled 
                      ? '0 10px 20px rgba(0,0,0,0.15), inset 0 -5px 15px rgba(0,0,0,0.05)' 
                      : 'inset 0 2px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  <Icon sx={{ 
                    fontSize: '3.5rem', 
                    color: isFilled ? stickers[stickerType[i] || 0].color : 'rgba(255,255,255,0.2)',
                    filter: isFilled ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                    transform: isFilled ? 'scale(1.1)' : 'scale(0.8)'
                  }} />
                </Box>
              </motion.div>
            );
          })}
        </Box>

        {/* Bottom Dock - Floating Action Bar */}
        <Card sx={{
          background: activeTheme.cardBg,
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          p: 1.5,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          mb: 1
        }}>
           <IconButton onClick={handleReset} size="large" sx={{ color: '#ff6b6b' }}>
             <Refresh />
           </IconButton>
           
           {currentTheme === 'christmas' && (
             <IconButton onClick={handleElf} size="large" sx={{ color: '#2e8b57' }}>
               <Box component="span" sx={{ fontSize: '1.5rem' }}>🧝</Box>
             </IconButton>
           )}

           {/* Only show Add Star button if not using grid tap interaction? No, keep it for accessibility/visibility but grid is main */}
           <Button
             variant="contained"
             onClick={handleAddPoint}
             disabled={points >= 15}
             sx={{
               borderRadius: '24px',
               px: 4,
               py: 1.5,
               fontSize: '1.1rem',
               fontWeight: 900,
               background: currentTheme === 'christmas' 
                 ? 'linear-gradient(45deg, #2e8b57, #3cb371)'
                 : 'linear-gradient(45deg, #FFD700, #FFA500)',
               color: '#fff',
               boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
               textTransform: 'none',
               minWidth: '140px',
               display: { xs: 'none', md: 'block' } // Hide on small screens where grid tap is obvious
             }}
           >
             Add Star
           </Button>

           <IconButton onClick={handleAmazing} disabled={points >= 15} size="large" sx={{ color: '#a29bfe' }}>
             <AutoAwesome />
           </IconButton>
        </Card>
      </Box>

      {/* Floating Star Animation - Enhanced */}
      <AnimatePresence>
        {showNewStar && (
          <motion.div
            {...getAnimationVariants()}
            exit={{ scale: 1.5, opacity: 0 }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              zIndex: 9999, 
              pointerEvents: 'none',
              marginTop: -30,
              marginLeft: -30
            }}
          >
            {currentTheme === 'christmas' ? (
              <span style={{ fontSize: '60px' }}>⭐</span>
            ) : (
              <Star sx={{ fontSize: 80, color: '#FFD700', filter: 'drop-shadow(0 0 15px gold)' }} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elf / Character Animation Layer */}
      <AnimatePresence>
        {showElf && (
          <motion.div
            initial={{ 
              x: '110vw', 
              y: '60%', 
              rotate: 0,
              scale: 1 
            }}
            animate={
              stealingState === 'runby' ? {
                x: ['110vw', '-20vw'],
                y: ['60%', '62%', '58%', '60%'], // Bobbing walk
                rotate: [0, -5, 5, 0]
              } : stealingState === 'entering' ? {
                x: '50vw', // Stop in middle
                y: '60%',
                rotate: 0
              } : stealingState === 'grabbing' ? {
                scale: [1, 1.2, 1], // Grab effect
                rotate: [0, -15, 0]
              } : stealingState === 'exiting' ? {
                x: '-20vw',
                y: '60%',
                rotate: -10
              } : {}
            }
            transition={{ 
              duration: stealingState === 'runby' ? 3 : 1.5, 
              ease: stealingState === 'runby' ? "linear" : "easeInOut"
            }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              zIndex: 2000, 
              fontSize: '150px', 
              filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))',
              marginLeft: '-75px', // Center alignment
              marginTop: '-75px'
            }}
          >
            {/* If grabbing/exiting, show the star IN HAND */}
            {(stealingState === 'grabbing' || stealingState === 'exiting') ? (
              <div style={{ position: 'relative' }}>
                {elfCharacter}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ position: 'absolute', top: 20, right: -20, fontSize: '60px' }}
                >
                  ⭐
                </motion.div>
              </div>
            ) : (
              elfCharacter
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Dialog */}
      <Dialog 
        open={showCelebration} 
        onClose={() => setShowCelebration(false)}
        PaperProps={{
          sx: {
            borderRadius: '32px',
            p: 2,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontSize: '2rem' }}>
          {currentTheme === 'christmas' ? "🎅 HO HO HO! 🎄" : "🎉 AMAZING! 🎉"}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Chart Complete!
          </Typography>
          <Box sx={{ fontSize: '5rem', my: 2 }}>🎁</Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => {
              setShowCelebration(false);
              handleReset();
            }}
            sx={{ borderRadius: '20px', px: 4, py: 1.5, fontSize: '1.2rem' }}
          >
            Claim Reward!
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Sticker Selection Dialog */}
       <Dialog 
        open={editingStar !== null} 
        onClose={() => setEditingStar(null)}
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>Choose Sticker</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, p: 1 }}>
            {stickers.map((s, idx) => (
              <IconButton 
                key={idx} 
                onClick={() => {
                  const newTypes = { ...stickerType, [editingStar]: idx };
                  setStickerType(newTypes);
                  saveData(points, newTypes, currentTheme);
                  setEditingStar(null);
                }}
                sx={{ 
                  background: 'rgba(0,0,0,0.05)', 
                  p: 2,
                  border: stickerType[editingStar] === idx ? '2px solid gold' : 'none'
                }}
              >
                <s.icon sx={{ color: s.color, fontSize: '2rem' }} />
              </IconButton>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Elf Stole Star Alert */}
      <Snackbar 
        open={showElfAlert} 
        autoHideDuration={4000} 
        onClose={() => setShowElfAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowElfAlert(false)} 
          severity="warning" 
          sx={{ 
            width: '100%', 
            fontSize: '1.2rem', 
            alignItems: 'center',
            '& .MuiAlert-icon': { fontSize: '2rem' }
          }}
          icon={<span style={{fontSize: '2rem'}}>🧝</span>}
        >
          Oh no! The Naughty Elf stole a star!
        </Alert>
      </Snackbar>

    </Box>
  );
}

export default App;
