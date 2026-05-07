"use client";

import Image from "next/image";
import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Building2,
  Layers,
  Headphones,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Building2, label: "Tenants", path: "/tenants" },
  { icon: Layers, label: "Templates", path: "/templates" },
  { icon: Headphones, label: "Support", path: "/support" },
  { icon: CreditCard, label: "Subscriptions", path: "/subscriptions" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} border-r border-border bg-card flex flex-col transition-all duration-300 relative`}>
      <div className={`p-6 border-b border-border ${!isOpen && 'px-4'}`}>
        {isOpen ? (
          <Image
            src="/bridge_gaps_TM.png"
            alt="Bridging Gaps"
            width={120}
            height={48}
            className="h-12 w-auto"
            priority
          />
        ) : (
          <div className="h-12 flex items-center justify-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              BG
            </div>
          </div>
        )}
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${!isOpen && 'justify-center'}`}
                activeClassName="bg-primary/10 text-primary font-medium hover:bg-primary/15"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 bg-card border border-border rounded-full h-6 w-6 shadow-md hover:bg-muted z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </aside>
  );
};

export default Sidebar;
