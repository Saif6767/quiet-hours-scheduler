"use client";

import AuthGuard from "./components/AuthGuard";
import TaskManager from "./components/TaskManager";

export default function Page() {
  return (
    <AuthGuard>
      <TaskManager />
    </AuthGuard>
  );
}
