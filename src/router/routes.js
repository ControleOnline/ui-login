export const routes = [
  {
    path: "/",
    component: () =>  import ("@controleonline/quasar-layout-ui/src/layouts/MainLayout.vue"),
    children: [
      {
        name: "LoginIndex",
        path: "login",
        component: () =>  import ("../pages/Login.vue"),
      },
    ],
  },
];
