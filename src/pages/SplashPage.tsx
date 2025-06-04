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

/*───────────────────────────────────────────*/
/* Small logo bounce + background glow       */
/*───────────────────────────────────────────*/
const glowPulse = keyframes`
  0%   { opacity: .6; transform: scale(.9); }
  50%  { opacity: 1;  transform: scale(1); }
  100% { opacity: .6; transform: scale(.9); }
`;

export function SplashPage() {
  const bgPage = "linear-gradient(135deg, #FAFBFC 0%, #F1F5F9 100%)";
  const iconFilter = "none";
  const btnColor = "blue";

  const navigate  = useNavigate();
  const setUser   = useAuthStore((s) => s.setUser);
  const toast     = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loadingGoogle, setLoadingGoogle] = React.useState(false);
  const [loadingGuest,  setLoadingGuest]  = React.useState(false);
  const user = useAuthStore((s) => s.user);

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
    >
      {/* Modern Glass Card */}
      <Box
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(20px)"
        rounded="3xl"
        shadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        border="1px solid rgba(255, 255, 255, 0.2)"
        px={10}
        py={12}
        maxW="md"
        w="full"
        position="relative"
        _before={{
          content: '""',
          pos: "absolute",
          inset: 0,
          transform: "translate(-50%, -50%)",
          w: "120%",
          h: "60%",
          bgGradient:
            "radial(circle, rgba(79, 156, 249, 0.3) 40%, transparent 70%)",
          filter: "blur(80px)",
          animation: `${glowPulse} 6s ease-in-out infinite`,
          zIndex: -1,
        }}
      >
        <VStack spacing={12}>
          {/* Logo */}
          <MotionImage
            src={logo}
            boxSize="200px"
            alt="Neurastack Logo"
            filter={iconFilter}
            animate={{
              y: [0, -6, 0],
              transition: { duration: 2, ease: "easeInOut", repeat: Infinity }
            }}
          />

          <Button
            leftIcon={<FcGoogle />}
            w="full"
            h="56px"
            isLoading={loadingGoogle}
            onClick={handleGoogle}
            aria-label="Sign in with Google"
            variant="outline"
            colorScheme={btnColor}
            borderWidth="2px"
            borderRadius="xl"
            fontSize="md"
            fontWeight="600"
            bg="rgba(255, 255, 255, 0.8)"
            backdropFilter="blur(10px)"
            _hover={{
              bg: "rgba(255, 255, 255, 0.95)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 20px rgba(79, 156, 249, 0.25)"
            }}
          >
            Sign in with Google
          </Button>

          {/* Guest button */}
          <Button
            leftIcon={<PiUserLight />}
            w="full"
            h="56px"
            isLoading={loadingGuest}
            onClick={handleGuest}
            aria-label="Continue as guest"
            variant="outline"
            colorScheme={btnColor}
            borderWidth="2px"
            borderRadius="xl"
            fontSize="md"
            fontWeight="600"
            bg="rgba(255, 255, 255, 0.8)"
            backdropFilter="blur(10px)"
            _hover={{
              bg: "rgba(255, 255, 255, 0.95)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 20px rgba(79, 156, 249, 0.25)"
            }}
          >
            Continue as Guest
          </Button>

          {/* Info button */}
          <Button
            leftIcon={<Icon as={AiOutlineInfoCircle} />}
            w="full"
            variant="outline"
            onClick={onOpen}
            aria-label="What is neurastack?"
            colorScheme={btnColor}
            py={6}
          >
            neurastack?
          </Button>
        </VStack>
      </Box>

      {/* How-it-works modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent bg="transparent" boxShadow="none" maxW="90vw" maxH="90vh">
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
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
}