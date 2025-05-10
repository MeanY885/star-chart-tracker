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
  Tooltip
} from '@mui/material';
import { Star, AddCircle, RemoveCircle, Edit, EmojiEvents } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

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
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('daddyPoints');
    return saved ? parseInt(saved) : 0;
  });
  const [starComments, setStarComments] = useState(() => {
    const saved = localStorage.getItem('starComments');
    return saved ? JSON.parse(saved) : {};
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [showNewStar, setShowNewStar] = useState(false);
  const [newStarPosition, setNewStarPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentStarIndex, setCurrentStarIndex] = useState(null);
  const [currentComment, setCurrentComment] = useState('');

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    localStorage.setItem('daddyPoints', points.toString());
    localStorage.setItem('starComments', JSON.stringify(starComments));
    if (points >= 15) {
      setShowCelebration(true);
    }
  }, [points, starComments]);

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
        duration: 2
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
        duration: 2.5
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
        duration: 2.8
      },
      // 4. Pinball
      {
        path: Array.from({ length: 10 }, () => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight
        })),
        rotate: [-360, 720, -180, 360],
        scale: [5, 2, 4, 3, 1],
        duration: 2.2
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
        duration: 2.4
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
        duration: 2.6
      },
      // 7. Snake
      {
        path: Array.from({ length: 20 }, (_, i) => ({
          x: (window.innerWidth/20) * i,
          y: window.innerHeight/2 + Math.sin(i/2) * 200
        })),
        rotate: [0, 360, 720],
        scale: [4, 2, 3, 1],
        duration: 2.3
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
        duration: 2.7
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
        duration: 2.5
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
        duration: 2.8
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
        duration: 2.4
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
        duration: 2.6
      },
      // 13. Bouncing Ball
      {
        path: Array.from({ length: 10 }, (_, i) => ({
          x: (window.innerWidth/10) * i,
          y: window.innerHeight - Math.abs(Math.sin(i/2 * Math.PI)) * window.innerHeight * 0.8
        })),
        rotate: [0, 360],
        scale: [3, 2, 4, 1],
        duration: 2.2
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
        duration: 2.7
      },
      // 15. Zigzag Bounce
      {
        path: Array.from({ length: 12 }, (_, i) => ({
          x: (window.innerWidth/12) * i,
          y: window.innerHeight/2 + (i % 2 === 0 ? -200 : 200)
        })),
        rotate: [-360, 0, 360],
        scale: [4, 2, 3, 1],
        duration: 2.3
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
        duration: 2.8
      },
      // 17. Wave Pattern
      {
        path: Array.from({ length: 20 }, (_, i) => ({
          x: (window.innerWidth/20) * i,
          y: window.innerHeight/2 + Math.sin(i/3) * 100 + Math.cos(i/2) * 100
        })),
        rotate: [0, 360, 720],
        scale: [3, 4, 2, 1],
        duration: 2.5
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
        duration: 2.4
      },
      // 19. Elastic Bounce
      {
        path: Array.from({ length: 8 }, (_, i) => ({
          x: window.innerWidth/2 + (i % 2 === 0 ? -200 : 200),
          y: (window.innerHeight/8) * i
        })),
        rotate: [0, 360],
        scale: [4, 1.5, 3, 1],
        duration: 2.6
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
        duration: 2.7
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
        duration: 2.8
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
        duration: 2.3
      },
      // 23. Meteor Shower
      {
        path: Array.from({ length: 10 }, (_, i) => ({
          x: window.innerWidth - (window.innerWidth/10) * i,
          y: (window.innerHeight/10) * i
        })),
        rotate: [0, 900],
        scale: [4, 2, 3, 1],
        duration: 2.2
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
        duration: 2.6
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
        duration: 2.4
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
        duration: 2.7
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
        duration: 2.2
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
        duration: 2.8
      },
      // 29. Spring Motion
      {
        path: Array.from({ length: 16 }, (_, i) => ({
          x: (window.innerWidth/16) * i,
          y: window.innerHeight/2 + Math.sin(i * 1.5) * (200 - i * 10)
        })),
        rotate: [0, 720],
        scale: [4, 2, 3, 1],
        duration: 2.5
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
        duration: 2.6
      }
    ];

    // Ensure we get a different animation each time
    const lastAnimation = window.lastAnimationIndex;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * animations.length);
    } while (newIndex === lastAnimation);
    window.lastAnimationIndex = newIndex;
    return animations[newIndex];
  };

  const handleAddPoint = () => {
    setLastAction('add');
    const newPoints = Math.min(points + 1, 15);
    
    if (newPoints > points) {
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

  const handleClaimPrize = () => {
    setShowCelebration(false);
    setPoints(0);
    setStarComments({});
  };

  const handleCommentSave = () => {
    if (currentStarIndex !== null) {
      setStarComments(prev => ({
        ...prev,
        [currentStarIndex]: currentComment
      }));
      setCommentDialogOpen(false);
      setCurrentComment('');
      setCurrentStarIndex(null);
    }
  };

  const handleEditComment = (index) => {
    setCurrentStarIndex(index);
    setCurrentComment(starComments[index] || '');
    setCommentDialogOpen(true);
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
        fontFamily: '"Comic Sans MS", "Comic Sans", cursive'
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
        `}
      </style>

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
            setCommentDialogOpen(true);
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

      {lastAction === 'add' && (
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
            padding: { xs: 2, sm: 4 },
            position: 'relative'
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
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                color: '#FF69B4',
                textShadow: '3px 3px 0px #FFA500, 6px 6px 0px rgba(0,0,0,0.1)',
                mb: 2,
                fontFamily: 'inherit'
              }}
            >
              Millie's Star Chart
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: '#666',
                fontFamily: 'inherit',
                fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                fontWeight: 'normal'
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
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                {points} / 15 Stars
              </Typography>
            </motion.div>
            <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mt: 4 }}>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="add-button"
              >
                <IconButton 
                  onClick={handleAddPoint}
                  sx={{ 
                    p: { xs: 2, sm: 3 },
                    background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #8BC34A, #4CAF50)'
                    }
                  }}
                >
                  <AddCircle sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, color: '#FFF' }} />
                </IconButton>
              </motion.div>
            </Box>
          </Box>

          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: { xs: 3, sm: 4, md: 5 },
              width: '100%',
              maxWidth: { xs: '90vw', sm: '80vw', md: '70vw' },
              margin: '0 auto',
              position: 'relative',
              padding: 3,
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '30px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <AnimatePresence>
              {[...Array(15)].map((_, index) => (
                <Tooltip 
                  key={index}
                  title={starComments[index] || 'No comment yet'}
                  placement="top"
                  arrow
                >
                  <Box sx={{ position: 'relative' }}>
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
                      <Star 
                        sx={{ 
                          fontSize: { xs: 60, sm: 80, md: 100 },
                          color: index < points ? '#FFD700' : 'rgba(0,0,0,0.1)',
                          filter: index < points ? 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' : 'none',
                          transition: 'all 0.3s ease'
                        }} 
                      />
                    </motion.div>
                    {index < points && (
                      <IconButton
                        size="small"
                        onClick={() => handleEditComment(index)}
                        sx={{
                          position: 'absolute',
                          bottom: -8,
                          right: -8,
                          backgroundColor: '#FF69B4',
                          color: '#FFF',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          '&:hover': { 
                            backgroundColor: '#FF1493',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <Edit sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                </Tooltip>
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

          <Dialog 
            open={commentDialogOpen} 
            onClose={() => setCommentDialogOpen(false)}
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
              <Typography 
                variant="h5" 
                sx={{ 
                  textAlign: 'center',
                  color: '#FF69B4',
                  fontFamily: 'inherit'
                }}
              >
                Why did Millie earn this star? ⭐
              </Typography>
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="What amazing thing did Millie do?"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                    fontFamily: 'inherit'
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'inherit'
                  }
                }}
              />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
              <Button 
                onClick={() => setCommentDialogOpen(false)}
                sx={{ 
                  fontFamily: 'inherit',
                  textTransform: 'none',
                  color: '#666'
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCommentSave}
                variant="contained"
                sx={{ 
                  background: 'linear-gradient(45deg, #FF69B4, #FFA500)',
                  borderRadius: '25px',
                  px: 4,
                  fontFamily: 'inherit',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FFA500, #FF69B4)'
                  }
                }}
              >
                Save Comment
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </motion.div>
    </Container>
  );
}

export default App; 