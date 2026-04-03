/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import "react-toastify/dist/ReactToastify.css";

import React from "react";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";

const ToastContainer = dynamic(() => import("react-toastify").then((mod) => mod.ToastContainer), { ssr: false });
export default function SessionLayout({ children, session }: { children: React.ReactNode; session: any }) {
  return (
    <SessionProvider session={session}>
      <main className="flex min-h-screen flex-col justify-between">
        <div className="flex flex-col w-full print-style min-h-screen">{children}</div>
      </main>
      <ToastContainer position="top-center" autoClose={5000} newestOnTop closeOnClick pauseOnHover />
    </SessionProvider>
  );
}
