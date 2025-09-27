import mitt from "mitt";
import { useEffect } from "react";

const emitter = mitt();

type SubscriptionEventMap = {
  "user-logout": undefined;
  "user-login": undefined;
};

export type SubscriptionEvents = keyof SubscriptionEventMap;

export function useSubscription(
  eventName: SubscriptionEvents,
  cb: (event: SubscriptionEventMap[SubscriptionEvents]) => void
): void {
  useEffect(() => {
    emitter.on(eventName as never, cb as never);
    return () => emitter.off(eventName as never, cb as never);
  });
}

export function notify(
  eventName: SubscriptionEvents,
  event: SubscriptionEventMap[SubscriptionEvents]
) {
  emitter.emit(eventName, event);
}
