export const routes = [
  {
    path: "/",
    component: () =>
      import("@controleonline/ui-layout/src/layouts/MainLayout.vue"),
    children: [
      {
        name: "LoginIndex",
        path: "login",
        component: () => import("../pages/Login.vue"),
      },
      {
        name: "CreateUserIndex",
        path: "create-user",
        component: () => import("../pages/Login.vue"),
      },
      {
        name: "ForgotPassword",
        path: "forgot-password",
        component: () => import("../pages/Login.vue"),
      },
    ],
  },
];
