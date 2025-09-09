"use client";

import { z } from "zod";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTransition } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
	Button, 
	LoginSchema,
	CustomInput
} from "@/shared";
import { login, ExclamationMark } from "@/features/auth";


export function LoginForm() {

  const router = useRouter();
  const [isPending, setTransition] = useTransition();
	// const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setTransition(async () => {
      try {
        const { success } = await login(values);
				if (!success) {
          toast.error(`${success}`);
          return;
        }
					toast.success("Login successful!");
          router.push("/");
        
      } catch (error) {
        console.error('Login error:', error);
        toast.error("Login failed!");
      }
    });
  };

  return (
    <>
		
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="z-20 "
      >
				<h1 className="text-white font-poppins text-7xl xl:text-8xl">
          Welcome
        </h1>

      </motion.div>

      <Form {...form}>
        <form className="z-20 mt-8" onSubmit={form.handleSubmit(onSubmit)}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeInOut" }}
            className="w-[20rem] md:w-[25rem] z-20 xl:w-[30rem]  flex justify-center flex-col gap-y-6"
          >
						{/* EMAIL */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CustomInput
                      disabled={isPending}
                      type="email"
                      placeholder="email"
                      {...field}
                    />
                  </FormControl>
                  {form.formState.errors.email && (
                    <div className="flex flex-row items-end mt-4 gap-x-2">
                      <ExclamationMark />
                      <FormMessage className="text-xs text-neutral-600" />
                    </div>
                  )}
                </FormItem>
              )}
            />	

						{/* PASSWORD */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CustomInput
                      disabled={isPending}
                      type="password"
                      placeholder="password"
                      {...field}
                    />
                  </FormControl>
                  {form.formState.errors.password && (
                    <div className="flex flex-row items-end mt-4 gap-x-2">
                      <ExclamationMark />
                      <FormMessage className="text-xs text-neutral-600" />
                    </div>
                  )}
                </FormItem>
              )}
            />


            <Button
							className="w-full h-12"
              disabled={isPending}
              type="submit"
            >
              Submit
            </Button>
          </motion.div>
        </form>
      </Form>

      <motion.div
        className="fixed flex items-center justify-center bottom-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1, ease: "easeInOut" }}
      >
        <Link
          className="text-base font-semibold transition-colors duration-300 text-neutral-200 font-poppins hover:text-neutral-50"
          href="/auth/register"
        >
          create account
        </Link>
      </motion.div>
    </>
  );
}
