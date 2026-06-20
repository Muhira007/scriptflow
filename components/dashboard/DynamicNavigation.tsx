"use client";

import dynamic from "next/dynamic";

export const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });
export const DashboardNavbar = dynamic(() => import("./DashboardNavbar"), { ssr: false });
