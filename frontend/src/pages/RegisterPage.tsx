import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LogoWordmark } from "@/components/ui/LogoWordmark";
import { useRegister } from "@/features/auth/useAuth";

export function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    register.mutate({ email, password, full_name: fullName });
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-secondary/5 via-surface to-tertiary/5 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="w-full max-w-sm p-8">
          <div className="mb-6 flex justify-center">
            <LogoWordmark />
          </div>
          <h1 className="mb-1 text-center font-display text-2xl font-bold text-ink">Create your account</h1>
          <p className="mb-6 text-center text-sm text-muted">
            Start discovering destinations and planning your next trip.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              name="full_name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ada Lovelace"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              pattern="(?=.*[A-Za-z])(?=.*\d).+"
              title="At least 8 characters, with at least one letter and one number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters, 1 letter & 1 number"
            />
            <Button type="submit" size="lg" disabled={register.isPending} className="mt-2">
              {register.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
