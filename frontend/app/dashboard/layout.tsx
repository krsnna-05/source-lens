import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardLayout(props: LayoutProps<"/dashboard">) {
  return <AuthGuard>{props.children}</AuthGuard>;
}
