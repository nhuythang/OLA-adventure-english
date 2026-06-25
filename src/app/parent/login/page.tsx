import { LoginForm } from "@/components/parent/login-form";

// Parent login. The middleware sends a signed-in parent straight to /parent and
// keeps unauthenticated deep links out, so this page only ever renders the form.
export default function ParentLoginPage() {
  return <LoginForm />;
}
