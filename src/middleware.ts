import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
  "/sign-in",
  "/sign-up",
  "/pricing",
  "/features",
  "/about",
  "/privacy",
  "/terms",
  "/support",
  "/fixtures(.*)",
  "/api/fixtures(.*)",
  "/calculators(.*)",
  "/design(.*)",
  "/spectrum(.*)",
  "/schedule(.*)",
  "/test-css",
  "/analytics(.*)",
  "/predictions(.*)",
  "/reports(.*)",
  "/templates(.*)",
  "/batch(.*)",
  "/settings(.*)",
  "/language(.*)",
  "/accessibility(.*)",
  "/integrations(.*)",
  "/sync(.*)",
  "/offline(.*)",
  "/pwa(.*)",
  "/api-docs(.*)",
  "/dev-tools(.*)",
  "/carbon-credits(.*)",
  "/iot-devices(.*)",
  "/leasing(.*)",
  "/forum(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth.protect();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};