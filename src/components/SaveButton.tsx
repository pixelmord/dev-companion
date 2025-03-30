import { Button, type ButtonProps } from "./ui/button";

export function SaveButton(props: ButtonProps) {
	return (
		<Button
			// this makes it so the button takes focus on clicks in safari I can't
			// remember if this is the proper workaround or not, it's been a while!
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#clicking_and_focus
			// https://bugs.webkit.org/show_bug.cgi?id=22261
			tabIndex={0}
			{...props}
		/>
	);
}
