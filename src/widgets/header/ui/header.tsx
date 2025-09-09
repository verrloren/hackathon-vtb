"use client";

import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { MenuIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Container,
} from "@/shared";
import { useLogout } from "@/features/auth";
import { Logo } from "./logo";

export function Header() {
  const router = useRouter();
  const { handleLogout } = useLogout();

  const onLogout = async () => {
    await handleLogout()
      .then(() => {
        document.cookie =
          "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        toast.success("You have been logged out.");
        router.push("/auth/login");
        router.refresh();
      })
      .catch((error) => toast.error("Logout failed: " + error));
  };

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full h-24 z-10 absolute top-0 left-0
			 bg-transparent flex items-center justify-center"
    >
        <Container className="w-full flex items-center justify-between">
          <Logo />

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <MenuIcon
                aria-label="Menu"
                size={20}
                className={`transition-colors text-white/40 text-lg hover:text-white`}
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="mt-2 rounded-2xl bg-black border border-neutral-800 hover:border-neutral-50 transition-colors shadow-lg ">
              <DropdownMenuItem className="hover:bg-black cursor-pointer">
                <Button
                  variant="ghost"
                  className="w-full text-neutral-400"
                  onClick={onLogout}
                >
                  Sign out
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Container>
    </motion.header>
  );
}
