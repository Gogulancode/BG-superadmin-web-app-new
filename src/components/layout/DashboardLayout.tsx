"use client";

import { ReactNode } from "react";
import AppLayout from "./AppLayout";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return <AppLayout>{children}</AppLayout>;
};

export default DashboardLayout;
