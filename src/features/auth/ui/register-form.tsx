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
  RegisterSchema,
	CustomInput,
} from "@/shared";
import { register, ExclamationMark, AuthResponse } from "@/features/auth";

export function RegisterForm() {

  const [isPending, setTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setTransition(() => {
      register(values).then((data: AuthResponse) => {
        if ("error" in data) {
          toast.error(data.error);
          return;
        }
        if (data.success) {
          console.log(data.success);
          toast.success("Account created successfully!");
          router.push("/auth/login");
        } else if (data.response && data.response.includes("already exists")) {
          toast.error("User with this username already exists.");
        }
      });
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className=" z-20"
      >
        <h1 className="font-poppins text-7xl xl:text-8xl text-white">
          Sign up
        </h1>
      </motion.div>

      <Form {...form}>
        <form className="mt-8 z-20" onSubmit={form.handleSubmit(onSubmit)}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeInOut" }}
            className="w-[20rem] bg-transparent md:w-[25rem] xl:w-[30rem] flex justify-center flex-col gap-y-6"
          >
						{/* NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CustomInput
                      disabled={isPending}
                      placeholder="name"
                      {...field}
                    />
                  </FormControl>
                  {form.formState.errors.name && (
                    <div className="flex flex-row items-end gap-x-2 mt-4">
                      <ExclamationMark />
                      <FormMessage className="text-base font-libreFranklin text-neutral-600" />
                    </div>
                  )}
                </FormItem>
              )}
            />
						{/* EMAIL */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CustomInput
                      type="email"
                      placeholder="email"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  {form.formState.errors.email && (
                    <div className="flex flex-row items-end gap-x-2 mt-4">
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
                    <div className="flex flex-row items-end gap-x-2 mt-4">
                      <ExclamationMark />
                      <FormMessage className="text-xs text-neutral-600" />
                    </div>
                  )}
                </FormItem>
              )}
            />

            <Button
              type="submit"
							className="w-full h-12"
              disabled={isPending}
            >
              Create an account
            </Button>
          </motion.div>
        </form>
      </Form>

      <motion.div
        className="fixed bottom-12 flex justify-center font-semibold text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1, ease: "easeInOut" }}
      >
        <Link
          className="text-base text-neutral-200
				hover:text-neutral-50 transition-colors duration-300 "
          href="/auth/login"
        >
          already have one?
        </Link>
      </motion.div>
    </>
  );
}
