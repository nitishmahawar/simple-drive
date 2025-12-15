"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Google } from "@/components/icons/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SignInPage = () => {
  const signInMutation = useMutation({
    mutationFn: async () => {
      await signIn.social({
        provider: "google",
        callbackURL: "/drive",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign in with Google");
    },
  });

  return (
    <Card className="w-full max-w-104">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Image
            src="/logo.svg"
            alt="Simple Drive"
            width={64}
            height={64}
            priority
            className="size-12"
          />
        </div>
        <CardTitle className="text-lg">Welcome to Simple Drive</CardTitle>
        <CardDescription>
          Sign in to access your files from anywhere
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={() => signInMutation.mutate()}
          disabled={signInMutation.isPending}
        >
          {signInMutation.isPending ? <Spinner /> : <Google />}
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
};

export default SignInPage;
