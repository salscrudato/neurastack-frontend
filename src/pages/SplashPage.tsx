import {
  Box,
  Button,
  VStack,
  Image,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  useToast,
  Text,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FcGoogle } from "react-icons/fc";
import { PiUserLight } from "react-icons/pi";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { motion } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import logo from "../assets/icons/logo.svg";
import howItWorks from "../assets/img/how-it-works.png";
import React from "react";

const provider = new GoogleAuthProvider();
const MotionBox = motion(Box);
const MotionImage = motion(Image);
const MotionButton = motion(Button);
const MotionText = motion(Text);

/*───────────────────────────────────────────*/
/* Enhanced animations and effects           */
/*───────────────────────────────────────────*/
const glowPulse = keyframes`
  0%   { opacity: .6; transform: scale(.9); }
  50%  { opacity: 1;  transform: scale(1); }
  100% { opacity: .6; transform: scale(.9); }
`;

const floatingParticles = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(120deg); }
  66% { transform: translateY(5px) rotate(240deg); }
`;

// Floating particles component
const FloatingParticle = ({ delay = 0, size = 4, top = "20%", left = "10%" }) => (
  <Box
    position="absolute"
    top={top}
    left={left}
    w={`${size}px`}
    h={`${size}px`}
    bg="rgba(79, 156, 249, 0.3)"
    borderRadius="full"
    animation={`${floatingParticles} ${6 + delay}s ease-in-out infinite`}
    sx={{
      animationDelay: `${delay}s`,
    }}
    pointerEvents="none"
    zIndex={0}
  />
);

export function SplashPage() {
  const bgPage = "linear-gradient(135deg, #FAFBFC 0%, #F1F5F9 100%)";
  const iconFilter = "none";

  const navigate  = useNavigate();
  const setUser   = useAuthStore((s) => s.setUser);
  const toast     = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loadingGoogle, setLoadingGoogle] = React.useState(false);
  const [loadingGuest,  setLoadingGuest]  = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const user = useAuthStore((s) => s.user);

  // Trigger entrance animation
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (user) {
      navigate("/chat", { replace: true });
    }
  }, [user, navigate]);

  const handleGoogle = async () => {
    try {
      setLoadingGoogle(true);
      const res = await signInWithPopup(auth, provider);
      setUser(res.user);
      navigate("/chat", { replace: true });
    } catch (err: any) {
      toast({
        status: "error",
        title: "Google sign-in failed",
        description: err.message,
      });
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleGuest = async () => {
    try {
      setLoadingGuest(true);
      const cred = await signInAnonymously(auth);
      setUser(cred.user);
      navigate("/chat", { replace: true });
    } catch (err: any) {
      toast({
        status: "error",
        title: "Guest sign‑in failed",
        description: err.message,
      });
    } finally {
      setLoadingGuest(false);
    }
  };

  return (
    <MotionBox
      minH="100vh"
      bg={bgPage}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Floating Particles Background */}
      <FloatingParticle delay={0} size={6} top="15%" left="8%" />
      <FloatingParticle delay={1} size={4} top="25%" left="85%" />
      <FloatingParticle delay={2} size={8} top="60%" left="12%" />
      <FloatingParticle delay={0.5} size={5} top="70%" left="88%" />
      <FloatingParticle delay={1.5} size={3} top="40%" left="92%" />
      <FloatingParticle delay={2.5} size={7} top="80%" left="5%" />

      {/* Enhanced Glass Card - Narrower and Desktop Friendly */}
      <MotionBox
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(24px)"
        rounded="3xl"
        shadow="0 32px 64px -12px rgba(0, 0, 0, 0.15)"
        border="1px solid rgba(255, 255, 255, 0.3)"
        px={{ base: 6, sm: 8, md: 10 }}
        py={{ base: 8, sm: 10, md: 12 }}
        maxW={{ base: "85%", sm: "380px", md: "400px" }}
        w="full"
        position="relative"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={isVisible ? { scale: 1, opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        _before={{
          content: '""',
          pos: "absolute",
          inset: 0,
          transform: "translate(-50%, -50%)",
          w: "130%",
          h: "70%",
          bgGradient:
            "radial(circle, rgba(79, 156, 249, 0.25) 30%, transparent 70%)",
          filter: "blur(100px)",
          animation: `${glowPulse} 8s ease-in-out infinite`,
          zIndex: -1,
        }}
      >
        <VStack spacing={{ base: 6, sm: 7, md: 8 }}>
          {/* Centered Logo with enhanced animation */}
          <MotionBox textAlign="center" w="full" display="flex" flexDirection="column" alignItems="center">
            <MotionImage
              src={logo}
              boxSize={{ base: "140px", sm: "160px", md: "180px", lg: "200px" }}
              alt="Neurastack Logo"
              filter={iconFilter}
              mx="auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isVisible ? {
                scale: 1,
                opacity: 1,
                y: [0, -8, 0],
              } : {}}
              transition={{
                scale: { duration: 0.6, delay: 0.2 },
                opacity: { duration: 0.6, delay: 0.2 },
                y: { duration: 3, ease: "easeInOut", repeat: Infinity, delay: 1 }
              }}
            />

            {/* Brand tagline */}
            <MotionText
              mt={{ base: 3, md: 4 }}
              fontSize={{ base: "md", sm: "lg", md: "xl" }}
              fontWeight="600"
              bgGradient="linear(135deg, #4F9CF9 0%, #8B5CF6 100%)"
              bgClip="text"
              textAlign="center"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              The neural network stack.
            </MotionText>
          </MotionBox>

          {/* Google Sign-in Button - Clean & Consistent */}
          <MotionButton
            as={Button}
            leftIcon={<FcGoogle />}
            w="full"
            h={{ base: "44px", sm: "48px", md: "50px" }}
            isLoading={loadingGoogle}
            onClick={handleGoogle}
            aria-label="Sign in with Google"
            variant="outline"
            borderWidth="1px"
            borderColor="rgba(226, 232, 240, 0.8)"
            borderRadius="xl"
            fontSize={{ base: "sm", md: "sm" }}
            fontWeight="500"
            bg="rgba(255, 255, 255, 0.95)"
            color="gray.700"
            shadow="sm"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{
              scale: 1.02,
              y: -2,
            }}
            whileTap={{ scale: 0.98 }}
            _hover={{
              bg: "white",
              borderColor: "rgba(226, 232, 240, 1)",
              shadow: "md",
              transform: "translateY(-2px) scale(1.02)",
            }}
            _active={{
              transform: "scale(0.98)",
            }}
          >
            Sign in with Google
          </MotionButton>

          {/* Guest Button - Clean & Consistent */}
          <MotionButton
            as={Button}
            leftIcon={<PiUserLight />}
            w="full"
            h={{ base: "44px", sm: "48px", md: "50px" }}
            isLoading={loadingGuest}
            onClick={handleGuest}
            aria-label="Continue as guest"
            variant="outline"
            borderWidth="1px"
            borderColor="rgba(226, 232, 240, 0.8)"
            borderRadius="xl"
            fontSize={{ base: "sm", md: "sm" }}
            fontWeight="500"
            bg="rgba(255, 255, 255, 0.95)"
            color="gray.700"
            shadow="sm"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{
              scale: 1.02,
              y: -2,
            }}
            whileTap={{ scale: 0.98 }}
            _hover={{
              bg: "white",
              borderColor: "rgba(226, 232, 240, 1)",
              shadow: "md",
              transform: "translateY(-2px) scale(1.02)",
            }}
            _active={{
              transform: "scale(0.98)",
            }}
          >
            Continue as Guest
          </MotionButton>

          {/* Info Button - Clean & Consistent */}
          <MotionButton
            as={Button}
            leftIcon={<Icon as={AiOutlineInfoCircle} />}
            w="full"
            h={{ base: "40px", sm: "44px", md: "46px" }}
            variant="outline"
            onClick={onOpen}
            aria-label="What is neurastack?"
            borderWidth="1px"
            borderColor="rgba(226, 232, 240, 0.8)"
            borderRadius="xl"
            fontSize={{ base: "sm", md: "sm" }}
            fontWeight="500"
            bg="rgba(255, 255, 255, 0.95)"
            color="gray.600"
            shadow="sm"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{
              scale: 1.02,
              y: -2,
            }}
            whileTap={{ scale: 0.98 }}
            _hover={{
              bg: "white",
              borderColor: "rgba(226, 232, 240, 1)",
              shadow: "md",
              transform: "translateY(-2px) scale(1.02)",
              color: "gray.700",
            }}
            _active={{
              transform: "scale(0.98)",
            }}
          >
            neurastack?
          </MotionButton>
        </VStack>
      </MotionBox>

      {/* Enhanced How-it-works modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
        <ModalOverlay
          bg="blackAlpha.700"
          backdropFilter="blur(12px)"
        />
        <ModalContent
          bg="transparent"
          boxShadow="none"
          maxW="90vw"
          maxH="90vh"
        >
          <ModalBody
            p={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <Image
              src={howItWorks}
              alt="How Neurastack works"
              maxW="100%"
              maxH="100%"
              objectFit="contain"
              borderRadius="2xl"
              shadow="2xl"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
}