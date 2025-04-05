import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useFormContext } from "./form-context";

export function useFormPersistence({
	storageKey,
	onStateChange,
}: {
	storageKey: string;
	onStateChange?: (state: unknown) => void;
}) {
	const form = useFormContext();
	const [isSaving, setIsSaving] = useState(false);
	const formState = form.state.values;

	// Restore form state from storage on mount
	useEffect(() => {
		const savedState = localStorage.getItem(storageKey);
		if (savedState) {
			try {
				const parsedState = JSON.parse(savedState) as Record<string, unknown>;
				for (const [key, value] of Object.entries(parsedState)) {
					form.setFieldValue(key as keyof typeof form.state.values, value);
				}
			} catch (error) {
				console.error("Failed to restore form state:", error);
			}
		}
	}, [storageKey, form]);

	// Debounced save function
	const saveState = useDebouncedCallback(
		(state: unknown) => {
			try {
				localStorage.setItem(storageKey, JSON.stringify(state));
				onStateChange?.(state);
				setIsSaving(false);
			} catch (error) {
				console.error("Failed to save form state:", error);
				setIsSaving(false);
			}
		},
		1000, // 1 second debounce
	);

	// Save form state when it changes
	useEffect(() => {
		setIsSaving(true);
		saveState(formState);
	}, [formState, saveState]);

	const clearSavedState = useCallback(() => {
		localStorage.removeItem(storageKey);
	}, [storageKey]);

	return {
		isSaving,
		clearSavedState,
	};
}
