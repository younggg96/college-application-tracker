import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
            College Application Tracker
          </span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-300"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-300"
            href="/register"
          >
            Register
          </Link>
        </nav>
      </header>
      {/* Hero Section */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container h-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-900 dark:text-white">
                Manage Your College Application Journey
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-400">
                A comprehensive college application management platform designed for students and parents. Track application progress, manage deadlines, and monitor admission results.
              </p>
            </div>
            <div className="space-x-4">
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                href="/register"
              >
                Get Started
              </Link>
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                href="/login"
              >
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 College Application Tracker. All rights reserved.
        </p>
      </footer>
    </>
  );
}
