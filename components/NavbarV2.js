import React, { useState } from "react";
import Link from 'next/link';
import { Tooltip, Flex, Stack, IconButton, useColorMode, useColorModeValue, Box, Image, Text } from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleColorMode } = useColorMode();
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Flex
      as="nav"
      align="center"
      justifyContent="center"
      wrap="wrap"
      w="100%"
      py={5}
      bg={["dark.500", "dark.500", "transparent", "transparent"]}
      position="fixed"
      background={useColorModeValue("#ececec30", "#15151930")}
      backdropFilter="blur(10px)"
      zIndex="100"
    >
      <Flex w={{base:"90%", md:"90%"}} justifyContent="space-between" alignItems="center">
        <Link href="/" style={{textDecoration: 'inherit'}} fontWeight={400} passHref={true}>
          <Flex direction="row">
          <Image src="data:image/png;base64,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" alt="Logo" height={{base:"30px", md:"50px"}} width={{base:"50px", md:"80px"}} />
            {/* <Text ml={3} as="h1" fontSize="larger" color="white">
              The Convo Space
            </Text> */}
          </Flex>
        </Link>
        <Box display={{ base: "block", md: "none" }} onClick={toggle}>
          {isOpen ? <CloseIcon /> : <HamburgerIcon />}
        </Box>
        <Box
          display={{ base: isOpen ? "block" : "none", md: "block" }}
          >
          <Stack
            spacing={{base:2, md:32}}
            align="center"
            justifyContent="space-between"
            direction={{base:"column",md: "row"}}
            pt={[4, 4, 0, 0]}
            color="whiteAlpha.800"
            textShadow="2px 2px 16px #00000091"
            fontWeight="200"
            fontSize="20px"
            textTransform="uppercase"
          >
            <Link href="/explore" style={{textDecoration: 'inherit'}} _hover={{
              color: useColorModeValue("black", "white"),
            }}>
                Explore
            </Link>

            <Link href="/dashboard" style={{textDecoration: 'inherit'}} _hover={{
              color: useColorModeValue("black", "white"),
            }}>
                Dashboard
            </Link>

            <Text fontWeight="800" fontSize="25px" display={{base:"none", md:"inline"}}>
              Convo Space
            </Text>

            <Link rel="noreferrer" target="_blank" href="https://docs.theconvo.space" aria-label="Docs"
              style={{textDecoration: 'inherit'}}
              _hover={{
                color: useColorModeValue("black", "white"),
              }}
            >
              Docs
            </Link>

            <Link rel="noreferrer" target="_blank" href="https://blog.theconvo.space" aria-label="Blog"
              style={{textDecoration: 'inherit'}}
              _hover={{
                color: useColorModeValue("black", "white"),
              }}
            >
              Blog
            </Link>
          </Stack>
        </Box>
        <Tooltip hasArrow label={useColorModeValue("Switch to Dark Mode", "Switch to Light Mode")} aria-label="A tooltip">
            <IconButton
              icon={useColorModeValue(<MoonIcon color="white"/>, <SunIcon color="white"/>)}
              onClick={toggleColorMode}
              size="sm"
              rounded="md"
              aria-label="Toggle Theme"
              variant="ghost"
            />
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default NavBar;
