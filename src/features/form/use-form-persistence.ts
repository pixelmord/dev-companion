import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { useAppForm } from "./form";

export function useFormPersistence<
	TFieldValues extends Record<string, unknown>,
>({
	storageKey,
	onStateChange,
	form,
}: {
	storageKey: string;
	onStateChange?: (state: TFieldValues) => void;
	form: ReturnType<typeof useAppForm>;
}) {
	if (!form) {
		throw new Error("Form context is required for useFormPersistence");
	}
	const [isSaving, setIsSaving] = useState(false);
	const formState = form.state.values;

	// Restore form state from storage on mount
	useEffect(() => {
		const savedState = localStorage.getItem(storageKey);
		if (savedState) {
			try {
				const parsedState = JSON.parse(savedState) as TFieldValues;
				for (const [key, value] of Object.entries(parsedState)) {
					form.setFieldValue(
						key as keyof TFieldValues,
						value as TFieldValues[keyof TFieldValues],
					);
				}
			} catch (error) {
				console.error("Failed to restore form state:", error);
			}
		}
	}, [storageKey, form]);

	// Debounced save function
	const saveState = useDebouncedCallback(
		(state: TFieldValues) => {
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
