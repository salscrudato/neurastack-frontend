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
import { keyframes, css } from "@emotion/react";
import { FcGoogle } from "react-icons/fc";
import { PiUserLight } from "react-icons/pi";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { motion } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
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
const logoBounce = keyframes`
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-6px); }
  100% { transform: translateY(0); }
`;
const glowPulse = keyframes`
  0%   { opacity: .6; transform: scale(.9); }
  50%  { opacity: 1;  transform: scale(1); }
  100% { opacity: .6; transform: scale(.9); }
`;

export function SplashPage() {
  const navigate  = useNavigate();
  const setUser   = useAuthStore((s) => s.setUser);
  const toast     = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loadingGoogle, setLoadingGoogle] = React.useState(false);
  const [loadingGuest,  setLoadingGuest]  = React.useState(false);

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

  const handleGuest = () => {
    setLoadingGuest(true);
    setUser({ uid: "guest", displayName: "Guest" } as any);
    navigate("/chat", { replace: true });
  };

  return (
    <MotionBox
      minH="100vh"
      bg="bg"               // uses custom theme token
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Card */}
      <Box
        bg="white"
        rounded="xl"
        shadow="lg"
        px={8}
        py={10}
        maxW="sm"
        w="full"
        position="relative"
        _before={{
          content: '""',
          pos: "absolute",
          inset: 0,
          transform: "translate(-50%, -50%)",
          w: "100%",
          h: "50%",
          bgGradient:
            "radial(circle, rgba(150, 218, 255, 0.50) 60%, transparent 80%)",
          filter: "blur(60px)",
          animation: `${glowPulse} 4s ease-in-out infinite`,
          zIndex: -1,
        }}
      >
        <VStack spacing={12}>
          {/* Logo */}
          <MotionImage
            src={logo}
            boxSize="200px"
            alt="Neurastack Logo"
            animate={css`${logoBounce} 2s ease-in-out infinite`}
          />

          {/* Google button */}
          <Button
            leftIcon={<FcGoogle fontSize="22px" />}
            w="full"
            isLoading={loadingGoogle}
            onClick={handleGoogle}
            aria-label="Sign in with Google"
            variant="outline"
            py={6}
          >
            Sign in with Google
          </Button>

          {/* Guest button */}
          <Button
            leftIcon={<PiUserLight />}
            w="full"
            isLoading={loadingGuest}
            onClick={handleGuest}
            aria-label="Continue as guest"
            variant="outline"
            py={6}
          >
            Continue as Guest
          </Button>

          {/* Info button */}
          <Button
            rightIcon={<Icon as={AiOutlineInfoCircle} />}
            w="full"
            variant="outline"
            onClick={onOpen}
            aria-label="What is neurastack?"
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