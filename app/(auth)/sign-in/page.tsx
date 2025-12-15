"use client";

import { IconBrandGoogle, IconCloud } from "@tabler/icons-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SignInPage = () => {
  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/drive",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <IconCloud className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Welcome to Simple Drive</CardTitle>
        <CardDescription>
          Sign in to access your files from anywhere
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={handleGoogleSignIn}
        >
          <IconBrandGoogle />
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
};

export default SignInPage;
