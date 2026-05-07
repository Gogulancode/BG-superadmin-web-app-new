"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldOff,
  Smartphone,
  AlertCircle,
  Loader2,
  Monitor,
  Globe,
  Clock,
  Trash2,
  LogOut,
} from "lucide-react";

import {
  getMfaStatus,
  enrollMfa,
  verifyMfa,
  disableMfa,
  getSessions,
  revokeSession,
  revokeAllSessions,
  MfaStatusResponse,
  MfaEnrollResponse,
  Session,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/alert";
import { Badge } from "@/components/ui/badge";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/input-otp";

export default function SecuritySettingsPage() {
  const { toast } = useToast();

  // MFA State
  const [mfaStatus, setMfaStatus] = useState<MfaStatusResponse | null>(null);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [enrollData, setEnrollData] = useState<MfaEnrollResponse | null>(null);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  // Load MFA status
  useEffect(() => {
    async function loadMfaStatus() {
      try {
        const status = await getMfaStatus();
        setMfaStatus(status);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load MFA status",
          variant: "destructive",
        });
      } finally {
        setMfaLoading(false);
      }
    }
    loadMfaStatus();
  }, [toast]);

  // Load sessions
  useEffect(() => {
    async function loadSessions() {
      try {
        const response = await getSessions();
        setSessions(response.sessions);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load sessions",
          variant: "destructive",
        });
      } finally {
        setSessionsLoading(false);
      }
    }
    loadSessions();
  }, [toast]);

  // Start MFA enrollment
  async function handleEnrollMfa() {
    try {
      const data = await enrollMfa();
      setEnrollData(data);
      setShowEnrollDialog(true);
    } catch {
      toast({
        title: "Error",
        description: "Failed to start MFA enrollment",
        variant: "destructive",
      });
    }
  }

  // Verify MFA code
  async function handleVerifyMfa() {
    if (verifyCode.length !== 6) return;

    setVerifying(true);
    try {
      await verifyMfa(verifyCode);
      setMfaStatus({ isMfaEnabled: true });
      setShowEnrollDialog(false);
      setEnrollData(null);
      setVerifyCode("");
      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication is now active",
      });
    } catch {
      toast({
        title: "Invalid Code",
        description: "Please check your authenticator and try again",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  }

  // Disable MFA
  async function handleDisableMfa() {
    if (disableCode.length !== 6 || !disablePassword) return;

    setDisabling(true);
    try {
      await disableMfa({ code: disableCode, password: disablePassword });
      setMfaStatus({ isMfaEnabled: false });
      setShowDisableDialog(false);
      setDisableCode("");
      setDisablePassword("");
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been turned off",
      });
    } catch {
      toast({
        title: "Error",
        description: "Invalid code or password",
        variant: "destructive",
      });
    } finally {
      setDisabling(false);
    }
  }

  // Revoke a single session
  async function handleRevokeSession(id: string) {
    setRevokingId(id);
    try {
      await revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: "Session Revoked",
        description: "The session has been terminated",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      });
    } finally {
      setRevokingId(null);
    }
  }

  // Revoke all other sessions
  async function handleRevokeAllSessions() {
    setRevokingAll(true);
    try {
      await revokeAllSessions();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast({
        title: "Sessions Revoked",
        description: "All other sessions have been terminated",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to revoke sessions",
        variant: "destructive",
      });
    } finally {
      setRevokingAll(false);
    }
  }

  // Format date
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  // Get device icon
  function getDeviceIcon(userAgent: string) {
    if (userAgent.includes("Mobile")) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-foreground">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage two-factor authentication and active sessions
        </p>
      </section>

      {/* MFA Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mfaLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading MFA status...
            </div>
          ) : mfaStatus?.isMfaEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Enabled
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Your account is protected with 2FA
                </span>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDisableDialog(true)}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Disable MFA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication is not enabled. We recommend enabling
                  it for enhanced security.
                </AlertDescription>
              </Alert>
              <Button onClick={handleEnrollMfa}>
                <Smartphone className="mr-2 h-4 w-4" />
                Enable MFA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MFA Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (e.g., Google
              Authenticator, Authy)
            </DialogDescription>
          </DialogHeader>

          {enrollData && (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="rounded-lg border bg-white p-4">
                  <Image
                    src={enrollData.qrCode}
                    alt="MFA QR Code"
                    width={200}
                    height={200}
                    className="h-48 w-48"
                  />
                </div>
              </div>

              {/* Manual Entry */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Or enter this code manually:
                </p>
                <code className="block rounded bg-muted px-3 py-2 text-center font-mono text-sm break-all">
                  {enrollData.secret}
                </code>
              </div>

              {/* Verification */}
              <div className="space-y-4">
                <p className="text-sm text-center">
                  Enter the 6-digit code from your app to verify:
                </p>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verifyCode}
                    onChange={setVerifyCode}
                    disabled={verifying}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEnrollDialog(false);
                setEnrollData(null);
                setVerifyCode("");
              }}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyMfa}
              disabled={verifyCode.length !== 6 || verifying}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Enable"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MFA Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password and current TOTP code to disable MFA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Enter your password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                disabled={disabling}
              />
            </div>

            <div className="space-y-2">
              <Label>Authentication Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={disableCode}
                  onChange={setDisableCode}
                  disabled={disabling}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDisableDialog(false);
                setDisableCode("");
                setDisablePassword("");
              }}
              disabled={disabling}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableMfa}
              disabled={disableCode.length !== 6 || !disablePassword || disabling}
            >
              {disabling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                "Disable MFA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sessions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Devices where you&apos;re currently signed in
                </CardDescription>
              </div>
            </div>
            {sessions.filter((s) => !s.isCurrent).length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={revokingAll}>
                    {revokingAll ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Sign out all others
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out all other sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will terminate all sessions except the current one.
                      You&apos;ll need to sign in again on those devices.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRevokeAllSessions}>
                      Sign out all
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex gap-4">
                    <div className="rounded-lg bg-muted p-2">
                      {getDeviceIcon(session.userAgent || "")}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {session.userAgent
                            ? session.userAgent.split(" ")[0]
                            : "Unknown Device"}
                        </span>
                        {session.isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.ipAddress || "Unknown IP"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(session.lastActiveAt || session.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revokingId === session.id}
                    >
                      {revokingId === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
