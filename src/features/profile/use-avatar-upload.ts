import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@convex-server/_generated/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAvatarUpload() {
	const generateUploadUrl = useConvexMutation(api.files.generateUploadUrl);
	const updateUserAvatar = useConvexMutation(api.files.updateUserAvatar);

	const uploadAvatar = useMutation({
		mutationFn: async ({
			file,
			userId,
		}: {
			file: File;
			userId: string;
		}) => {
			try {
				// Get the upload URL
				const uploadUrl = await generateUploadUrl();
				if (!uploadUrl) {
					throw new Error("Failed to get upload URL");
				}

				// Upload the file
				const result = await fetch(uploadUrl, {
					method: "POST",
					headers: {
						"Content-Type": file.type,
					},
					body: file,
				});

				if (!result.ok) {
					throw new Error("Failed to upload file");
				}

				// Get the storage ID from the response
				const { storageId } = await result.json();
				if (!storageId) {
					throw new Error("No storage ID returned");
				}

				// Update the user's avatar
				const avatarUrl = await updateUserAvatar({
					userId,
					storageId,
				});

				return avatarUrl;
			} catch (error) {
				console.error("Avatar upload error:", error);
				throw error;
			}
		},
		onError: (error) => {
			toast.error("Failed to upload avatar. Please try again.");
			console.error("Avatar upload error:", error);
		},
	});

	return uploadAvatar;
}
