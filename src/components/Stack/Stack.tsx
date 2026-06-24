import { Children, type ReactNode } from "react"
import { View, type ViewProps, type ViewStyle } from "onejs-react"

export type StackDirection = "row" | "column"
export type StackAlign = "start" | "center" | "end" | "stretch"
export type StackJustify = "start" | "center" | "end" | "between" | "around"

export interface StackProps extends ViewProps {
  /** Main-axis direction. Default "column". */
  direction?: StackDirection
  /** Spacing between children, in px (applied as margin since UI Toolkit has no `gap`). Default 0. */
  gap?: number
  /** Cross-axis alignment. */
  align?: StackAlign
  /** Main-axis distribution. */
  justify?: StackJustify
  /** Allow wrapping. Default false. */
  wrap?: boolean
}

const ALIGN: Record<StackAlign, ViewStyle["alignItems"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
}

const JUSTIFY: Record<StackJustify, ViewStyle["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
}

/**
 * Flex container with a `gap`. UI Toolkit has no `gap` property, so spacing is
 * inserted as zero-content spacer elements between children. (Spacers, rather
 * than a margin cloned onto each child, so `gap` works for ANY child - including
 * custom components that don't forward `style`. Note: this adds N-1 elements;
 * for very large lists prefer explicit margins or a virtualized list.)
 */
export function Stack({
  direction = "column",
  gap = 0,
  align,
  justify,
  wrap,
  children,
  style,
  ...rest
}: StackProps) {
  const sizeProp = direction === "row" ? "width" : "height"
  const items = Children.toArray(children)
  const spaced: ReactNode[] =
    gap > 0
      ? items.flatMap((child, i) =>
          i === 0
            ? [child]
            : [<View key={`__ojs-gap-${i}`} style={{ [sizeProp]: gap, flexShrink: 0 }} />, child]
        )
      : items

  return (
    <View
      style={{
        flexDirection: direction,
        alignItems: align ? ALIGN[align] : undefined,
        justifyContent: justify ? JUSTIFY[justify] : undefined,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
      {...rest}
    >
      {spaced}
    </View>
  )
}

/** Horizontal Stack. */
export function HStack(props: Omit<StackProps, "direction">) {
  return <Stack direction="row" {...props} />
}

/** Vertical Stack. */
export function VStack(props: Omit<StackProps, "direction">) {
  return <Stack direction="column" {...props} />
}
