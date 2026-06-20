"use client";

import dynamic from "next/dynamic";

export const AdminSidebar = dynamic(() => import("./AdminSidebar"), { ssr: false });
export const AdminNavbar = dynamic(() => import("./AdminNavbar"), { ssr: false });
