import { createFormHook } from "@tanstack/react-form";

import {
	RadioGroup,
	Select,
	SubscribeButton,
	Switch,
	TextArea,
	TextField,
} from "./FormComponents";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		Select,
		TextArea,
		RadioGroup,
		Switch,
		// Add any additional field components needed for profile forms
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
