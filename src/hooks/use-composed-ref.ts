// 여러 ref 합성 hook
import { useCallback } from "react";
import type { Ref, RefCallback } from "react";

export function useComposedRef<T>(
    ...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
    return useCallback(
        (node: T | null) => {
            for (const ref of refs) {
                if (!ref) continue;
                if (typeof ref === "function") {
                    ref(node);
                } else {
                    (ref as React.MutableRefObject<T | null>).current = node;
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        refs
    );
}
