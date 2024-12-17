// app/providers.tsx or similar
import {NextUIProvider} from "@nextui-org/react";

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  );
}