import React from "react";
import { cn, withRef } from "@udecode/cn";
import { getHandler, PlateElement, useElement } from "@udecode/plate-common";
import { TMentionElement } from "@udecode/plate-mention";
import { useFocused, useSelected, useReadOnly } from "slate-react";

export const MentionElement = withRef<
  typeof PlateElement,
  {
    prefix?: string;
    onClick?: (mentionNode: any) => void;
    renderLabel?: (mentionable: TMentionElement) => string;
    size?: "default" | "sm";
  }
>(
  (
    {
      children,
      prefix,
      renderLabel,
      className,
      onClick,
      size = "default",
      ...props
    },
    ref
  ) => {
    const element = useElement<TMentionElement>();
    const selected = useSelected();
    const focused = useFocused();
    const isReadOnly = useReadOnly();

    return (
      <PlateElement
        ref={ref}
        className={cn(
          "inline-block cursor-pointer rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium",
          selected && focused && "ring-2 ring-ring",
          isReadOnly && "cursor-default",
          element.children[0].bold === true && "font-bold",
          element.children[0].italic === true && "italic",
          element.children[0].underline === true && "underline",
          size === "sm" && "text-xs",
          className
        )}
        data-slate-value={element.value}
        contentEditable={false}
        onClick={getHandler(onClick, element)}
        {...props}
      >
        {prefix}
        {renderLabel ? renderLabel(element) : element.value}
        {children}
      </PlateElement>
    );
  }
);
