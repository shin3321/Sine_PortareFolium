// 반응형 breakpoint 감지 hook
import { useState, useEffect } from "react";

export function useIsBreakpoint(maxWidth: number = 480): boolean {
    const [isBelow, setIsBelow] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
        setIsBelow(mql.matches);

        const handler = (e: MediaQueryListEvent) => setIsBelow(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, [maxWidth]);

    return isBelow;
}
