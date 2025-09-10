import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserService } from "../modules/auth/services/user.service";

export function configurePassport() {
  const userService = new UserService();

  // Serialización y deserialización del usuario
  passport.serializeUser(function (user: any, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj: any, done) {
    done(null, obj);
  });
 
  // Estrategia de autenticación con Google
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        passReqToCallback: true,
        proxy: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          if (!profile.emails?.[0]?.value) {
            return done(new Error("No email found in Google profile"));
          }
          const googleUser = {
            googleId: profile.id,
            email: profile.emails[0].value.toLowerCase(),
            name: profile.displayName,
            avatar_url: profile.photos?.[0]?.value || null,
            provider: "google",
          };
          const existingUser = await userService.getByEmail(googleUser.email);
          if (existingUser) {
            if (
              googleUser.avatar_url &&
              existingUser.avatar_url !== googleUser.avatar_url
            ) {
              await userService.updateAvatar(
                existingUser.id,
                googleUser.avatar_url
              );
            }
            return done(null, {
              ...existingUser,
              isExisting: true,
              isBusiness: existingUser.is_business,
            });
          } else {
            return done(null, {
              ...googleUser,
              isExisting: false,
              isBusiness: false,
            });
          }
        } catch (error) {
          console.error("Error in Google Strategy:", error);
          return done(error as Error);
        }
      }
    )
  );
}