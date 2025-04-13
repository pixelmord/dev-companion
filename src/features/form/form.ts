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
	formContext,
	fieldContext,
	fieldComponents: {
		TextField,
		Select,
		TextArea,
		RadioGroup,
		Switch,
	},
	formComponents: {
		SubscribeButton,
	},
});
