import * as React from "react";

const VisuallyHidden = React.forwardRef<
	HTMLSpanElement,
	React.HTMLAttributes<HTMLSpanElement>
>(({ children, ...props }, ref) => {
	return (
		<span
			ref={ref}
			className="absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden whitespace-nowrap border-0"
			{...props}
		>
			{children}
		</span>
	);
});
VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
