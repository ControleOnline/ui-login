import SignInPage from "@controleonline/ui-login/src/react/pages/sign-in";
import CreateAccount from "@controleonline/ui-login/src/react/pages/create-account";
import ConfirmAccountPage from "@controleonline/ui-login/src/react/pages/confirm-account";
import ResetPasswordPage from "@controleonline/ui-login/src/react/pages/reset-password";
import ForcedChangePasswordPage from "@controleonline/ui-login/src/react/pages/forced-change-password";
import OauthDiscordCallback from "@controleonline/ui-login/src/react/pages/oauth-discord-callback";
const loginRoutes = [
  {
    name: "SignInPage",
    component: SignInPage,
    options: { headerShown: false, showBottomToolBar: false },
  },

  {
    name: "CreateAccount",
    component: CreateAccount,
    options: { headerShown: false, showBottomToolBar: false },
  },
  {
    name: "ConfirmAccountPage",
    path: "confirm-account",
    component: ConfirmAccountPage,
    options: { headerShown: false, showBottomToolBar: false },
  },
  {
    name: "ResetPasswordPage",
    path: "reset-password",
    component: ResetPasswordPage,
    options: { headerShown: false, showBottomToolBar: false },
  },
  {
    name: "ForcedChangePasswordPage",
    path: "forced-change-password",
    component: ForcedChangePasswordPage,
    options: { headerShown: false, showBottomToolBar: false },
  },
  {
    name: "OauthDiscordCallbackPage",
    path: "oauth/discord/callback",
    component: OauthDiscordCallback,
    options: { headerShown: false, showBottomToolBar: false },
  },

];

export default loginRoutes;
