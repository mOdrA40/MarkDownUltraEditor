/**
 * @fileoverview Delete Account component for settings page
 * @author Axel Modra
 */

import { useAuth, useUser } from "@clerk/react-router";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { createUserCleanupService } from "@/services/userCleanup";

export const DeleteAccount: React.FC = () => {
  const confirmDeleteId = useId();
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user || confirmText !== "DELETE") return;

    setIsDeleting(true);
    try {
      // First cleanup user data in Supabase
      try {
        const supabaseClient = createClerkSupabaseClient(getToken);
        const cleanupService = createUserCleanupService(supabaseClient);
        const cleanupResult = await cleanupService.cleanupUserData(user.id);

        import("@/utils/console").then(({ safeConsole }) => {
          safeConsole.dev("User data cleanup result:", cleanupResult);
        });

        if (!cleanupResult.success && cleanupResult.errors.length > 0) {
          import("@/utils/console").then(({ safeConsole }) => {
            safeConsole.warn(
              "Some data cleanup errors occurred:",
              cleanupResult.errors
            );
          });
        }
      } catch (cleanupError) {
        import("@/utils/console").then(({ safeConsole }) => {
          safeConsole.error("Error cleaning up user data:", cleanupError);
        });
      }

      // Delete user account through Clerk
      await user.delete();
      navigate("/");
    } catch (error) {
      import("@/utils/console").then(({ safeConsole }) => {
        safeConsole.error("Error deleting account:", error);
      });
      alert("Failed to delete account. Please try again or contact support.");
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
      setConfirmText("");
    }
  };

  const isConfirmValid = confirmText === "DELETE";

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription className="text-red-600">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-white p-4">
            <h4 className="font-medium text-red-900 mb-2">
              What will be deleted:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Your user account and profile</li>
              <li>• All your markdown files and documents</li>
              <li>• All file versions and history</li>
              <li>• Session data and login history</li>
              <li>• Usage statistics and analytics</li>
              <li>• All settings and preferences</li>
            </ul>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Account
                </DialogTitle>
                <DialogDescription className="text-red-600">
                  This action is permanent and cannot be undone. All your data
                  will be permanently deleted.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This will permanently delete your
                    account and all associated data including:
                  </p>
                  <ul className="text-xs text-red-700 mt-2 space-y-1">
                    <li>• All markdown files and documents</li>
                    <li>• File versions and history</li>
                    <li>• Session data and preferences</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor={confirmDeleteId}
                    className="text-sm font-medium"
                  >
                    Type{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600">
                      DELETE
                    </code>{" "}
                    to confirm:
                  </Label>
                  <Input
                    id={confirmDeleteId}
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="border-red-200 focus:border-red-400"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setConfirmText("");
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={!isConfirmValid || isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
