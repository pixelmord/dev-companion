import { createFormHook } from "@tanstack/react-form";

import {
	Select,
	SubscribeButton,
	TextArea,
	TextField,
} from "../components/FormComponents";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		Select,
		TextArea,
		// Add any additional field components needed for profile forms
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
