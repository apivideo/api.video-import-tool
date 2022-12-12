import { useEffect, useRef } from "react";

export const useInterval = (callback: () => Promise<boolean>, delay: number) => {
    const savedCallback = useRef<() => Promise<boolean>>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const tick = async () => {
            if (savedCallback.current) {
                if (await savedCallback.current()) {
                    setTimeout(() => tick(), delay);
                }
            }
        };
        tick();
    }, [delay]);
};