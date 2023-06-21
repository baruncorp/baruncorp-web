"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hook/use-toast";

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email Address is required" })
    .email({ message: "Format of email address is incorrect" }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

export default function SigninPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "ejsvk3284@kakao.com",
      password: "WkdWkdaos123!",
    },
  });
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;
    if (email.split("@")[0] === password) {
      control.setError("password", {
        message: "Password cannot be a email address",
      });
      return;
    }

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response == null) {
      toast({ title: "Something went wrong", variant: "destructive" });
      return;
    }

    let { error: statusCode } = response;

    if (statusCode == null) {
      router.push("/");
      toast({ title: "Sign-in complete" });
      return;
    }

    const { success } = z
      .number()
      .min(400)
      .max(499)
      .safeParse(Number(statusCode));

    if (success) {
      toast({
        title: "Invalid email address or password",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Server error",
        description:
          "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Email Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" fullWidth={true} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </Form>
  );
}
