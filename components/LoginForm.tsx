"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/components/snackbar/SnackbarProvider";
import { routes } from "@/lib/routes";

export default function LoginForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      const message = "Please enter your username and password.";
      setError(message);
      enqueueSnackbar(message, {
        variant: "error",
        duration: 5000,
      });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        const message = data.error ?? "Invalid username or password.";
        setError(message);
        enqueueSnackbar(message, {
          variant: "error",
          duration: 5000,
        });
        return;
      }
      enqueueSnackbar("Login successful.", {
        variant: "success",
        duration: 3000,
      });
      setError("");
      router.push(routes.auth.base.path);
      router.refresh();
    } catch {
      const message = "Unable to login. Please try again.";
      setError(message);
      enqueueSnackbar(message, {
        variant: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Username"
        className="w-full rounded-md border border-gray-300 p-3"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
      />
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full rounded-md border border-gray-300 p-3 pr-16"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      {error ? (
        <div className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f8d7da] p-4 text-center text-[#58151c]">
          <span aria-hidden>!</span>
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : null}
    </form>
  );
}
