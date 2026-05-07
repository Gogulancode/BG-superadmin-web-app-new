"use client";

import Link from "next/link";
import { ShieldCheck, User, Settings2 } from "lucide-react";

const sections = [
  {
    title: "Profile",
    description: "Future integration with /super-admin/profile endpoint",
    fields: [
      { label: "Name", value: "Super Admin" },
      { label: "Email", value: "superadmin@bridgegaps.app" },
    ],
  },
  {
    title: "Platform Preferences",
    description: "Coming soon: theme + notification toggles",
    fields: [
      { label: "Default Theme", value: "Light" },
      { label: "Digest Emails", value: "Weekly" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and platform settings.</p>
      </section>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/settings/security"
          className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/50 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Security</h3>
              <p className="text-sm text-muted-foreground">MFA & Sessions</p>
            </div>
          </div>
        </Link>

        <div className="rounded-xl border border-border bg-card p-5 opacity-50 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Profile</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 opacity-50 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Preferences</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            <p className="text-sm text-muted-foreground">{section.description}</p>
            <dl className="mt-4 space-y-3 text-sm">
              {section.fields.map((field) => (
                <div key={field.label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{field.label}</dt>
                  <dd className="font-medium text-foreground">{field.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-6">
        <h2 className="text-lg font-semibold text-foreground">Next steps</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Connect to real API mutations + optimistic UI.</li>
          <li>Lock down access via RBAC guard once auth is wired.</li>
          <li>Add audit trail hooks for critical setting updates.</li>
        </ul>
      </section>
    </div>
  );
}
