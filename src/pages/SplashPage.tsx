import {
  Box, Button, VStack, Icon, Image,
} from '@chakra-ui/react';
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalBody } from '@chakra-ui/react';
import { keyframes, css } from '@emotion/react';
import { FcGoogle } from 'react-icons/fc';
import { PiUserLight } from 'react-icons/pi';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import logo from '../assets/icons/logo.svg';
import howItWorks from '../assets/img/how-it-works.png';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

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

const provider = new GoogleAuthProvider();
const MotionBox = motion(Box);
const MotionImage = motion(Image);

export function SplashPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleGoogle = async () => {
    const res = await signInWithPopup(auth, provider);
    setUser(res.user);
    navigate('/chat');
  };

  const handleGuest = () => {
    setUser({ uid: 'guest', displayName: 'Guest' } as any);
    navigate('/chat');
  };

  return (
    <MotionBox
      position="relative"
      minH="100vh"
      h="100vh"
      overflow="hidden"
      bg="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg="white"
        rounded="xl"
        shadow="lg"
        px={8}
        py={10}
        textAlign="center"
        w="full"
        maxW="sm"
        zIndex={0}
        position="absolute"
        _before={{
          content: '""',
          position: 'absolute',
          top: '0px',
          left: '0px',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '50%',
          bgGradient: 'radial(circle, rgba(150, 218, 255, 0.50) 60%, transparent 80%)',
          filter: 'blur(60px)',
          animation: `${glowPulse} 4s ease-in-out infinite`,
          zIndex: -1,
        }}
      >
        <VStack spacing={12} align="center">
          {/* bouncing Neurastack logo */}
          <MotionImage
            src={logo}
            boxSize="200px"
            alt="logo"
            animate={css`${logoBounce} 2s ease-in-out infinite`}
          />

          {/* Sign‑in buttons */}
          <Button
            leftIcon={<FcGoogle fontSize="22px" />}   /* larger icon */
            w="full"
            bg="white"
            color="#1A202C"
            border="1px solid #E2E8F0"
            fontWeight="medium"
            _hover={{ boxShadow: 'md', transform: 'translateY(-1px)' }}
            _active={{ bg: 'gray.100' }}
            _focus={{ boxShadow: 'outline' }}
            onClick={handleGoogle}
            p="20px"
          >
            Sign in with Google
          </Button>

          <Button
            leftIcon={<PiUserLight />}
            w="full"
            bg="white"
            color="#1A202C"
            border="1px solid #E2E8F0"
            fontWeight="medium"
            _hover={{ boxShadow: 'md', transform: 'translateY(-1px)' }}
            _active={{ bg: 'gray.100' }}
            _focus={{ boxShadow: 'outline' }}
            onClick={handleGuest}
            p="20px"
          >
            Continue as Guest
          </Button>

          <Button
            rightIcon={<Icon as={AiOutlineInfoCircle} />}
            w="full"
            bg="white"
            color="#1A202C"
            border="1px solid #E2E8F0"
            fontWeight="medium"
            _hover={{ boxShadow: 'md', transform: 'translateY(-1px)' }}
            _active={{ bg: 'gray.100' }}
            _focus={{ boxShadow: 'outline' }}
            onClick={onOpen}
            p="20px"
          >
            neurastack?
          </Button>
        </VStack>
      </Box>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        isCentered
        closeOnOverlayClick
        motionPreset="scale"
      >
        <ModalOverlay
          bg="blackAlpha.600"
          backdropFilter="blur(8px)"
          onClick={onClose}
          cursor="pointer"
        />
        <ModalContent
          bg="transparent"
          boxShadow="none"
          maxW="90vw"
          maxH="90vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={0}
        >
          <ModalBody
            p={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
          >
            <Image
              src={howItWorks}
              alt="How NeuraStack works"
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